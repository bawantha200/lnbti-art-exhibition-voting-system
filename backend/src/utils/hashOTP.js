import crypto from 'node:crypto'
import 'dotenv/config'

export function hashOTP(value) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(value)).digest('hex')
}

export function otpMatches(value, storedHash) {
  const actual = Buffer.from(hashOTP(value), 'hex')
  const expected = Buffer.from(storedHash, 'hex')
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}
