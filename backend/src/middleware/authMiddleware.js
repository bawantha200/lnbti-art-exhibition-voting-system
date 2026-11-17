import jwt from 'jsonwebtoken'
import 'dotenv/config'

export function requireStudent(request, response, next) {
  try {
    const session = jwt.verify(request.cookies.student_session, process.env.JWT_SECRET)
    if (!session.verified || !session.email) throw new Error('Invalid student session')
    request.student = session
    next()
  } catch {
    response.status(401).json({ error: 'Your voting session has expired.' })
  }
}
