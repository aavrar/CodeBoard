import express from 'express'
import { z } from 'zod'
import { analyticsService } from '../services/analyticsService.js'
import { UserPayload } from '../types/index.js'
import { supabase } from '../utils/supabase.js'
import { authenticateToken, requireResearcher } from '../middleware/auth.js'

const router = express.Router()

interface AuthenticatedRequest extends express.Request {
  user: UserPayload
}

const analyticsFiltersSchema = z.object({
  languages: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minConfidence: z.number().min(0).max(1).optional()
})

router.get('/research', authenticateToken, requireResearcher, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  try {
    const filters = analyticsFiltersSchema.parse(req.query)
    
    const dateRange = filters.startDate && filters.endDate ? {
      start: new Date(filters.startDate),
      end: new Date(filters.endDate)
    } : undefined

    const analytics = await analyticsService.getResearchAnalytics(authReq.user.id, {
      languages: filters.languages,
      regions: filters.regions,
      dateRange,
      minConfidence: filters.minConfidence
    })

    res.json({
      success: true,
      data: analytics,
      message: 'Research analytics retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Research analytics error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid filter parameters',
        error: error.errors
      })
    }

    res.status(error instanceof Error && error.message.includes('permissions') ? 403 : 500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to retrieve analytics',
      error: 'Server error'
    })
  }
})

router.get('/language-pair/:pair', authenticateToken, requireResearcher, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  try {
    const { pair } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    if (limit > 200) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Limit cannot exceed 200',
        error: 'Invalid parameter'
      })
    }

    const details = await analyticsService.getLanguagePairDetails(authReq.user.id, pair, limit)

    res.json({
      success: true,
      data: details,
      message: 'Language pair details retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Language pair details error:', error)
    
    res.status(error instanceof Error && error.message.includes('permissions') ? 403 : 500).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to retrieve language pair details',
      error: 'Server error'
    })
  }
})

// Export metadata for research tools
router.get('/metadata', authenticateToken, requireResearcher, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  try {
    // Get available filter options
    const [languages, regions, platforms] = await Promise.all([
      // Get distinct languages from examples
      analyticsService.getResearchAnalytics(authReq.user.id).then(analytics => 
        analytics.languagePairAnalytics
          .flatMap(pair => pair.pair.split(' - '))
          .filter((lang, index, array) => array.indexOf(lang) === index)
          .sort()
      ),
      // Get distinct regions
      analyticsService.getResearchAnalytics(authReq.user.id).then(analytics => 
        analytics.regionalAnalytics.map(region => region.region)
      ),
      // Get available platforms (from Supabase)
      supabase
        .from('examples')
        .select('platform')
        .not('platform', 'is', null)
        .then(({ data }) => 
          [...new Set((data || []).map(r => r.platform))]
            .filter(Boolean)
            .sort()
        )
    ])

    res.json({
      success: true,
      data: {
        availableLanguages: languages,
        availableRegions: regions,
        availablePlatforms: platforms,
        filterOptions: {
          confidenceRange: { min: 0, max: 1, step: 0.1 },
          dateRange: { 
            earliest: new Date('2024-01-01').toISOString(),
            latest: new Date().toISOString()
          }
        }
      },
      message: 'Analytics metadata retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Analytics metadata error:', error)
    
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve analytics metadata',
      error: 'Server error'
    })
  }
})

// Data export endpoint for research analytics
router.get('/export/:format', authenticateToken, requireResearcher, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest
  try {
    const { format } = req.params
    
    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid export format. Use csv or json',
        error: 'Invalid parameter'
      })
    }

    const filters = analyticsFiltersSchema.parse(req.query)
    
    const dateRange = filters.startDate && filters.endDate ? {
      start: new Date(filters.startDate),
      end: new Date(filters.endDate)
    } : undefined

    const analytics = await analyticsService.getResearchAnalytics(authReq.user.id, {
      languages: filters.languages,
      regions: filters.regions,
      dateRange,
      minConfidence: filters.minConfidence
    })

    const exportData = {
      exportDate: new Date().toISOString(),
      requestedBy: authReq.user.email,
      filters: filters,
      summary: {
        totalExamples: analytics.totalExamples,
        verifiedExamples: analytics.verifiedExamples,
        totalLanguagePairs: analytics.totalLanguagePairs,
        totalContributors: analytics.totalContributors,
        totalRegions: analytics.totalRegions
      },
      analytics: analytics
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="codeboard-analytics-${new Date().toISOString().split('T')[0]}.json"`)
      return res.json(exportData)
    }

    // CSV format
    const csvData = convertAnalyticsToCSV(analytics)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="codeboard-analytics-${new Date().toISOString().split('T')[0]}.csv"`)
    res.send(csvData)

  } catch (error) {
    console.error('Export error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid filter parameters',
        error: error.errors
      })
    }

    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to export analytics data',
      error: 'Server error'
    })
  }
})

function convertAnalyticsToCSV(analytics: any): string {
  const headers = [
    'Metric Type',
    'Language Pair / Region / Period',
    'Count',
    'Average Confidence',
    'Additional Info'
  ]
  
  const rows: string[][] = [headers]
  
  // Language pair data
  analytics.languagePairAnalytics.forEach((pair: any) => {
    rows.push([
      'Language Pair',
      pair.pair,
      pair.count.toString(),
      (pair.averageConfidence * 100).toFixed(2) + '%',
      `${pair.averageSwitchPoints.toFixed(1)} avg switch points`
    ])
  })
  
  // Regional data
  analytics.regionalAnalytics.forEach((region: any) => {
    rows.push([
      'Regional',
      region.region,
      region.count.toString(),
      (region.averageConfidence * 100).toFixed(2) + '%',
      region.languagePairs.slice(0, 3).join(', ')
    ])
  })
  
  // Temporal data
  analytics.temporalAnalytics.forEach((period: any) => {
    rows.push([
      'Temporal',
      period.period,
      period.count.toString(),
      (period.averageConfidence * 100).toFixed(2) + '%',
      `${period.newContributors} new contributors`
    ])
  })
  
  return rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}

export default router