import multer from 'multer'

const allowedTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const storage = multer.memoryStorage()

function fileFilter(_request, file, callback) {
  if (!allowedTypes.has(file.mimetype)) {
    return callback(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image')
    )
  }

  callback(null, true)
}

export const artworkUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
})
