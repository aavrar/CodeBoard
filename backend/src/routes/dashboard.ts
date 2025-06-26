import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, DashboardMetrics } from '../types'
import { asyncHandler } from '../middleware/errorHandler'

const prisma = new PrismaClient()
export const dashboardRoutes = Router()

// GET /api/dashboard/metrics - Main dashboard metrics
dashboardRoutes.get('/metrics', (req, res) => {
  const metrics: DashboardMetrics = {
    totalExamples: 15247,
    languagePairs: 127,
    contributors: 1234,
    countries: 67,
    monthlyGrowth: {
      examples: 12,
      contributors: 89,
      languagePairs: 3
    }
  }

  const response: ApiResponse<DashboardMetrics> = {
    success: true,
    data: metrics,
    message: 'Dashboard metrics retrieved successfully',
    error: null
  }

  res.json(response)
})

// GET /api/dashboard/language-pairs - Top language pair combinations
dashboardRoutes.get('/language-pairs', asyncHandler(async (req, res) => {
  // Get all examples and calculate language pairs manually
  const examples = await prisma.example.findMany({
    select: { languages: true }
  })

  const pairCounts: { [key: string]: number } = {}
  
  examples.forEach(example => {
    if (example.languages && example.languages.length >= 2) {
      const sorted = [...example.languages].sort()
      const pairKey = sorted.join('-')
      pairCounts[pairKey] = (pairCounts[pairKey] || 0) + 1
    }
  })

  const languagePairs = Object.entries(pairCounts)
    .map(([pair, count], index) => ({
      pair,
      count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 pairs

  const response: ApiResponse = {
    success: true,
    data: languagePairs,
    message: 'Language pairs retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/dashboard/switch-points - Monthly trend data
dashboardRoutes.get('/switch-points', asyncHandler(async (req, res) => {
  const switchPoints = [
    { month: 'Jan', switches: 1200 },
    { month: 'Feb', switches: 1450 },
    { month: 'Mar', switches: 1680 },
    { month: 'Apr', switches: 1920 },
    { month: 'May', switches: 2100 },
    { month: 'Jun', switches: 2340 }
  ]

  const response: ApiResponse = {
    success: true,
    data: switchPoints,
    message: 'Switch points data retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/dashboard/platforms - Platform distribution stats
dashboardRoutes.get('/platforms', asyncHandler(async (req, res) => {
  const examples = await prisma.example.findMany({
    select: { platform: true }
  })

  const platformCounts: { [key: string]: number } = {}
  
  examples.forEach(example => {
    if (example.platform) {
      platformCounts[example.platform] = (platformCounts[example.platform] || 0) + 1
    }
  })

  const colors = ['#0891b2', '#0d9488', '#059669', '#65a30d', '#ca8a04', '#dc2626']
  const platforms = Object.entries(platformCounts)
    .map(([platform, count], index) => ({
      platform,
      count,
      fill: colors[index % colors.length]
    }))
    .sort((a, b) => b.count - a.count)

  // If no data, return mock data
  const platformData = platforms.length > 0 ? platforms : [
    { platform: 'Social Media', count: 4500, fill: '#0891b2' },
    { platform: 'Text/Messaging', count: 3200, fill: '#0d9488' },
    { platform: 'Face-to-face', count: 2800, fill: '#059669' },
    { platform: 'Email', count: 1200, fill: '#65a30d' },
    { platform: 'Phone Call', count: 800, fill: '#ca8a04' }
  ]

  const response: ApiResponse = {
    success: true,
    data: platformData,
    message: 'Platform stats retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/dashboard/regions - Regional distribution stats
dashboardRoutes.get('/regions', asyncHandler(async (req, res) => {
  const examples = await prisma.example.findMany({
    select: { region: true }
  })

  const regionCounts: { [key: string]: number } = {}
  
  examples.forEach(example => {
    if (example.region) {
      regionCounts[example.region] = (regionCounts[example.region] || 0) + 1
    }
  })

  const regions = Object.entries(regionCounts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)

  // If no data, return mock data
  const regionData = regions.length > 0 ? regions : [
    { region: 'North America', count: 4200 },
    { region: 'South Asia', count: 3800 },
    { region: 'Europe', count: 2900 },
    { region: 'East Asia', count: 2100 },
    { region: 'Latin America', count: 1800 },
    { region: 'Others', count: 1200 }
  ]

  const response: ApiResponse = {
    success: true,
    data: regionData,
    message: 'Region stats retrieved successfully',
    error: null
  }

  res.json(response)
}))

// Health check for dashboard service
dashboardRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Dashboard routes ready' },
    message: 'Dashboard API is healthy',
    error: null
  })
})