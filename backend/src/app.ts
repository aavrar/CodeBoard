import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { authRoutes } from './routes/auth.js'
import oauthRoutes from './routes/oauth.js'
import researchRoutes from './routes/research.js'
import analyticsRoutes from './routes/analytics.js'
import liveAnalysisRoutes from './routes/liveAnalysis.js'
import { exampleRoutes } from './routes/examples.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { referenceRoutes } from './routes/reference.js'
import adminRoutes from './routes/admin.js'
import { nlpCache } from './services/cacheService.js'
import { fastTextService } from './services/fastTextService.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005'
  ],
  credentials: true
}))

// Rate limiting - Increased limits for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // increased to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use(morgan('combined'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'Server is running',
    error: null
  })
})

// Render keep-alive ping endpoint (optimized for minimal resource usage)
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: Math.floor(process.uptime())
  })
})

// Alternative ping endpoint for API consistency
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'alive',
      timestamp: Date.now(),
      uptime: Math.floor(process.uptime()),
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) // MB
    },
    message: 'Server keep-alive ping successful',
    error: null
  })
})

// Cache statistics endpoint for monitoring performance
app.get('/api/cache/stats', (req, res) => {
  try {
    const stats = nlpCache.getStats()
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: Date.now()
      },
      message: 'Cache statistics retrieved successfully',
      error: null
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve cache statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/oauth', oauthRoutes)
app.use('/api/research', researchRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/live-analysis', liveAnalysisRoutes)
app.use('/api/examples', exampleRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api', referenceRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: 'Endpoint not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Initialize FastText service
async function initializeServices() {
  console.log('🔤 Initializing FastText service...')
  const fastTextReady = await fastTextService.initialize()
  if (fastTextReady) {
    console.log('✅ FastText service ready')
  } else {
    console.log('⚠️ FastText service failed to initialize, will use ELD fallback')
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  
  // Initialize services after server starts
  await initializeServices()
})

export default app