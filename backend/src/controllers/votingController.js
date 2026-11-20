import { pool } from '../config/database.js'
import { sendSuccess, createHttpError } from '../utils/apiResponse.js'
import { submitVotes, resetVotingData } from '../services/votingService.js'

export async function getSettingsController(_request, response) {
  const result = await pool.query('SELECT is_open FROM voting_settings WHERE id = 1')
  return response.json(result.rows[0] || { is_open: false })
}

export async function submitVotesController(request, response) {
  const submittedIds = request.body.artworkIds
  if (!Array.isArray(submittedIds) || submittedIds.length < 1 || submittedIds.length > 3) throw createHttpError('Choose between 1 and 3 artworks.', 400)
  if (!submittedIds.every((id) => Number.isSafeInteger(id) && id > 0)) throw createHttpError('Artwork selections are invalid.', 400)
  if (new Set(submittedIds).size !== submittedIds.length) throw createHttpError('Artwork selections must be different.', 400)
  await submitVotes(request.student.email, submittedIds)
  response.clearCookie('student_session')
  return sendSuccess(response, { message: 'Votes submitted.' })
}

export async function resetVotesController(_request, response) {
  await resetVotingData()
  return sendSuccess(response, { message: 'Voting data reset.' })
}
// Get Public Live Leaderboard
export async function getPublicLeaderboardController(_request, response) {
  const result = await pool.query(`
    SELECT
      a.id,
      a.art_code,
      a.title,
      a.image_url,
      COUNT(v.id)::int AS total_votes
    FROM artworks a
    LEFT JOIN votes v ON v.artwork_id = a.id
    WHERE a.is_active = TRUE
    GROUP BY a.id
    ORDER BY total_votes DESC, a.art_code ASC
  `)

  return response.json(result.rows)
}


export async function getPublicLeaderboardController(_request, response) {
  const result = await pool.query(`
    WITH artwork_votes AS (
      SELECT
        a.id,
        a.art_code,
        a.title,
        a.image_url,
        COUNT(v.id)::int AS total_votes
      FROM artworks a
      LEFT JOIN votes v ON v.artwork_id = a.id
      WHERE a.is_active = TRUE
      GROUP BY a.id
    )
    SELECT
      id,
      art_code,
      title,
      image_url,
      CASE
        WHEN SUM(total_votes) OVER() = 0 THEN 0
        ELSE ROUND(
          total_votes * 100.0 / SUM(total_votes) OVER(),
          1
        )
      END AS percentage
    FROM artwork_votes
    ORDER BY total_votes DESC, art_code ASC
  `)

  return response.json(result.rows)
}
