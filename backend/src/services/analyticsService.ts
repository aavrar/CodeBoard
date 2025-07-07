import { supabase, tables, handleSupabaseError } from '../utils/supabase.js'

export interface LanguagePairStats {
  languagePair: string
  count: number
  averageConfidence: number
  recentActivity: number
}

export interface RegionalStats {
  region: string
  count: number
  percentage: number
}

export interface PlatformStats {
  platform: string
  count: number
  percentage: number
}

export interface AnalyticsMetrics {
  totalExamples: number
  totalUsers: number
  verifiedExamples: number
  averageConfidence: number
  languagePairs: LanguagePairStats[]
  regionalDistribution: RegionalStats[]
  platformDistribution: PlatformStats[]
  recentGrowth: {
    daily: number
    weekly: number
    monthly: number
  }
}

export class AnalyticsService {

  async getOverallMetrics(): Promise<AnalyticsMetrics> {
    try {
      // Get total examples
      const { count: totalExamples, error: examplesError } = await supabase
        .from(tables.examples)
        .select('*', { count: 'exact', head: true })

      if (examplesError) {
        console.error('Error fetching examples count:', examplesError)
      }

      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from(tables.users)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (usersError) {
        console.error('Error fetching users count:', usersError)
      }

      // Get verified examples
      const { count: verifiedExamples, error: verifiedError } = await supabase
        .from(tables.examples)
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true)

      if (verifiedError) {
        console.error('Error fetching verified examples:', verifiedError)
      }

      // Get all examples for detailed analysis
      const { data: examples, error: detailsError } = await supabase
        .from(tables.examples)
        .select('languages, confidence, region, platform, created_at')

      if (detailsError) {
        console.error('Error fetching example details:', detailsError)
      }

      // Calculate language pairs
      const languagePairs = this.calculateLanguagePairs(examples || [])

      // Calculate average confidence
      const validConfidences = (examples || [])
        .map(e => e.confidence)
        .filter(c => typeof c === 'number' && !isNaN(c))
      const averageConfidence = validConfidences.length > 0 
        ? validConfidences.reduce((sum, conf) => sum + conf, 0) / validConfidences.length 
        : 0

      // Calculate regional distribution
      const regionalDistribution = this.calculateRegionalDistribution(examples || [])

      // Calculate platform distribution
      const platformDistribution = this.calculatePlatformDistribution(examples || [])

      // Calculate recent growth
      const recentGrowth = await this.calculateRecentGrowth()

      return {
        totalExamples: totalExamples || 0,
        totalUsers: totalUsers || 0,
        verifiedExamples: verifiedExamples || 0,
        averageConfidence,
        languagePairs,
        regionalDistribution,
        platformDistribution,
        recentGrowth
      }
    } catch (error) {
      console.error('Analytics service error:', error)
      throw new Error('Failed to fetch analytics metrics')
    }
  }

  private calculateLanguagePairs(examples: any[]): LanguagePairStats[] {
    const pairCounts: Record<string, { count: number; confidenceSum: number }> = {}

    examples.forEach(example => {
      if (Array.isArray(example.languages) && example.languages.length >= 2) {
        const sortedLanguages = example.languages.sort()
        const pairKey = sortedLanguages.join('-')
        
        if (!pairCounts[pairKey]) {
          pairCounts[pairKey] = { count: 0, confidenceSum: 0 }
        }
        
        pairCounts[pairKey].count++
        pairCounts[pairKey].confidenceSum += (example.confidence || 0)
      }
    })

    return Object.entries(pairCounts)
      .map(([pair, data]) => ({
        languagePair: pair,
        count: data.count,
        averageConfidence: data.count > 0 ? data.confidenceSum / data.count : 0,
        recentActivity: 0 // Can be calculated with date filtering
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 pairs
  }

  private calculateRegionalDistribution(examples: any[]): RegionalStats[] {
    const regionCounts: Record<string, number> = {}
    const total = examples.length

    examples.forEach(example => {
      const region = example.region || 'Unknown'
      regionCounts[region] = (regionCounts[region] || 0) + 1
    })

    return Object.entries(regionCounts)
      .map(([region, count]) => ({
        region,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  private calculatePlatformDistribution(examples: any[]): PlatformStats[] {
    const platformCounts: Record<string, number> = {}
    const total = examples.length

    examples.forEach(example => {
      const platform = example.platform || 'Unknown'
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
    })

    return Object.entries(platformCounts)
      .map(([platform, count]) => ({
        platform,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  private async calculateRecentGrowth(): Promise<{ daily: number; weekly: number; monthly: number }> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    try {
      // Daily growth
      const { count: daily, error: dailyError } = await supabase
        .from(tables.examples)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo)

      if (dailyError) {
        console.error('Error fetching daily growth:', dailyError)
      }

      // Weekly growth
      const { count: weekly, error: weeklyError } = await supabase
        .from(tables.examples)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo)

      if (weeklyError) {
        console.error('Error fetching weekly growth:', weeklyError)
      }

      // Monthly growth
      const { count: monthly, error: monthlyError } = await supabase
        .from(tables.examples)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo)

      if (monthlyError) {
        console.error('Error fetching monthly growth:', monthlyError)
      }

      return {
        daily: daily || 0,
        weekly: weekly || 0,
        monthly: monthly || 0
      }
    } catch (error) {
      console.error('Recent growth calculation error:', error)
      return { daily: 0, weekly: 0, monthly: 0 }
    }
  }

  async getLanguagePairAnalysis(): Promise<LanguagePairStats[]> {
    try {
      const { data: examples, error } = await supabase
        .from(tables.examples)
        .select('languages, confidence, created_at')

      if (error) {
        handleSupabaseError(error, 'language pair analysis')
      }

      return this.calculateLanguagePairs(examples || [])
    } catch (error) {
      console.error('Language pair analysis error:', error)
      throw new Error('Failed to analyze language pairs')
    }
  }

  async getRegionalAnalysis(): Promise<RegionalStats[]> {
    try {
      const { data: examples, error } = await supabase
        .from(tables.examples)
        .select('region')

      if (error) {
        handleSupabaseError(error, 'regional analysis')
      }

      return this.calculateRegionalDistribution(examples || [])
    } catch (error) {
      console.error('Regional analysis error:', error)
      throw new Error('Failed to analyze regions')
    }
  }

  async getPlatformAnalysis(): Promise<PlatformStats[]> {
    try {
      const { data: examples, error } = await supabase
        .from(tables.examples)
        .select('platform')

      if (error) {
        handleSupabaseError(error, 'platform analysis')
      }

      return this.calculatePlatformDistribution(examples || [])
    } catch (error) {
      console.error('Platform analysis error:', error)
      throw new Error('Failed to analyze platforms')
    }
  }

  async getExportData(format: 'csv' | 'json' = 'json') {
    try {
      const { data: examples, error } = await supabase
        .from(tables.examples)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'export data query')
      }

      if (format === 'csv') {
        return this.convertToCSV(examples || [])
      }

      return examples || []
    } catch (error) {
      console.error('Export data error:', error)
      throw new Error('Failed to export data')
    }
  }

  async getResearchAnalytics(userId: string, filters?: {
    languages?: string[]
    regions?: string[]
    dateRange?: { start: Date; end: Date }
    minConfidence?: number
  }): Promise<{
    totalExamples: number
    verifiedExamples: number
    totalLanguagePairs: number
    totalContributors: number
    totalRegions: number
    languagePairAnalytics: Array<{
      pair: string
      count: number
      averageConfidence: number
      averageSwitchPoints: number
    }>
    regionalAnalytics: Array<{
      region: string
      count: number
      averageConfidence: number
      languagePairs: string[]
    }>
    temporalAnalytics: Array<{
      period: string
      count: number
      averageConfidence: number
      newContributors: number
    }>
  }> {
    try {
      // Build query with filters
      let query = supabase
        .from(tables.examples)
        .select('*')

      // Apply filters
      if (filters?.languages && filters.languages.length > 0) {
        query = query.overlaps('languages', filters.languages)
      }

      if (filters?.regions && filters.regions.length > 0) {
        query = query.in('region', filters.regions)
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString())
      }

      if (filters?.minConfidence !== undefined) {
        query = query.gte('confidence', filters.minConfidence)
      }

      const { data: examples, error } = await query

      if (error) {
        handleSupabaseError(error, 'research analytics')
      }

      const filteredExamples = examples || []

      // Calculate analytics
      const languagePairAnalytics = this.calculateLanguagePairAnalytics(filteredExamples)
      const regionalAnalytics = this.calculateRegionalAnalytics(filteredExamples)
      const temporalAnalytics = this.calculateTemporalAnalytics(filteredExamples)

      // Calculate additional analytics for frontend
      const switchPointAnalytics = this.calculateSwitchPointAnalytics(filteredExamples)
      const qualityMetrics = this.calculateQualityMetrics(filteredExamples)

      return {
        totalExamples: filteredExamples.length,
        verifiedExamples: filteredExamples.filter(e => e.is_verified).length,
        totalLanguagePairs: languagePairAnalytics.length,
        totalContributors: new Set(filteredExamples.map(e => e.user_id).filter(Boolean)).size,
        totalRegions: regionalAnalytics.length,
        languagePairAnalytics,
        regionalAnalytics,
        temporalAnalytics
      }
    } catch (error) {
      console.error('Research analytics error:', error)
      throw new Error('Failed to get research analytics')
    }
  }

  async getLanguagePairDetails(userId: string, languagePair: string, limit: number = 50): Promise<any[]> {
    try {
      const languages = languagePair.split(' - ')
      
      const { data: examples, error } = await supabase
        .from(tables.examples)
        .select('*')
        .overlaps('languages', languages)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'language pair details')
      }

      return examples || []
    } catch (error) {
      console.error('Language pair details error:', error)
      throw new Error('Failed to get language pair details')
    }
  }

  private calculateLanguagePairAnalytics(examples: any[]): Array<{
    pair: string
    count: number
    averageConfidence: number
    averageSwitchPoints: number
  }> {
    const pairStats: Record<string, { count: number; totalConfidence: number; totalSwitchPoints: number }> = {}

    examples.forEach(example => {
      if (example.languages && example.languages.length >= 2) {
        const pair = example.languages.sort().join(' - ')
        if (!pairStats[pair]) {
          pairStats[pair] = { count: 0, totalConfidence: 0, totalSwitchPoints: 0 }
        }
        pairStats[pair].count++
        pairStats[pair].totalConfidence += example.confidence || 0
        pairStats[pair].totalSwitchPoints += (example.switch_points || []).length
      }
    })

    return Object.entries(pairStats)
      .map(([pair, stats]) => ({
        pair,
        count: stats.count,
        averageConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0,
        averageSwitchPoints: stats.count > 0 ? stats.totalSwitchPoints / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  private calculateRegionalAnalytics(examples: any[]): Array<{
    region: string
    count: number
    averageConfidence: number
    languagePairs: string[]
  }> {
    const regionStats: Record<string, { 
      count: number
      totalConfidence: number
      languagePairs: Set<string>
    }> = {}

    examples.forEach(example => {
      const region = example.region || 'Unknown'
      if (!regionStats[region]) {
        regionStats[region] = { count: 0, totalConfidence: 0, languagePairs: new Set() }
      }
      regionStats[region].count++
      regionStats[region].totalConfidence += example.confidence || 0
      
      if (example.languages && example.languages.length >= 2) {
        const pair = example.languages.sort().join(' - ')
        regionStats[region].languagePairs.add(pair)
      }
    })

    return Object.entries(regionStats)
      .map(([region, stats]) => ({
        region,
        count: stats.count,
        averageConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0,
        languagePairs: Array.from(stats.languagePairs)
      }))
      .sort((a, b) => b.count - a.count)
  }

  private calculateTemporalAnalytics(examples: any[]): Array<{
    period: string
    count: number
    averageConfidence: number
    newContributors: number
  }> {
    const periodStats: Record<string, {
      count: number
      totalConfidence: number
      contributors: Set<string>
    }> = {}

    examples.forEach(example => {
      const date = new Date(example.created_at)
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!periodStats[period]) {
        periodStats[period] = { count: 0, totalConfidence: 0, contributors: new Set() }
      }
      periodStats[period].count++
      periodStats[period].totalConfidence += example.confidence || 0
      
      if (example.user_id) {
        periodStats[period].contributors.add(example.user_id)
      }
    })

    return Object.entries(periodStats)
      .map(([period, stats]) => ({
        period,
        count: stats.count,
        averageConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0,
        newContributors: stats.contributors.size
      }))
      .sort((a, b) => b.period.localeCompare(a.period))
  }

  private calculateSwitchPointAnalytics(examples: any[]): Array<{
    range: string
    count: number
    percentage: number
  }> {
    const switchPointCounts: Record<string, number> = {
      '0': 0,
      '1-2': 0,
      '3-5': 0,
      '6-10': 0,
      '10+': 0
    }

    examples.forEach(example => {
      const switchPoints = (example.switch_points || []).length
      if (switchPoints === 0) {
        switchPointCounts['0']++
      } else if (switchPoints <= 2) {
        switchPointCounts['1-2']++
      } else if (switchPoints <= 5) {
        switchPointCounts['3-5']++
      } else if (switchPoints <= 10) {
        switchPointCounts['6-10']++
      } else {
        switchPointCounts['10+']++
      }
    })

    const total = examples.length
    return Object.entries(switchPointCounts)
      .map(([range, count]) => ({
        range,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .filter(item => item.count > 0)
  }

  private calculateQualityMetrics(examples: any[]): {
    averageConfidence: number
    verificationRate: number
    userLanguageMatchRate: number
  } {
    const totalExamples = examples.length
    if (totalExamples === 0) {
      return {
        averageConfidence: 0,
        verificationRate: 0,
        userLanguageMatchRate: 0
      }
    }

    const totalConfidence = examples.reduce((sum, example) => sum + (example.confidence || 0), 0)
    const verifiedCount = examples.filter(e => e.is_verified).length
    const userLanguageMatchCount = examples.filter(e => e.user_language_match).length

    return {
      averageConfidence: totalConfidence / totalExamples,
      verificationRate: (verifiedCount / totalExamples) * 100,
      userLanguageMatchRate: (userLanguageMatchCount / totalExamples) * 100
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    )

    return [headers, ...rows].join('\n')
  }
}

export const analyticsService = new AnalyticsService()