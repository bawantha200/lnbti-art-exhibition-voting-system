import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { sendOtpController, verifyOtpController } from '../controllers/authController.js'
import { asyncHandler } from '../utils/apiResponse.js'

const router = Router()
const otpLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7' })
router.post('/send-otp', otpLimit, asyncHandler(sendOtpController))
router.post('/verify-otp', otpLimit, asyncHandler(verifyOtpController))
export default router
