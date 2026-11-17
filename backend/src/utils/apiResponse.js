export function sendSuccess(response, data = {}, status = 200) {
  return response.status(status).json(data)
}

export function createHttpError(message, status = 500) {
  const error = new Error(message)
  error.status = status
  return error
}

export function asyncHandler(handler) {
  return (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next)
}
