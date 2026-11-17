import { pool } from '../config/database.js'
import { createHttpError } from '../utils/apiResponse.js'

export async function submitVotes(email, artworkIds) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const setting = await client.query('SELECT is_open FROM voting_settings WHERE id = 1 FOR UPDATE')
    if (!setting.rows[0]?.is_open) throw createHttpError('Voting is currently closed.', 403)
    const voter = await client.query('SELECT has_voted FROM voters WHERE email = $1 FOR UPDATE', [email])
    if (!voter.rows[0] || voter.rows[0].has_voted) throw createHttpError('You have already participated in this competition. Thank you!', 409)
    const active = await client.query('SELECT id FROM artworks WHERE id = ANY($1::bigint[]) AND is_active = TRUE', [artworkIds])
    if (active.rows.length !== artworkIds.length) throw createHttpError('One or more selected artworks are no longer available.', 400)
    await client.query('INSERT INTO votes (voter_email, artwork_id) SELECT $1, selected.artwork_id FROM unnest($2::bigint[]) AS selected(artwork_id)', [email, artworkIds])
    await client.query('UPDATE voters SET has_voted = TRUE, voted_at = NOW() WHERE email = $1', [email])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function resetVotingData() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM votes')
    await client.query('DELETE FROM otps')
    await client.query('UPDATE voters SET has_voted = FALSE, voted_at = NULL')
    await client.query('UPDATE voting_settings SET is_open = FALSE, updated_at = NOW() WHERE id = 1')
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
