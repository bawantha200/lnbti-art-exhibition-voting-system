
import { test, expect } from '@playwright/test'
import { createRequire } from 'node:module'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const backendRequire = createRequire(
  path.resolve(process.cwd(), 'backend/package.json')
)

backendRequire('dotenv').config({
  path: path.resolve(process.cwd(), 'backend/.env'),
})

if (!process.env.TEST_DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error('Test database or JWT configuration is missing.')
}

const { Pool } = backendRequire('pg')
const jwt = backendRequire('jsonwebtoken')

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const API_URL = 'http://127.0.0.1:5001'
const createdEmails = []
const createdArtworkIds = []

let originalVotingStatus

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  const result = await pool.query(
    'SELECT is_open FROM voting_settings WHERE id = 1'
  )

  if (!result.rows[0]) {
    throw new Error('Voting settings record (id = 1) was not found.')
  }

  originalVotingStatus = result.rows[0].is_open
})

test.beforeEach(async () => {
  await pool.query(
    'UPDATE voting_settings SET is_open = TRUE WHERE id = 1'
  )
})

async function createScenario({ hasVoted = false } = {}) {
  const email = `pw-vote-${randomUUID()}@edu.lnbti.lk`

  await pool.query(
    `INSERT INTO voters (email, has_voted, verified_at)
     VALUES ($1, $2, NOW())`,
    [email, hasVoted]
  )

  createdEmails.push(email)

  const artworkIds = []

  for (let i = 1; i <= 4; i++) {
    const result = await pool.query(
      `INSERT INTO artworks (art_code, title, image_url, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        `PW-${randomUUID()}`,
        `Playwright Test Artwork ${i}`,
        'https://example.com/test-artwork.jpg',
        i !== 4,
      ]
    )

    artworkIds.push(Number(result.rows[0].id))
    createdArtworkIds.push(Number(result.rows[0].id))
  }

  const token = jwt.sign(
    { email, verified: true },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  return { email, artworkIds, token }
}

async function submitVotes(request, token, artworkIds) {
  return request.post(`${API_URL}/api/votes`, {
    headers: token
      ? { Cookie: `student_session=${token}` }
      : {},
    data: { artworkIds },
  })
}

test.afterEach(async () => {
  for (const email of createdEmails.splice(0)) {
    await pool.query(
      'DELETE FROM votes WHERE voter_email = $1',
      [email]
    )

    await pool.query(
      'DELETE FROM voters WHERE email = $1',
      [email]
    )
  }

  for (const id of createdArtworkIds.splice(0)) {
    await pool.query(
      'DELETE FROM votes WHERE artwork_id = $1',
      [id]
    )

    await pool.query(
      'DELETE FROM artworks WHERE id = $1',
      [id]
    )
  }
})

test.afterAll(async () => {
  if (originalVotingStatus !== undefined) {
    await pool.query(
      'UPDATE voting_settings SET is_open = $1 WHERE id = 1',
      [originalVotingStatus]
    )
  }

  await pool.end()
})

test('successfully submits votes for selected artworks', async ({ request }) => {
  const { email, artworkIds, token } = await createScenario()

  const response = await submitVotes(
    request,
    token,
    artworkIds.slice(0, 2)
  )

  expect(response.status()).toBe(200)

  const voter = await pool.query(
    'SELECT has_voted FROM voters WHERE email = $1',
    [email]
  )

  expect(voter.rows[0].has_voted).toBe(true)

  const votes = await pool.query(
    'SELECT artwork_id FROM votes WHERE voter_email = $1',
    [email]
  )

  expect(votes.rowCount).toBe(2)
})

test('rejects vote submission when voting is closed', async ({ request }) => {
  const { token, artworkIds } = await createScenario()

  await pool.query(
    'UPDATE voting_settings SET is_open = FALSE WHERE id = 1'
  )

  const response = await submitVotes(
    request,
    token,
    [artworkIds[0]]
  )

  expect(response.status()).toBe(403)
})

test('rejects a student who has already voted', async ({ request }) => {
  const { token, artworkIds } = await createScenario({
    hasVoted: true,
  })

  const response = await submitVotes(
    request,
    token,
    [artworkIds[0]]
  )

  expect(response.status()).toBe(409)
})

test('rejects inactive artwork selections', async ({ request }) => {
  const { token, artworkIds } = await createScenario()

  const response = await submitVotes(
    request,
    token,
    [artworkIds[0], artworkIds[3]]
  )

  expect(response.status()).toBe(400)
})

test('rejects invalid artwork IDs', async ({ request }) => {
  const { token } = await createScenario()

  const response = await submitVotes(
    request,
    token,
    ['invalid-id']
  )

  expect(response.status()).toBe(400)
})

test('rejects duplicate artwork selections', async ({ request }) => {
  const { token, artworkIds } = await createScenario()

  const response = await submitVotes(
    request,
    token,
    [artworkIds[0], artworkIds[0]]
  )

  expect(response.status()).toBe(400)
})

test('rejects an empty artwork selection', async ({ request }) => {
  const { token } = await createScenario()

  const response = await submitVotes(request, token, [])

  expect(response.status()).toBe(400)
})

test('rejects more than three artwork selections', async ({ request }) => {
  const { token, artworkIds } = await createScenario()

  const response = await submitVotes(
    request,
    token,
    artworkIds
  )

  expect(response.status()).toBe(400)
})

test('rejects vote submission without a student session', async ({ request }) => {
  const { artworkIds } = await createScenario()

  const response = await submitVotes(
    request,
    null,
    [artworkIds[0]]
  )

  expect(response.status()).toBe(401)
})
