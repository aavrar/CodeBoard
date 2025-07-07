"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Download, 
  Filter, 
  Globe, 
  TrendingUp, 
  Users, 
  Database,
  PieChart,
  Calendar,
  MapPin,
  Languages,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'

interface ResearchAnalytics {
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
    percentage: number
  }>
  switchPointAnalytics: Array<{
    range: string
    count: number
    percentage: number
  }>
  regionalAnalytics: Array<{
    region: string
    count: number
    languagePairs: string[]
    averageConfidence: number
  }>
  temporalAnalytics: Array<{
    period: string
    count: number
    newContributors: number
    averageConfidence: number
  }>
  confidenceDistribution: Array<{
    range: string
    count: number
  }>
  qualityMetrics: {
    averageConfidence: number
    verificationRate: number
    userLanguageMatchRate: number
  }
}

export default function ResearchDashboard() {
  const [analytics, setAnalytics] = useState<ResearchAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    languages: [] as string[],
    regions: [] as string[],
    startDate: '',
    endDate: '',
    minConfidence: ''
  })
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user?.tier !== 'RESEARCHER' && user?.tier !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    loadAnalytics()
  }, [isAuthenticated, user, router])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      const queryParams = new URLSearchParams()
      
      if (filters.languages.length > 0) {
        filters.languages.forEach(lang => queryParams.append('languages', lang))
      }
      if (filters.regions.length > 0) {
        filters.regions.forEach(region => queryParams.append('regions', region))
      }
      if (filters.startDate) queryParams.append('startDate', new Date(filters.startDate).toISOString())
      if (filters.endDate) queryParams.append('endDate', new Date(filters.endDate).toISOString())
      if (filters.minConfidence) queryParams.append('minConfidence', (parseFloat(filters.minConfidence) / 100).toString())

      const response = await api.get(`/analytics/research?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAnalytics(response.data.data)
      } else {
        setError(response.data.message || 'Failed to load analytics')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load research analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('authToken')
      const queryParams = new URLSearchParams()
      
      if (filters.languages.length > 0) {
        filters.languages.forEach(lang => queryParams.append('languages', lang))
      }
      if (filters.regions.length > 0) {
        filters.regions.forEach(region => queryParams.append('regions', region))
      }
      if (filters.startDate) queryParams.append('startDate', new Date(filters.startDate).toISOString())
      if (filters.endDate) queryParams.append('endDate', new Date(filters.endDate).toISOString())
      if (filters.minConfidence) queryParams.append('minConfidence', (parseFloat(filters.minConfidence) / 100).toString())

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/export/${format}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `codeboard-analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      setError('Failed to export data. Please try again.')
    }
  }


  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatNumber = (value: number): string => {
    return value.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading research analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50 mt-8">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Research Analytics</h1>
            <p className="text-neutral-600">Advanced code-switching data insights and analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => exportData('csv')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => exportData('json')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Examples</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatNumber(analytics.totalExamples)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Languages className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Language Pairs</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatNumber(analytics.totalLanguagePairs)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Contributors</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatNumber(analytics.totalContributors)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Regions</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatNumber(analytics.totalRegions)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-600">Avg Confidence</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatPercentage(analytics.qualityMetrics.averageConfidence)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
              Quality Metrics
            </CardTitle>
            <CardDescription>
              Data quality and verification statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{formatPercentage(analytics.qualityMetrics.averageConfidence)}</p>
                <p className="text-sm text-neutral-600">Average Confidence</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{formatPercentage(analytics.qualityMetrics.verificationRate / 100)}</p>
                <p className="text-sm text-neutral-600">Verification Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{formatPercentage(analytics.qualityMetrics.userLanguageMatchRate / 100)}</p>
                <p className="text-sm text-neutral-600">User-AI Agreement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="language-pairs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="language-pairs">Language Pairs</TabsTrigger>
            <TabsTrigger value="switch-points">Switch Points</TabsTrigger>
            <TabsTrigger value="regions">Regional Data</TabsTrigger>
            <TabsTrigger value="temporal">Temporal Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="language-pairs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Language Pairs</CardTitle>
                <CardDescription>
                  Most common language combinations in the corpus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.languagePairAnalytics.slice(0, 10).map((pair, index) => (
                    <div key={pair.pair} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-teal-100 text-teal-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{pair.pair}</p>
                          <p className="text-sm text-neutral-600">
                            Avg: {pair.averageSwitchPoints.toFixed(1)} switch points
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-neutral-900">{formatNumber(pair.count)}</p>
                        <Badge variant="outline" className="text-xs">
                          {formatPercentage(pair.averageConfidence)} confidence
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="switch-points" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Switch Point Distribution</CardTitle>
                <CardDescription>
                  How frequently different switch point counts occur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.switchPointAnalytics.map((item) => (
                    <div key={item.range} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium text-neutral-900">{item.range} points</div>
                      <div className="flex-1 bg-neutral-200 rounded-full h-3">
                        <div 
                          className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-medium text-neutral-900">{formatNumber(item.count)}</span>
                        <span className="text-xs text-neutral-600 ml-1">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>
                  Geographic distribution of code-switching examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.regionalAnalytics.slice(0, 10).map((region) => (
                    <div key={region.region} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-neutral-900">{region.region}</h3>
                        <Badge variant="outline">{formatNumber(region.count)} examples</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        Confidence: {formatPercentage(region.averageConfidence)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {region.languagePairs.slice(0, 4).map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                        {region.languagePairs.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{region.languagePairs.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Temporal Trends</CardTitle>
                <CardDescription>
                  Platform growth and activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.temporalAnalytics.map((period) => (
                    <div key={period.period} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-900">{period.period}</p>
                        <p className="text-sm text-neutral-600">
                          {period.newContributors} new contributors
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-neutral-900">{formatNumber(period.count)}</p>
                        <p className="text-sm text-neutral-600">
                          {formatPercentage(period.averageConfidence)} avg confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}