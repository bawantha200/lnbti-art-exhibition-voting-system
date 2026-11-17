import crypto from 'node:crypto'

export function generateOTP() {
  return String(crypto.randomInt(100000, 1000000))
}
