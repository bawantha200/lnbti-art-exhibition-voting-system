import { Router } from 'express'
import rateLimit from 'express-rate-limit'

import { requireAdmin } from '../middleware/adminMiddleware.js'
import { artworkUpload } from '../config/upload.js'

import {
  createArtworkController,
  updateArtworkController,
  deactivateArtworkController,
} from '../controllers/artworkController.js'

import {
  getLeaderboardController,
  getArtworkVotesController,
  getOverviewController,
  updateVotingStatusController,
  deleteArtworkController,
  adminLoginController,
  adminLogoutController,
} from '../controllers/adminController.js'

import { resetVotesController } from '../controllers/votingController.js'
import { asyncHandler } from '../utils/apiResponse.js'

const router = Router()

const adminLoginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
})

router.post('/login', adminLoginLimit, asyncHandler(adminLoginController))

router.use(requireAdmin)

router.post('/logout', asyncHandler(adminLogoutController))

router.get('/overview', asyncHandler(getOverviewController))
router.get('/leaderboard', asyncHandler(getLeaderboardController))

router.get(
  '/artworks/:id/votes',
  asyncHandler(getArtworkVotesController)
)

router.patch('/settings', asyncHandler(updateVotingStatusController))
router.post('/reset', asyncHandler(resetVotesController))

router.post(
  '/artworks',
  artworkUpload.single('image'),
  asyncHandler(createArtworkController)
)

router.patch(
  '/artworks/:id',
  artworkUpload.single('image'),
  asyncHandler(updateArtworkController)
)

router.patch(
  '/artworks/:id/deactivate',
  asyncHandler(deactivateArtworkController)
)

router.delete('/artworks/:id', asyncHandler(deleteArtworkController))

export default router
