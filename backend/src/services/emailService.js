import 'dotenv/config'
import { createHttpError } from '../utils/apiResponse.js'

export async function sendVotingOTP(email, code) {
  try {
    const apiKey = process.env.BREVO_API_KEY
    const senderEmail = process.env.BREVO_SENDER_EMAIL
    const senderName =
      process.env.BREVO_SENDER_NAME || 'LNBTI Japanese Club'

    if (!apiKey || !senderEmail) {
      console.error('Brevo environment variables are missing.')

      throw createHttpError(
        'Email service is not configured. Please try again later.',
        500
      )
    }

    const brevoResponse = await fetch(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email,
            },
          ],
          subject: 'Your LNBTI Japanese Club voting code',
          textContent: `Your verification code is ${code}. It expires in 5 minutes.`,
        }),
        signal: AbortSignal.timeout(15000),
      }
    )

    const result = await brevoResponse.json().catch(() => null)

    if (!brevoResponse.ok) {
      console.error('Brevo API error:', brevoResponse.status, result)

      throw createHttpError(
        'We could not deliver your verification code. Please try again.',
        502
      )
    }

    console.log('OTP email accepted by Brevo:', result?.messageId)

    return result
  } catch (error) {
    console.error('OTP email delivery failed:', error)

    if (error.status) {
      throw error
    }

    throw createHttpError(
      'We could not deliver your verification code. Please try again.',
      502
    )
  }
}
