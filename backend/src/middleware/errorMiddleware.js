export function notFoundHandler(_request, response) {
  response.status(404).json({ error: 'Route not found.' })
}

export function errorHandler(error, _request, response, _next) {
  console.error('Request error:', error)
  if (error.code === '23505') return response.status(409).json({ error: 'That record already exists.' })
  if (error.code === 'LIMIT_FILE_SIZE') return response.status(413).json({ error: 'The uploaded image is too large.' })
  if (error.code === 'LIMIT_UNEXPECTED_FILE') return response.status(400).json({ error: 'Only one JPEG, PNG, or WEBP image is allowed.' })
  response.status(error.status || 500).json({ error: error.status ? error.message : 'Something went wrong on the server.' })
}
