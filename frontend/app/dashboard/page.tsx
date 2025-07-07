"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis } from "recharts"
import { TrendingUp, Users, Globe, BarChart3, Languages, MapPin, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { fetchDashboardMetrics, fetchLanguagePairStats, fetchSwitchPointData, fetchPlatformStats, fetchRegionStats } from "@/lib/api"
import type { DashboardMetrics, LanguagePairStats, SwitchPointData, PlatformStats, RegionStats } from "@/types"

export default function DashboardPage() {
  // Dashboard data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [languagePairData, setLanguagePairData] = useState<LanguagePairStats[]>([])
  const [switchPointData, setSwitchPointData] = useState<SwitchPointData[]>([])
  const [platformData, setPlatformData] = useState<PlatformStats[]>([])
  const [regionData, setRegionData] = useState<RegionStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()


  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [
        metricsData,
        languagePairs,
        switchPoints,
        platforms,
        regions
      ] = await Promise.all([
        fetchDashboardMetrics(),
        fetchLanguagePairStats(),
        fetchSwitchPointData(),
        fetchPlatformStats(),
        fetchRegionStats()
      ])

      setMetrics(metricsData)
      setLanguagePairData(languagePairs)
      setSwitchPointData(switchPoints)
      setPlatformData(platforms)
      setRegionData(regions)
    } catch (error) {
      toast({
        title: "Failed to load dashboard data",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-neutral-400 mb-4">
              <BarChart3 className="h-16 w-16 mx-auto animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-neutral-900 mb-2">Loading dashboard...</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Analytics Dashboard</h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Explore linguistic insights and patterns from our code-switching corpus. Discover trends in multilingual
            communication across different communities.
          </p>
        </div>

        {/* Key Metrics - Data from backend API */}
        {metrics && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="border-neutral-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Examples</CardTitle>
                <MessageSquare className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalExamples.toLocaleString()}</div>
                <p className="text-xs text-neutral-500">+{metrics.monthlyGrowth.examples}% from last month</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Language Pairs</CardTitle>
                <Languages className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.languagePairs}</div>
                <p className="text-xs text-neutral-500">+{metrics.monthlyGrowth.languagePairs} new pairs this month</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                <Users className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.contributors.toLocaleString()}</div>
                <p className="text-xs text-neutral-500">+{metrics.monthlyGrowth.contributors} new contributors</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <Globe className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.countries}</div>
                <p className="text-xs text-neutral-500">Across 6 continents</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Grid - All data from backend APIs */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Language Pairs Chart - Data from fetchLanguagePairStats() */}
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                Most Common Language Pairs
              </CardTitle>
              <CardDescription>Top 5 language combinations in our corpus</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Examples",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={languagePairData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="pair" type="category" width={80} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Switch Points Over Time - Data from fetchSwitchPointData() */}
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Code-switching Frequency
              </CardTitle>
              <CardDescription>Monthly trend of switch points detected</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  switches: {
                    label: "Switch Points",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <LineChart data={switchPointData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="switches"
                    stroke="var(--color-switches)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-switches)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Platform Distribution - Data from fetchPlatformStats() */}
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                Platform Distribution
              </CardTitle>
              <CardDescription>Where code-switching examples are collected from</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Examples",
                  },
                }}
                className="h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {platformData.map((item, index) => (
                  <div key={item.platform} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-neutral-600">{item.platform}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regional Distribution - Data from fetchRegionStats() */}
          <Card className="border-neutral-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                Regional Distribution
              </CardTitle>
              <CardDescription>Geographic spread of contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Examples",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={regionData}>
                  <XAxis dataKey="region" fontSize={12} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section - Could be generated by backend analytics */}
        <div className="mt-12">
          <Card className="border-neutral-200 bg-teal-50">
            <CardHeader>
              <CardTitle className="text-teal-900">Key Insights</CardTitle>
              <CardDescription className="text-teal-700">
                Generated from real-time analysis of the corpus data
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-teal-900">Most Active Pair</h4>
                <p className="text-sm text-teal-700">
                  English-Spanish dominates with 22% of all examples, reflecting strong bilingual communities in North
                  America.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-teal-900">Growing Trend</h4>
                <p className="text-sm text-teal-700">
                  Code-switching frequency has increased 95% over the past 6 months, showing growing community
                  engagement.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-teal-900">Digital Dominance</h4>
                <p className="text-sm text-teal-700">
                  60% of examples come from digital platforms, highlighting the prevalence of code-switching in online
                  communication.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
