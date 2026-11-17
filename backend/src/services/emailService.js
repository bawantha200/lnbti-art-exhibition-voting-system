import { mailer } from '../config/email.js'
import { createHttpError } from '../utils/apiResponse.js'

export async function sendVotingOTP(email, code) {
  try {
    await mailer.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your LNBTI Japanese Club voting code',
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
    })
  } catch (error) {
    console.error('OTP email delivery failed:', error)
    throw createHttpError('We could not deliver your verification code. Please try again.', 502)
  }
}
