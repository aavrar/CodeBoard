"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { Trophy, Star, ThumbsUp, Tag, Users, TrendingUp } from 'lucide-react'

interface LeaderboardUser {
  id: string
  name: string
  examples_submitted: number
  votes_cast: number
  tags_contributed: number
  total_points: number
}

interface CommunityStats {
  totalUsers: number
  totalVotes: number
  totalTags: number
  totalExamples: number
  verifiedExamples: number
}

export default function CommunityPage() {
  const { toast } = useToast()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommunityData()
  }, [])

  const loadCommunityData = async () => {
    try {
      setLoading(true)
      
      const [leaderboardResponse, statsResponse] = await Promise.all([
        api.get('/voting/leaderboard?limit=20'),
        api.get('/dashboard/metrics')
      ])

      if (leaderboardResponse.data.success) {
        setLeaderboard(leaderboardResponse.data.data)
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data)
      }
    } catch (error) {
      console.error('Community data loading error:', error)
      toast({
        title: "Failed to load community data",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Community Hub</h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Celebrating our community contributors who help build and verify the world's largest 
            code-switching corpus through voting and manual tagging.
          </p>
        </div>

        {/* Community Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Community Members</p>
                    <p className="text-3xl font-bold text-teal-600">{stats.totalUsers?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Community Votes</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalVotes?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Manual Tags</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.totalTags?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <Tag className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Verified Examples</p>
                    <p className="text-3xl font-bold text-green-600">{stats.verifiedExamples?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard */}
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>
              Top contributors ranked by total contribution points. Votes = 1 point, Manual tags = 5 points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overall" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overall">Overall</TabsTrigger>
                <TabsTrigger value="votes">Most Votes</TabsTrigger>
                <TabsTrigger value="tags">Most Tags</TabsTrigger>
                <TabsTrigger value="examples">Most Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="overall" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {leaderboard
                    .sort((a, b) => b.total_points - a.total_points)
                    .map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(index + 1)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name || 'Anonymous User'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{user.examples_submitted} examples</span>
                              <span>{user.votes_cast} votes</span>
                              <span>{user.tags_contributed} tags</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getRankBadgeColor(index + 1)}>
                            {user.total_points} points
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="votes" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {leaderboard
                    .sort((a, b) => b.votes_cast - a.votes_cast)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name || 'Anonymous User'}</h3>
                            <p className="text-sm text-gray-600">Total points: {user.total_points}</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <ThumbsUp className="mr-1 h-3 w-3" />
                          {user.votes_cast} votes
                        </Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="tags" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {leaderboard
                    .sort((a, b) => b.tags_contributed - a.tags_contributed)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-amber-50 border-amber-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            <span className="text-sm font-bold text-amber-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name || 'Anonymous User'}</h3>
                            <p className="text-sm text-gray-600">Total points: {user.total_points}</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Tag className="mr-1 h-3 w-3" />
                          {user.tags_contributed} tags
                        </Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4 mt-6">
                <div className="space-y-3">
                  {leaderboard
                    .sort((a, b) => b.examples_submitted - a.examples_submitted)
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-teal-50 border-teal-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            <span className="text-sm font-bold text-teal-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.name || 'Anonymous User'}</h3>
                            <p className="text-sm text-gray-600">Total points: {user.total_points}</p>
                          </div>
                        </div>
                        <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {user.examples_submitted} examples
                        </Badge>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* How to Contribute */}
        <Card className="mt-8 border-neutral-200">
          <CardHeader>
            <CardTitle>How to Contribute</CardTitle>
            <CardDescription>
              Join our community and help build the world's most comprehensive code-switching corpus
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-teal-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <ThumbsUp className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Vote on Examples</h3>
              <p className="text-sm text-gray-600">
                Help verify the accuracy and usefulness of examples by voting. Each vote earns 1 contribution point.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Tag className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manual Tagging</h3>
              <p className="text-sm text-gray-600">
                Manually tag language switch points to improve data quality. Each manual tag earns 5 contribution points.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Examples</h3>
              <p className="text-sm text-gray-600">
                Share real-world code-switching examples from your experience to help grow our corpus.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}