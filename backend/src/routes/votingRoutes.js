import { Router } from 'express'
import {
  getSettingsController,
  submitVotesController,
  getPublicLeaderboardController,
} from '../controllers/votingController.js'
import { requireStudent } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../utils/apiResponse.js'

const router = Router()

router.get('/settings', asyncHandler(getSettingsController))

// Public leaderboard
router.get('/leaderboard', asyncHandler(getPublicLeaderboardController))

router.post('/votes', requireStudent, asyncHandler(submitVotesController))

export default router
