import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

const uploadDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads')
const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
])

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_request, file, callback) => callback(null, `${crypto.randomUUID()}${allowedTypes.get(file.mimetype) || ''}`),
})

function fileFilter(_request, file, callback) {
  if (!allowedTypes.has(file.mimetype)) return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'))
  callback(null, true)
}

export const artworkUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
})
