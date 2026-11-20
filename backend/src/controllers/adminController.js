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

// Get Artwork Leaderboard
export async function getLeaderboardController(_request, response) {
  const result = await pool.query(`
    SELECT
      a.id,
      a.art_code,
      a.title,
      a.image_url,
      a.is_active,
      COUNT(v.id)::int AS total_votes
    FROM artworks a
    LEFT JOIN votes v ON v.artwork_id = a.id
    WHERE a.is_active = TRUE
    GROUP BY a.id
    ORDER BY total_votes DESC, a.art_code
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
