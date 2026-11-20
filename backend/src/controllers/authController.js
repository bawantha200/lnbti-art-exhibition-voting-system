import jwt from 'jsonwebtoken'
import { sendSuccess } from '../utils/apiResponse.js'
import { sendOTP, verifyOTP } from '../services/otpService.js'
import 'dotenv/config'

const normalizeEmail = (email) =>
  String(email || '').trim().toLowerCase()

const isInstitutionalEmail = (email) =>
  /^[^\s@]+@edu\.lnbti\.lk$/i.test(email)

// Send OTP
export async function sendOtpController(request, response) {
  const email = normalizeEmail(request.body.email)

  if (!isInstitutionalEmail(email)) {
    return response.status(400).json({
      error: 'Use an institutional email ending in @edu.lnbti.lk.',
    })
  }

  await sendOTP(email)

  return sendSuccess(response, {
    message: 'Verification code sent.',
  })
}

// Verify OTP
export async function verifyOtpController(request, response) {
  const email = normalizeEmail(request.body.email)
  const code = String(request.body.code || '')

  if (!isInstitutionalEmail(email) || !/^\d{6}$/.test(code)) {
    return response.status(400).json({
      error: 'Invalid verification details.',
    })
  }

  await verifyOTP(email, code)

  const session = jwt.sign(
    {
      email,
      verified: true,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    }
  )

  response.cookie('student_session', session, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 15 * 60 * 1000,
  })

  return sendSuccess(response, {
    message: 'Verified.',
  })
}
