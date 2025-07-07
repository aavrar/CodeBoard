"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  X,
  Star,
  MessageSquare,
  TrendingUp,
  Shield,
  Target,
  Users
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface VoteStats {
  totalVotes: number
  accurateVotes: number
  inaccurateVotes: number
  helpfulVotes: number
  unhelpfulVotes: number
  voteScore: number
  qualityScore: number
  userVote?: {
    id: string
    voteType: string
    confidence: number
    comment?: string
  }
}

interface VotingPanelProps {
  exampleId: string
  isAuthenticated: boolean
  userTier?: 'COMMUNITY' | 'RESEARCHER' | 'ADMIN'
  className?: string
}

export function VotingPanel({ 
  exampleId, 
  isAuthenticated, 
  userTier = 'COMMUNITY',
  className 
}: VotingPanelProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [stats, setStats] = useState<VoteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [comment, setComment] = useState('')
  const [confidence, setConfidence] = useState(3)
  const [showComment, setShowComment] = useState(false)
  const [selectedVoteType, setSelectedVoteType] = useState<string | null>(null)

  // Load vote statistics
  useEffect(() => {
    loadVoteStats()
  }, [exampleId])

  const loadVoteStats = async () => {
    try {
      setLoading(true)
      console.log('Loading vote stats for example:', exampleId)
      const response = await api.get(`/voting/examples/${exampleId}/stats`)
      
      console.log('Vote stats response:', response.data)
      
      if (response.data.success) {
        setStats(response.data.data)
      } else {
        console.error('Failed to load vote stats:', response.data.error)
      }
    } catch (error) {
      console.error('Vote stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitVote = async (voteType: 'accurate' | 'inaccurate' | 'helpful' | 'unhelpful') => {
    console.log('Vote button clicked:', voteType, 'isAuthenticated:', isAuthenticated)
    console.log('User object:', user)
    
    const token = localStorage.getItem('authToken')
    console.log('Auth token available:', !!token)
    console.log('All localStorage keys:', Object.keys(localStorage))
    
    // Try to find token in any common OAuth storage locations
    const possibleTokens = [
      localStorage.getItem('authToken'),
      localStorage.getItem('token'),
      localStorage.getItem('access_token'),
      localStorage.getItem('oauth_token')
    ].filter(Boolean)
    
    console.log('All possible tokens found:', possibleTokens.length)
    
    if (!isAuthenticated || !token) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on examples.",
        variant: "destructive"
      })
      return
    }

    try {
      setVoting(true)
      
      const voteData = {
        voteType,
        confidence,
        comment: comment.trim() || undefined
      }

      console.log('Submitting vote:', voteData, 'to:', `/voting/examples/${exampleId}/vote`)

      const response = await api.post(`/voting/examples/${exampleId}/vote`, voteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Vote response:', response)

      if (response.data.success) {
        toast({
          title: "Vote submitted",
          description: "Thank you for your feedback!",
        })
        
        // Reset form
        setComment('')
        setConfidence(3)
        setShowComment(false)
        setSelectedVoteType(null)
        
        // Reload stats
        await loadVoteStats()
      } else {
        toast({
          title: "Vote failed",
          description: response.data.error || "Failed to submit vote",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Vote submission error:', error)
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setVoting(false)
    }
  }

  const removeVote = async (voteType: string) => {
    if (!isAuthenticated) return

    try {
      setVoting(true)
      
      const response = await api.delete(`/voting/examples/${exampleId}/vote/${voteType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.data.success) {
        toast({
          title: "Vote removed",
          description: "Your vote has been removed.",
        })
        
        await loadVoteStats()
      } else {
        toast({
          title: "Failed to remove vote",
          description: response.data.error || "Unknown error",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Vote removal error:', error)
      toast({
        title: "Error",
        description: "Failed to remove vote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setVoting(false)
    }
  }

  const getQualityBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getVerificationStatus = (score: number, totalVotes: number) => {
    if (totalVotes === 0) return { status: 'Unverified', color: 'bg-gray-100 text-gray-600' }
    if (score >= 0.8 && totalVotes >= 3) return { status: 'Verified', color: 'bg-green-100 text-green-700' }
    if (score >= 0.6 && totalVotes >= 2) return { status: 'Community Verified', color: 'bg-blue-100 text-blue-700' }
    if (score <= 0.3) return { status: 'Disputed', color: 'bg-red-100 text-red-700' }
    return { status: 'Under Review', color: 'bg-yellow-100 text-yellow-700' }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const verification = getVerificationStatus(stats.qualityScore, stats.totalVotes)

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Feedback
          </CardTitle>
          <CardDescription>
            Help improve data quality through community verification
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quality Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.accurateVotes}</div>
              <div className="text-sm text-gray-600">Accurate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.inaccurateVotes}</div>
              <div className="text-sm text-gray-600">Inaccurate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.helpfulVotes}</div>
              <div className="text-sm text-gray-600">Helpful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.totalVotes}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
          </div>

          {/* Quality Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Quality Score:</span>
              <Badge className={getQualityBadgeColor(stats.qualityScore)}>
                {(stats.qualityScore * 100).toFixed(0)}%
              </Badge>
            </div>
            
            <Badge className={verification.color}>
              {verification.status}
            </Badge>
          </div>

          {/* Vote Score */}
          {stats.totalVotes > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Community Score:</span>
              <span className={`font-bold ${stats.voteScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.voteScore > 0 ? '+' : ''}{stats.voteScore}
              </span>
            </div>
          )}

          {/* User's Current Vote */}
          {stats.userVote && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Your vote:</span>
                  <Badge variant="outline" className="capitalize">
                    {stats.userVote.voteType}
                  </Badge>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < stats.userVote!.confidence ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVote(stats.userVote!.voteType)}
                  disabled={voting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {stats.userVote.comment && (
                <div className="mt-2 text-sm text-gray-600 italic">
                  "{stats.userVote.comment}"
                </div>
              )}
            </div>
          )}

          {/* Voting Actions */}
          {isAuthenticated && !stats.userVote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => submitVote('accurate')}
                      disabled={voting}
                      className="flex items-center gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Accurate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This language detection is accurate</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => submitVote('inaccurate')}
                      disabled={voting}
                      className="flex items-center gap-1"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Inaccurate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This language detection has errors</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => submitVote('helpful')}
                      disabled={voting}
                      className="flex items-center gap-1"
                    >
                      <Heart className="h-4 w-4" />
                      Helpful
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This example is useful for research</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComment(!showComment)}
                  disabled={voting}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Comment
                </Button>
              </div>

              {/* Advanced Voting Options */}
              {showComment && (
                <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                  <div className="space-y-2">
                    <Label>Confidence Level</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Button
                          key={level}
                          variant={confidence === level ? "default" : "outline"}
                          size="sm"
                          onClick={() => setConfidence(level)}
                          className="w-8 h-8 p-0"
                        >
                          {level}
                        </Button>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {confidence === 1 ? 'Very Low' :
                         confidence === 2 ? 'Low' :
                         confidence === 3 ? 'Medium' :
                         confidence === 4 ? 'High' : 'Very High'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Optional Comment</Label>
                    <Textarea
                      id="comment"
                      placeholder="Explain your assessment (optional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {comment.length}/500
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => submitVote('unhelpful')}
                      disabled={voting}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Not Helpful
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Not Authenticated Message */}
          {!isAuthenticated && (
            <div className="text-center text-gray-600 text-sm">
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Log in
              </a> to vote and help improve data quality
            </div>
          )}

          {/* Admin/Researcher Tools */}
          {isAuthenticated && (userTier === 'RESEARCHER' || userTier === 'ADMIN') && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Research Tools: Quality Score {(stats.qualityScore * 100).toFixed(1)}% | 
                Vote Score {stats.voteScore} | 
                {stats.totalVotes} community votes
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}