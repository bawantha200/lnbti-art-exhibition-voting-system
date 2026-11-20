import jwt from 'jsonwebtoken'
import 'dotenv/config'

export function requireAdmin(request, response, next) {
  try {
    const session = request.cookies?.admin_session

    if (!session) {
      return response.status(401).json({
        error: 'Admin authentication required.',
      })
    }

    const decoded = jwt.verify(
      session,
      process.env.JWT_SECRET
    )

    if (decoded.role !== 'admin') {
      return response.status(401).json({
        error: 'Invalid admin session.',
      })
    }

    next()
  } catch {
    return response.status(401).json({
      error: 'Admin authentication required.',
    })
  }
}