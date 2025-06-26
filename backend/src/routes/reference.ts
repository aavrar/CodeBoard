import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse } from '../types'
import { asyncHandler } from '../middleware/errorHandler'

const prisma = new PrismaClient()
export const referenceRoutes = Router()

// GET /api/languages - Get all available languages
referenceRoutes.get('/languages', asyncHandler(async (req, res) => {
  const languages = await prisma.language.findMany({
    orderBy: { name: 'asc' }
  })

  // If no languages in database, return a default set
  const languageList = languages.length > 0 
    ? languages.map(lang => lang.name)
    : [
        'English', 'Spanish', 'Hindi', 'Mandarin', 'French', 'Arabic', 
        'Portuguese', 'Russian', 'Japanese', 'German', 'Korean', 'Italian',
        'Dutch', 'Swedish', 'Norwegian', 'Tagalog', 'Urdu', 'Bengali'
      ]

  const response: ApiResponse<string[]> = {
    success: true,
    data: languageList,
    message: 'Languages retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/regions - Get all available regions
referenceRoutes.get('/regions', asyncHandler(async (req, res) => {
  const regions = await prisma.region.findMany({
    orderBy: { name: 'asc' }
  })

  // If no regions in database, return a default set
  const regionList = regions.length > 0
    ? regions.map(region => `${region.name}, ${region.country}`)
    : [
        'North America', 'South America', 'Europe', 'East Asia', 
        'South Asia', 'Southeast Asia', 'Middle East', 'Africa', 
        'Oceania', 'Others'
      ]

  const response: ApiResponse<string[]> = {
    success: true,
    data: regionList,
    message: 'Regions retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/platforms - Get all available platforms
referenceRoutes.get('/platforms', asyncHandler(async (req, res) => {
  const platforms = await prisma.platform.findMany({
    orderBy: { name: 'asc' }
  })

  // If no platforms in database, return a default set
  const platformList = platforms.length > 0
    ? platforms.map(platform => platform.name)
    : [
        'Social Media', 'Text/Messaging', 'Face-to-face', 'Email', 
        'Phone Call', 'Video Call', 'Online Forum', 'Chat App',
        'Professional Meeting', 'Casual Conversation'
      ]

  const response: ApiResponse<string[]> = {
    success: true,
    data: platformList,
    message: 'Platforms retrieved successfully',
    error: null
  }

  res.json(response)
}))

// Health check for reference service
referenceRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Reference routes ready' },
    message: 'Reference API is healthy',
    error: null
  })
})