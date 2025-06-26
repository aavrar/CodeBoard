import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, exampleSubmissionSchema } from '../types'
import { asyncHandler } from '../middleware/errorHandler'

const prisma = new PrismaClient()
export const exampleRoutes = Router()

// GET /api/examples - Retrieve examples with optional filtering
exampleRoutes.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    searchTerm, 
    languages, 
    region, 
    platform,
    startDate,
    endDate 
  } = req.query
  
  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const skip = (pageNum - 1) * limitNum

  // Build where clause for filtering
  const where: any = {}

  // Text search
  if (searchTerm) {
    where.OR = [
      { text: { contains: searchTerm as string, mode: 'insensitive' } },
      { context: { contains: searchTerm as string, mode: 'insensitive' } }
    ]
  }

  // Language filtering
  if (languages) {
    const languageArray = typeof languages === 'string' ? [languages] : languages as string[]
    where.languages = { hasSome: languageArray }
  }

  // Region filtering
  if (region) {
    where.region = region as string
  }

  // Platform filtering  
  if (platform) {
    where.platform = platform as string
  }

  // Date range filtering
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string)
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string)
    }
  }

  const [examples, total] = await Promise.all([
    prisma.example.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    }),
    prisma.example.count({ where })
  ])
  
  const response: ApiResponse = {
    success: true,
    data: examples,
    message: 'Examples retrieved successfully',
    error: null,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  }
  
  res.json(response)
}))

// POST /api/examples - Create a new example
exampleRoutes.post('/', asyncHandler(async (req, res) => {
  // Validate input data
  const validatedData = exampleSubmissionSchema.parse(req.body)
  
  // Create the example in the database
  const newExample = await prisma.example.create({
    data: {
      text: validatedData.text,
      languages: validatedData.languages,
      context: validatedData.context,
      region: validatedData.region,
      platform: validatedData.platform,
      age: validatedData.age,
      // Note: userId will be set when authentication is implemented
    },
    include: {
      user: {
        select: { id: true, name: true }
      }
    }
  })

  const response: ApiResponse = {
    success: true,
    data: newExample,
    message: 'Example created successfully',
    error: null
  }

  res.status(201).json(response)
}))

// Health check for examples service
exampleRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Example routes ready' },
    message: 'Examples API is healthy',
    error: null
  })
})