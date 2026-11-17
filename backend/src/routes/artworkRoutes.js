import { Router } from 'express'
import { listActiveArtworks } from '../controllers/artworkController.js'
import { asyncHandler } from '../utils/apiResponse.js'

const router = Router()
router.get('/', asyncHandler(listActiveArtworks))
export default router
