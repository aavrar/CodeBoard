import { Router, Request, Response } from 'express'
import { ApiResponse, DashboardMetrics } from '../types/index.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { supabase, tables, handleSupabaseError } from '../utils/supabase.js'

export const dashboardRoutes = Router()

// GET /api/dashboard/metrics - Get overall platform metrics
dashboardRoutes.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get total examples count
    const { count: totalExamples, error: examplesError } = await supabase
      .from(tables.examples)
      .select('*', { count: 'exact', head: true })

    if (examplesError) {
      console.error('Error fetching examples count:', examplesError)
    }

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from(tables.users)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (usersError) {
      console.error('Error fetching users count:', usersError)
    }

    // Get verified examples count
    const { count: verifiedExamples, error: verifiedError } = await supabase
      .from(tables.examples)
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    if (verifiedError) {
      console.error('Error fetching verified examples:', verifiedError)
    }

    // Get language distribution
    const { data: languageData, error: languageError } = await supabase
      .from(tables.examples)
      .select('languages')

    let languageDistribution: Record<string, number> = {}
    if (!languageError && languageData) {
      languageData.forEach(example => {
        if (Array.isArray(example.languages)) {
          example.languages.forEach(lang => {
            languageDistribution[lang] = (languageDistribution[lang] || 0) + 1
          })
        }
      })
    }

    const metrics: DashboardMetrics = {
      totalExamples: totalExamples || 0,
      totalUsers: totalUsers || 0,
      verifiedExamples: verifiedExamples || 0,
      languageDistribution,
      recentActivity: [], // Can be populated later
      platformStats: {
        avgConfidence: 0, // Can be calculated later
        topLanguagePairs: Object.keys(languageDistribution).slice(0, 5)
      }
    }

    const response: ApiResponse<DashboardMetrics> = {
      success: true,
      data: metrics,
      message: 'Dashboard metrics retrieved successfully',
      error: null
    }

    res.json(response)
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch dashboard metrics',
      error: 'Internal server error'
    })
  }
}))

// GET /api/dashboard/language-pairs - Get language pair analysis
dashboardRoutes.get('/language-pairs', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { data: examples, error } = await supabase
      .from(tables.examples)
      .select('languages, confidence')

    if (error) {
      handleSupabaseError(error, 'language pairs query')
    }

    const languagePairs: Record<string, { count: number; avgConfidence: number }> = {}

    examples?.forEach(example => {
      if (Array.isArray(example.languages) && example.languages.length >= 2) {
        const sortedLanguages = example.languages.sort()
        const pairKey = sortedLanguages.join('-')
        
        if (!languagePairs[pairKey]) {
          languagePairs[pairKey] = { count: 0, avgConfidence: 0 }
        }
        
        languagePairs[pairKey].count++
        languagePairs[pairKey].avgConfidence += (example.confidence || 0)
      }
    })

    // Calculate average confidence for each pair
    Object.keys(languagePairs).forEach(pair => {
      languagePairs[pair].avgConfidence = languagePairs[pair].avgConfidence / languagePairs[pair].count
    })

    const response: ApiResponse<typeof languagePairs> = {
      success: true,
      data: languagePairs,
      message: 'Language pairs retrieved successfully',
      error: null
    }

    res.json(response)
  } catch (error) {
    console.error('Language pairs error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch language pairs',
      error: 'Internal server error'
    })
  }
}))

// GET /api/dashboard/regions - Get regional distribution
dashboardRoutes.get('/regions', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { data: examples, error } = await supabase
      .from(tables.examples)
      .select('region')

    if (error) {
      handleSupabaseError(error, 'regions query')
    }

    const regionDistribution: Record<string, number> = {}
    
    examples?.forEach(example => {
      const region = example.region || 'Unknown'
      regionDistribution[region] = (regionDistribution[region] || 0) + 1
    })

    const response: ApiResponse<typeof regionDistribution> = {
      success: true,
      data: regionDistribution,
      message: 'Regional distribution retrieved successfully',
      error: null
    }

    res.json(response)
  } catch (error) {
    console.error('Regional distribution error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch regional distribution',
      error: 'Internal server error'
    })
  }
}))

// GET /api/dashboard/platforms - Get platform distribution
dashboardRoutes.get('/platforms', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { data: examples, error } = await supabase
      .from(tables.examples)
      .select('platform')

    if (error) {
      handleSupabaseError(error, 'platforms query')
    }

    const platformDistribution: Record<string, number> = {}
    
    examples?.forEach(example => {
      const platform = example.platform || 'Unknown'
      platformDistribution[platform] = (platformDistribution[platform] || 0) + 1
    })

    const response: ApiResponse<typeof platformDistribution> = {
      success: true,
      data: platformDistribution,
      message: 'Platform distribution retrieved successfully',
      error: null
    }

    res.json(response)
  } catch (error) {
    console.error('Platform distribution error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch platform distribution',
      error: 'Internal server error'
    })
  }
}))

// Health check
dashboardRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Dashboard routes ready' },
    message: 'Dashboard API is healthy',
    error: null
  })
})