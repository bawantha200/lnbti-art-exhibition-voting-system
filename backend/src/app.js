import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { pool } from './config/database.js'
import { clientOrigins } from './config/environment.js'
import authRoutes from './routes/authRoutes.js'
import artworkRoutes from './routes/artworkRoutes.js'
import votingRoutes from './routes/votingRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js'
import { asyncHandler } from './utils/apiResponse.js'

const app = express()
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

app.use(helmet())
app.use(compression())
app.use(cors({ origin: (origin, callback) => callback(null, !origin || clientOrigins.includes(origin)), credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.get('/api/health', asyncHandler(async (_request, response) => {
  await pool.query('SELECT 1')
  response.json({ ok: true, database: true })
}))
app.use('/api/auth', authRoutes)
app.use('/api/artworks', artworkRoutes)
app.use('/api', votingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/uploads', express.static(path.join(currentDirectory, '../uploads')))
app.use(notFoundHandler)
app.use(errorHandler)

export default app
