import 'dotenv/config'

const requiredEnvironment = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_PASSWORD', 'GMAIL_USER', 'GMAIL_APP_PASSWORD']

export function validateEnvironment() {
  const missing = requiredEnvironment.filter((name) => !process.env[name]?.trim())
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters long.')
}

export const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
