import jwt from 'jsonwebtoken'
import 'dotenv/config'

export function requireStudent(request, response, next) {
  try {
    const sessionToken = request.cookies?.student_session

    if (!sessionToken) {
      return response.status(401).json({
        error: 'Your voting session has expired.',
      })
    }

    const session = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET
    )

    if (!session.verified || !session.email) {
      return response.status(401).json({
        error: 'Your voting session has expired.',
      })
    }

    request.student = session

    next()
  } catch {
    return response.status(401).json({
      error: 'Your voting session has expired.',
    })
  }
}
