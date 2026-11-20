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

import {
  notFoundHandler,
  errorHandler,
} from './middleware/errorMiddleware.js'

import { asyncHandler } from './utils/apiResponse.js'

const app = express()
const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

// Trust Render reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())

// Response compression
app.use(compression())

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

// Request body parsing
app.use(express.json({ limit: '1mb' }))

// Cookie parsing
app.use(cookieParser())

// Health check
app.get(
  '/api/health',
  asyncHandler(async (_request, response) => {
    await pool.query('SELECT 1')

    return response.json({
      ok: true,
      database: true,
    })
  })
)

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/artworks', artworkRoutes)
app.use('/api', votingRoutes)
app.use('/api/admin', adminRoutes)

// Static uploads
app.use(
  '/uploads',
  express.static(path.join(currentDirectory, '../uploads'))
)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
