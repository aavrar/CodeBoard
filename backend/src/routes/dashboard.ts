import { Router, Request, Response } from 'express'
import { ApiResponse } from '../types/index.js'
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

    // Count unique language pairs
    const uniquePairs = new Set<string>()
    if (languageData) {
      languageData.forEach(example => {
        if (Array.isArray(example.languages) && example.languages.length >= 2) {
          const sortedLanguages = example.languages.sort()
          uniquePairs.add(sortedLanguages.join('-'))
        }
      })
    }

    // Count unique regions for "countries" metric
    const { data: regionData, error: regionError } = await supabase
      .from(tables.examples)
      .select('region')
    
    const uniqueRegions = new Set<string>()
    if (!regionError && regionData) {
      regionData.forEach(example => {
        if (example.region) {
          uniqueRegions.add(example.region)
        }
      })
    }

    const metrics = {
      totalExamples: totalExamples || 0,
      languagePairs: uniquePairs.size,
      contributors: totalUsers || 0,
      countries: uniqueRegions.size,
      monthlyGrowth: {
        examples: 12, // Mock growth data - could be calculated from recent data
        contributors: 8,
        languagePairs: 2
      }
    }

    const response: ApiResponse<typeof metrics> = {
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

    // Calculate average confidence for each pair and format for charts
    const formattedPairs = Object.entries(languagePairs)
      .map(([pair, stats]) => ({
        pair: pair.replace('-', ' - '),
        count: stats.count,
        avgConfidence: stats.avgConfidence / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 pairs

    const response: ApiResponse<typeof formattedPairs> = {
      success: true,
      data: formattedPairs,
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

// GET /api/dashboard/switch-points - Get switch point trends over time
dashboardRoutes.get('/switch-points', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { data: examples, error } = await supabase
      .from(tables.examples)
      .select('switch_points, created_at')
      .order('created_at', { ascending: true })

    if (error) {
      handleSupabaseError(error, 'switch points query')
    }

    // Group by month and calculate switch point trends
    const monthlyData: Record<string, { switches: number; count: number }> = {}
    
    examples?.forEach(example => {
      const date = new Date(example.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { switches: 0, count: 0 }
      }
      
      const switchCount = Array.isArray(example.switch_points) ? example.switch_points.length : 0
      monthlyData[monthKey].switches += switchCount
      monthlyData[monthKey].count++
    })

    // Format for chart (average switches per example per month)
    const formattedData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: month,
        switches: data.count > 0 ? Math.round((data.switches / data.count) * 10) / 10 : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months

    const response: ApiResponse<typeof formattedData> = {
      success: true,
      data: formattedData,
      message: 'Switch point data retrieved successfully',
      error: null
    }

    res.json(response)
  } catch (error) {
    console.error('Switch points error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to fetch switch points data',
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

    // Format for chart
    const formattedRegions = Object.entries(regionDistribution)
      .map(([region, count]) => ({
        region,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 regions

    const response: ApiResponse<typeof formattedRegions> = {
      success: true,
      data: formattedRegions,
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

    // Format for pie chart with colors
    const colors = ['#0891b2', '#06b6d4', '#67e8f9', '#a5f3fc', '#cffafe', '#f0fdff']
    const formattedPlatforms = Object.entries(platformDistribution)
      .map(([platform, count], index) => ({
        platform,
        count,
        fill: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)

    const response: ApiResponse<typeof formattedPlatforms> = {
      success: true,
      data: formattedPlatforms,
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