import { pool } from '../config/database.js'
import { createHttpError } from '../utils/apiResponse.js'
import { generateOTP } from '../utils/generateOTP.js'
import { hashOTP, otpMatches } from '../utils/hashOTP.js'
import { sendVotingOTP } from './emailService.js'

export async function sendOTP(email) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('INSERT INTO voters (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email])
    const voter = await client.query('SELECT has_voted FROM voters WHERE email = $1 FOR UPDATE', [email])
    if (voter.rows[0]?.has_voted) throw createHttpError('You have already participated in this competition. Thank you!', 409)
    const otpRecord = await client.query('SELECT last_sent_at FROM otps WHERE email = $1 FOR UPDATE', [email])
    if (otpRecord.rows[0] && Date.now() - new Date(otpRecord.rows[0].last_sent_at).getTime() < 60_000) throw createHttpError('Please wait 60 seconds before requesting another code.', 429)
    const code = generateOTP()
    await client.query(`INSERT INTO otps (email, otp_hash, expires_at, attempts, last_sent_at) VALUES ($1, $2, NOW() + INTERVAL '5 minutes', 0, NOW()) ON CONFLICT (email) DO UPDATE SET otp_hash = EXCLUDED.otp_hash, expires_at = EXCLUDED.expires_at, attempts = 0, last_sent_at = EXCLUDED.last_sent_at`, [email, hashOTP(code)])
    await sendVotingOTP(email, code)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function verifyOTP(email, code) {
  const client = await pool.connect()
  let committed = false
  try {
    await client.query('BEGIN')
    const result = await client.query('SELECT otp_hash, expires_at, attempts FROM otps WHERE email = $1 FOR UPDATE', [email])
    const record = result.rows[0]
    if (!record || new Date(record.expires_at) < new Date()) throw createHttpError('This code has expired. Request a new one.', 400)
    if (record.attempts >= 5) throw createHttpError('Too many incorrect attempts. Request a new code.', 429)
    if (!otpMatches(code, record.otp_hash)) {
      await client.query('UPDATE otps SET attempts = attempts + 1 WHERE email = $1', [email])
      await client.query('COMMIT')
      committed = true
      throw createHttpError('Incorrect code.', 400)
    }
    await client.query('DELETE FROM otps WHERE email = $1', [email])
    await client.query('COMMIT')
    committed = true
  } catch (error) {
    if (!committed) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
