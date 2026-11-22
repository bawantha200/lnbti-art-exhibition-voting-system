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

function getCloudinaryPublicId(imageUrl) {
  try {
    const pathname = new URL(imageUrl).pathname
    const match = pathname.match(
      /\/image\/upload\/(?:v\d+\/)?(.+)\.[^/.]+$/
    )

    return match?.[1] || null
  } catch {
    return null
  }
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

  const uploadedImage = await uploadToCloudinary(request.file)

  try {
    const result = await pool.query(
      `INSERT INTO artworks (art_code, title, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [artCode, title || null, uploadedImage.secure_url]
    )

    return sendSuccess(response, result.rows[0], 201)
  } catch (error) {
    await cloudinary.uploader
      .destroy(uploadedImage.public_id, {
        resource_type: 'image',
      })
      .catch(() => {})

    throw error
  }
}

// Update artwork details and optionally replace its image
export async function updateArtworkController(request, response) {
  const { id } = request.params
  const { title, artCode, isActive } = request.body

  if (!/^\d+$/.test(id)) {
    throw createHttpError('Invalid artwork ID.', 400)
  }

  if (title !== undefined && typeof title !== 'string') {
    throw createHttpError('title must be text.', 400)
  }

  if (artCode !== undefined && typeof artCode !== 'string') {
    throw createHttpError('artCode must be text.', 400)
  }

  let parsedIsActive

  if (isActive !== undefined) {
    if (typeof isActive === 'boolean') {
      parsedIsActive = isActive
    } else if (isActive === 'true' || isActive === 'false') {
      parsedIsActive = isActive === 'true'
    } else {
      throw createHttpError('isActive must be true or false.', 400)
    }
  }

  const normalizedCode =
    artCode === undefined
      ? undefined
      : artCode.trim().toUpperCase()

  if (
    normalizedCode !== undefined &&
    !/^ART-\d{2,}$/.test(normalizedCode)
  ) {
    throw createHttpError(
      'Use a valid artwork code such as ART-01.',
      400
    )
  }

  const normalizedTitle =
    title === undefined
      ? undefined
      : title.trim().slice(0, 160)

  if (
    normalizedTitle === undefined &&
    normalizedCode === undefined &&
    parsedIsActive === undefined &&
    !request.file
  ) {
    throw createHttpError('No artwork changes were provided.', 400)
  }

  if (request.file && !isRealImage(request.file)) {
    throw createHttpError(
      'The uploaded file is not a supported JPEG, PNG, or WEBP image.',
      400
    )
  }

  const existingResult = await pool.query(
    'SELECT * FROM artworks WHERE id = $1',
    [id]
  )

  const existingArtwork = existingResult.rows[0]

  if (!existingArtwork) {
    throw createHttpError('Artwork not found.', 404)
  }

  let uploadedImage = null

  if (request.file) {
    uploadedImage = await uploadToCloudinary(request.file)
  }

  try {
    const result = await pool.query(
      `UPDATE artworks
       SET art_code = COALESCE($1, art_code),
           title = COALESCE($2, title),
           is_active = COALESCE($3, is_active),
           image_url = COALESCE($4, image_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        normalizedCode ?? null,
        normalizedTitle ?? null,
        parsedIsActive ?? null,
        uploadedImage?.secure_url ?? null,
        id,
      ]
    )

    // Remove the previous Cloudinary image after a successful replacement.
    if (uploadedImage && existingArtwork.image_url) {
      const oldPublicId = getCloudinaryPublicId(
        existingArtwork.image_url
      )

      if (oldPublicId) {
        await cloudinary.uploader
          .destroy(oldPublicId, { resource_type: 'image' })
          .catch((error) => {
            console.error('Old artwork image cleanup failed:', error)
          })
      }
    }

    return response.json(result.rows[0])
  } catch (error) {
    if (uploadedImage) {
      await cloudinary.uploader
        .destroy(uploadedImage.public_id, {
          resource_type: 'image',
        })
        .catch(() => {})
    }

    throw error
  }
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
