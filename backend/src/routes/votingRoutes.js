import { Router } from 'express'
import {
  getSettingsController,
  getPublicLeaderboardController,
  submitVotesController,
} from '../controllers/votingController.js'
import { requireStudent } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../utils/apiResponse.js'

const router = Router()

// Public routes
router.get('/settings', asyncHandler(getSettingsController))
router.get('/leaderboard', asyncHandler(getPublicLeaderboardController))

// Protected voting route
router.post(
  '/votes',
  requireStudent,
  asyncHandler(submitVotesController)
)

export default router
