import { test, expect } from '@playwright/test'
import { createRequire } from 'node:module'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const backendRequire = createRequire(
  path.resolve(process.cwd(), 'backend/package.json')
)

// Load backend environment variables
backendRequire('dotenv').config({
  path: path.resolve(process.cwd(), 'backend/.env'),
})

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is missing.')
}

const { Pool } = backendRequire('pg')
const { hashOTP } = await import('../backend/src/utils/hashOTP.js')

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const API_URL = 'http://127.0.0.1:5001'

async function createOtpRecord({
  code = '123456',
  attempts = 0,
  expired = false,
} = {}) {
  const email = `pw-test-${randomUUID()}@edu.lnbti.lk`

  await pool.query(
    'INSERT INTO voters (email) VALUES ($1)',
    [email]
  )

  const expiresAt = expired
    ? new Date(Date.now() - 60_000)
    : new Date(Date.now() + 5 * 60_000)

  await pool.query(
    `INSERT INTO otps
      (email, otp_hash, expires_at, attempts, last_sent_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [email, hashOTP(code), expiresAt, attempts]
  )

  return email
}

async function cleanup(email) {
  await pool.query('DELETE FROM otps WHERE email = $1', [email])
  await pool.query('DELETE FROM voters WHERE email = $1', [email])
}

test.afterAll(async () => {
  await pool.end()
})

test('accepts a correct OTP and creates a student session', async ({ request }) => {
  const email = await createOtpRecord()

  try {
    const response = await request.post(`${API_URL}/api/auth/verify-otp`, {
      data: { email, code: '123456' },
    })

    expect(response.status()).toBe(200)
    expect(response.headers()['set-cookie']).toContain('student_session')

    const voter = await pool.query(
      'SELECT verified_at FROM voters WHERE email = $1',
      [email]
    )

    expect(voter.rows[0].verified_at).not.toBeNull()

    const otp = await pool.query(
      'SELECT email FROM otps WHERE email = $1',
      [email]
    )

    expect(otp.rowCount).toBe(0)
  } finally {
    await cleanup(email)
  }
})

test('rejects an incorrect OTP', async ({ request }) => {
  const email = await createOtpRecord()

  try {
    const response = await request.post(`${API_URL}/api/auth/verify-otp`, {
      data: { email, code: '654321' },
    })

    expect(response.status()).toBe(400)

    const result = await pool.query(
      'SELECT attempts FROM otps WHERE email = $1',
      [email]
    )

    expect(result.rows[0].attempts).toBe(1)
  } finally {
    await cleanup(email)
  }
})

test('rejects an expired OTP', async ({ request }) => {
  const email = await createOtpRecord({ expired: true })

  try {
    const response = await request.post(`${API_URL}/api/auth/verify-otp`, {
      data: { email, code: '123456' },
    })

    expect(response.status()).toBe(400)
  } finally {
    await cleanup(email)
  }
})

test('blocks verification after five incorrect attempts', async ({ request }) => {
  const email = await createOtpRecord({ attempts: 5 })

  try {
    const response = await request.post(`${API_URL}/api/auth/verify-otp`, {
      data: { email, code: '123456' },
    })

    expect(response.status()).toBe(429)
  } finally {
    await cleanup(email)
  }
})

test('rejects verification when OTP is missing', async ({ request }) => {
  const email = `pw-test-${randomUUID()}@edu.lnbti.lk`

  const response = await request.post(`${API_URL}/api/auth/verify-otp`, {
    data: { email, code: '' },
  })

  expect(response.status()).toBe(400)
})

test('rejects an email from an unauthorized domain', async ({ request }) => {
  const response = await request.post(`${API_URL}/api/auth/verify-otp`, {
    data: {
      email: 'student@gmail.com',
      code: '123456',
    },
  })

  expect(response.status()).toBe(400)
})
