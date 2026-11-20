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

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voting Verification Code</title>
</head>

<body style="margin:0; padding:0; background-color:#f7f5f0; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#f7f5f0; padding:35px 15px;">

    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:500px; background-color:#ffffff; border:1px solid #e5e1da;">

          <!-- Header -->
          <tr>
            <td style="padding:30px 30px 22px; text-align:center;">

              <div style="font-size:11px; font-weight:600; letter-spacing:2px; color:#171717;">
                LNBTI JAPANESE CLUB
              </div>

              <div style="width:35px; height:2px; background-color:#bc4749; margin:17px auto 0;"></div>

            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:20px 35px 35px;">

              <div style="font-size:10px; letter-spacing:2px; color:#bc4749; text-align:center; margin-bottom:13px;">
                ART EXHIBITION & COMPETITION
              </div>

              <h1 style="margin:0 0 15px; text-align:center; font-family:Georgia,serif; font-size:28px; font-weight:normal; color:#171717;">
                Verify Your Email
              </h1>

              <p style="margin:0 auto 28px; max-width:360px; text-align:center; color:#77716a; font-size:13px; line-height:1.8;">
                Thank you for participating in our art exhibition.
                Enter the verification code below to continue with voting.
              </p>

              <!-- OTP -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#f7f5f0; border:1px solid #e5e1da;">

                <tr>
                  <td style="padding:25px 15px; text-align:center;">

                    <div style="font-size:10px; letter-spacing:2px; color:#77716a; margin-bottom:13px;">
                      YOUR VERIFICATION CODE
                    </div>

                    <div style="font-family:Georgia,serif; font-size:36px; font-weight:bold; letter-spacing:9px; color:#bc4749; padding-left:9px;">
                      ${code}
                    </div>

                    <div style="font-size:11px; color:#77716a; margin-top:13px;">
                      Expires in <strong style="color:#171717;">5 minutes</strong>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Security -->
              <p style="margin:24px 0 0; color:#969089; font-size:11px; line-height:1.8; text-align:center;">
                Please do not share this code with anyone.
                If you did not request this code, you can ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 25px; border-top:1px solid #e5e1da; text-align:center;">

              <div style="font-size:10px; color:#77716a; letter-spacing:0.5px;">
                LNBTI Japanese Club
              </div>

              <div style="font-size:10px; color:#aaa39a; margin-top:7px;">
                Art Exhibition & Competition
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`

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
          subject: 'Your LNBTI Japanese Club Voting Code',
          textContent: `Your verification code is ${code}. It expires in 5 minutes. Please do not share this code with anyone.`,
          htmlContent,
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
