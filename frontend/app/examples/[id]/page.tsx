"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VotingPanel } from '@/components/voting/voting-panel'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { ArrowLeft, Calendar, MapPin, MessageSquare, Globe, Copy, Share2 } from 'lucide-react'
import type { CodeSwitchingExample } from '@/types'

export default function ExampleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const [example, setExample] = useState<CodeSwitchingExample | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const exampleId = params.id as string

  useEffect(() => {
    if (exampleId) {
      loadExample()
    }
  }, [exampleId])

  const loadExample = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/examples/${exampleId}`)
      
      if (response.data.success) {
        setExample(response.data.data)
      } else {
        setError(response.data.error || 'Failed to load example')
      }
    } catch (error) {
      console.error('Example loading error:', error)
      setError('Failed to load example. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Example text has been copied.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareExample = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied",
        description: "Example URL has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !example) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Example Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The example you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/explore')} className="bg-teal-600 hover:bg-teal-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Explore
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Code-Switching Example</h1>
              <p className="text-gray-600">Detailed analysis and community feedback</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(example.text)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareExample}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Example Text */}
            <Card>
              <CardHeader>
                <CardTitle>Example Text</CardTitle>
                <CardDescription>Original code-switching content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-teal-500">
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    "{example.text}"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages Detected</CardTitle>
                <CardDescription>Primary languages found in this example</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {example.languages.map((lang, index) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className={`text-sm px-3 py-1 ${
                        index === 0 ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Context & Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Context & Details</CardTitle>
                <CardDescription>Additional information about this example</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {example.context && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Context</p>
                      <p className="text-gray-600">{example.context}</p>
                    </div>
                  </div>
                )}

                {example.region && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Region</p>
                      <p className="text-gray-600">{example.region}</p>
                    </div>
                  </div>
                )}

                {example.platform && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Platform</p>
                      <p className="text-gray-600">{example.platform}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Submitted</p>
                    <p className="text-gray-600">
                      {new Date(example.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {example.age && (
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Age Group</p>
                      <p className="text-gray-600">{example.age}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {example.isVerified ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ✓ Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                      ⏳ Under Review
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Community Voting Panel */}
            <VotingPanel
              exampleId={example.id}
              isAuthenticated={isAuthenticated}
              userTier={user?.tier}
            />
          </div>
        </div>
      </div>
    </div>
  )
}