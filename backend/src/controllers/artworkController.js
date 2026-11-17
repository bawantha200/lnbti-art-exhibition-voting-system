import fs from 'node:fs/promises'
import { pool } from '../config/database.js'
import { sendSuccess, createHttpError } from '../utils/apiResponse.js'

const imageSignatures = {
  'image/jpeg': (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes) => bytes.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (bytes) => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
}

async function isRealImage(file) {
  const bytes = await fs.readFile(file.path)
  return Boolean(imageSignatures[file.mimetype]?.(bytes))
}

export async function listActiveArtworks(_request, response) {
  const result = await pool.query('SELECT id, art_code, title, image_url FROM artworks WHERE is_active = TRUE ORDER BY art_code')
  return response.json(result.rows)
}

export async function createArtworkController(request, response) {
  const artCode = String(request.body.artCode || '').trim().toUpperCase()
  const title = typeof request.body.title === 'string' ? request.body.title.trim().slice(0, 160) : null
  try {
    if (!request.file || !/^ART-\d{2,}$/.test(artCode)) throw createHttpError('A valid artwork code such as ART-01 and an image are required.', 400)
    if (!(await isRealImage(request.file))) throw createHttpError('The uploaded file is not a supported JPEG, PNG, or WEBP image.', 400)
    const imageUrl = `/uploads/${request.file.filename}`
    const result = await pool.query('INSERT INTO artworks (art_code, title, image_url) VALUES ($1, $2, $3) RETURNING *', [artCode, title || null, imageUrl])
    return sendSuccess(response, result.rows[0], 201)
  } catch (error) {
    if (request.file) await fs.unlink(request.file.path).catch(() => {})
    throw error
  }
}

export async function updateArtworkController(request, response) {
  const { id } = request.params
  const { title, isActive } = request.body
  if (title !== undefined && typeof title !== 'string') throw createHttpError('title must be text.', 400)
  if (isActive !== undefined && typeof isActive !== 'boolean') throw createHttpError('isActive must be a boolean.', 400)
  const result = await pool.query('UPDATE artworks SET title = COALESCE($1, title), is_active = COALESCE($2, is_active), updated_at = NOW() WHERE id = $3 RETURNING *', [typeof title === 'string' ? title.trim().slice(0, 160) : null, isActive, id])
  if (!result.rows[0]) throw createHttpError('Artwork not found.', 404)
  return response.json(result.rows[0])
}

export async function deactivateArtworkController(request, response) {
  const result = await pool.query('UPDATE artworks SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *', [request.params.id])
  if (!result.rows[0]) throw createHttpError('Artwork not found.', 404)
  return response.json(result.rows[0])
}
