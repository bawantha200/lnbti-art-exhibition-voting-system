import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'
import { sendSuccess, createHttpError } from '../utils/apiResponse.js'
import 'dotenv/config'

// Admin Login
export function adminLoginController(request, response) {
  if (
    !process.env.ADMIN_PASSWORD ||
    request.body.password !== process.env.ADMIN_PASSWORD
  ) {
    return response.status(401).json({
      error: 'Invalid admin password.',
    })
  }

  const session = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  )

  response.cookie('admin_session', session, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 12 * 60 * 60 * 1000,
  })

  return sendSuccess(response, {
    message: 'Signed in.',
  })
}

// Admin Logout
export function adminLogoutController(_request, response) {
  response.clearCookie('admin_session', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  })

  return sendSuccess(response, {
    message: 'Signed out.',
  })
}

// Get Admin Dashboard Overview
export async function getOverviewController(_request, response) {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM voters
       WHERE verified_at IS NOT NULL) AS registered_voters,

      (SELECT COUNT(*) FROM voters
       WHERE has_voted = TRUE) AS students_voted,

      (SELECT COUNT(*) FROM votes) AS total_votes,

      (SELECT COUNT(*) FROM artworks
       WHERE is_active = TRUE) AS active_artworks
  `)

  return response.json(result.rows[0])
}

// Get Voter Details
export async function getVotersController(_request, response) {
  const [votersResult, summaryResult] = await Promise.all([
    pool.query(`
      SELECT
        v.id,
        v.email,
        v.created_at,
        v.verified_at,
        v.has_voted,
        v.voted_at,

        COUNT(vt.id)::int AS vote_count,

        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'artwork_id', a.id,
              'art_code', a.art_code,
              'title', a.title,
              'vote_created_at', vt.created_at
            )
            ORDER BY vt.created_at
          ) FILTER (WHERE vt.id IS NOT NULL),
          '[]'::json
        ) AS votes

      FROM voters v
      LEFT JOIN votes vt ON vt.voter_email = v.email
      LEFT JOIN artworks a ON a.id = vt.artwork_id

      GROUP BY v.id
      ORDER BY v.created_at DESC
    `),

    pool.query(`
      SELECT
        COUNT(*)::int AS total_voters,

        COUNT(*) FILTER (
          WHERE verified_at IS NOT NULL
        )::int AS verified_voters,

        COUNT(*) FILTER (
          WHERE verified_at IS NULL
        )::int AS unverified_voters,

        COUNT(*) FILTER (
          WHERE has_voted = TRUE
        )::int AS voted_voters,

        COUNT(*) FILTER (
          WHERE has_voted = FALSE
        )::int AS not_voted_voters

      FROM voters
    `),
  ])

  return response.json({
    summary: summaryResult.rows[0],
    voters: votersResult.rows,
  })
}

// Get Artwork Leaderboard
export async function getLeaderboardController(_request, response) {
  const result = await pool.query(`
    SELECT
      a.id,
      a.art_code,
      a.title,
      a.image_url,
      a.is_active,
      a.created_at,
      a.updated_at,
      COUNT(v.id)::int AS total_votes
    FROM artworks a
    LEFT JOIN votes v ON v.artwork_id = a.id
    GROUP BY a.id
    ORDER BY a.created_at DESC, a.art_code
  `)

  return response.json(result.rows)
}

// Update Voting Status
export async function updateVotingStatusController(request, response) {
  if (typeof request.body.isOpen !== 'boolean') {
    throw createHttpError('isOpen must be a boolean.', 400)
  }

  await pool.query(
    'UPDATE voting_settings SET is_open = $1, updated_at = NOW() WHERE id = 1',
    [request.body.isOpen]
  )

  return sendSuccess(response, {
    message: 'Voting status updated.',
  })
}

// Delete Artwork (Soft Delete)
export async function deleteArtworkController(request, response) {
  const result = await pool.query(
    `UPDATE artworks
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [request.params.id]
  )

  if (!result.rows[0]) {
    throw createHttpError('Artwork not found.', 404)
  }

  return response.json(result.rows[0])
}

// Get Artwork Votes
export async function getArtworkVotesController(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id)) {
    throw createHttpError('Invalid artwork ID.', 400)
  }

  const artworkResult = await pool.query(
    'SELECT id FROM artworks WHERE id = $1',
    [id]
  )

  if (!artworkResult.rows[0]) {
    throw createHttpError('Artwork not found.', 404)
  }

  const result = await pool.query(
    `SELECT
       v.voter_email AS email,
       v.created_at AS voted_at
     FROM votes v
     INNER JOIN voters s ON s.email = v.voter_email
     WHERE v.artwork_id = $1
     ORDER BY v.created_at DESC`,
    [id]
  )

  return response.json({
    total_votes: result.rows.length,
    voters: result.rows,
  })
}
