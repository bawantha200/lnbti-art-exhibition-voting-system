import jwt from 'jsonwebtoken'
import 'dotenv/config'

export function requireAdmin(request, response, next) {
  try {
    const session = jwt.verify(request.cookies.admin_session, process.env.JWT_SECRET)
    if (session.role !== 'admin') throw new Error('Invalid admin session')
    next()
  } catch {
    response.status(401).json({ error: 'Admin authentication required.' })
  }
}
