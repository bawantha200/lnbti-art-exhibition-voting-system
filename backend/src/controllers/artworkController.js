import { pool } from '../config/database.js'
import cloudinary from '../config/cloudinary.js'
import { sendSuccess, createHttpError } from '../utils/apiResponse.js'

const imageSignatures = {
  'image/jpeg': (bytes) =>
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff,

  'image/png': (bytes) =>
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    ),

  'image/webp': (bytes) =>
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP',
}

function isRealImage(file) {
  if (!file?.buffer) return false

  const signatureCheck = imageSignatures[file.mimetype]

  return Boolean(signatureCheck?.(file.buffer))
}

async function uploadToCloudinary(file) {
  const base64Image = file.buffer.toString('base64')

  const dataUri = `data:${file.mimetype};base64,${base64Image}`

  return cloudinary.uploader.upload(dataUri, {
    folder: 'lnbti-art-exhibition/artworks',
    resource_type: 'image',
  })
}

export async function listActiveArtworks(_request, response) {
  const result = await pool.query(
    `SELECT id, art_code, title, image_url
     FROM artworks
     WHERE is_active = TRUE
     ORDER BY art_code`
  )

  return response.json(result.rows)
}

export async function createArtworkController(request, response) {
  const artCode = String(request.body.artCode || '')
    .trim()
    .toUpperCase()

  const title =
    typeof request.body.title === 'string'
      ? request.body.title.trim().slice(0, 160)
      : null

  if (!request.file || !/^ART-\d{2,}$/.test(artCode)) {
    throw createHttpError(
      'A valid artwork code such as ART-01 and an image are required.',
      400
    )
  }

  if (!isRealImage(request.file)) {
    throw createHttpError(
      'The uploaded file is not a supported JPEG, PNG, or WEBP image.',
      400
    )
  }

  // Upload image to Cloudinary
  const uploadedImage = await uploadToCloudinary(request.file)

  try {
    // Save Cloudinary URL in Neon database
    const result = await pool.query(
      `INSERT INTO artworks (art_code, title, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        artCode,
        title || null,
        uploadedImage.secure_url,
      ]
    )

    return sendSuccess(response, result.rows[0], 201)
  } catch (error) {
    // Remove Cloudinary image if database insertion fails
    await cloudinary.uploader
      .destroy(uploadedImage.public_id, {
        resource_type: 'image',
      })
      .catch(() => {})

    throw error
  }
}

export async function updateArtworkController(request, response) {
  const { id } = request.params
  const { title, isActive } = request.body

  if (title !== undefined && typeof title !== 'string') {
    throw createHttpError('title must be text.', 400)
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw createHttpError('isActive must be a boolean.', 400)
  }

  const result = await pool.query(
    `UPDATE artworks
     SET title = COALESCE($1, title),
         is_active = COALESCE($2, is_active),
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [
      typeof title === 'string' ? title.trim().slice(0, 160) : null,
      isActive,
      id,
    ]
  )

  if (!result.rows[0]) {
    throw createHttpError('Artwork not found.', 404)
  }

  return response.json(result.rows[0])
}

export async function deactivateArtworkController(request, response) {
  const result = await pool.query(
    `UPDATE artworks
     SET is_active = FALSE,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [request.params.id]
  )

  if (!result.rows[0]) {
    throw createHttpError('Artwork not found.', 404)
  }

  return response.json(result.rows[0])
}
