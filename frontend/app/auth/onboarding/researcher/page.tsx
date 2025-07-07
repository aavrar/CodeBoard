"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Globe, GraduationCap, BarChart3, Database, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface ResearchTool {
  id: string
  name: string
  description: string
  category: string
  requiredTier: string
  isDefault: boolean
}

export default function ResearcherOnboardingPage() {
  const [availableTools, setAvailableTools] = useState<ResearchTool[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadResearchTools()
  }, [])

  const loadResearchTools = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await api.get('/research/tools', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const tools = response.data.data
        setAvailableTools(tools)
        setSelectedTools(tools.filter((tool: ResearchTool) => tool.isDefault).map((tool: ResearchTool) => tool.id))
      }
    } catch (err) {
      console.error('Failed to load research tools:', err)
      setError('Failed to load research tools')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToolToggle = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      
      await api.put('/oauth/user/preferences', {
        preferredTools: selectedTools
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      await refreshUser()
      router.push('/dashboard?welcome=researcher')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save preferences')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'analysis': return <BarChart3 className="h-4 w-4" />
      case 'data management': return <Database className="h-4 w-4" />
      case 'ai/ml': return <Zap className="h-4 w-4" />
      case 'collaboration': return <Users className="h-4 w-4" />
      default: return <Database className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading research tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">CodeBoard</span>
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              <GraduationCap className="h-4 w-4 mr-1" />
              Researcher Access Granted
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome to CodeBoard Research</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Your educational email has been verified! Choose the research tools that match your needs to customize your CodeBoard experience.
          </p>
        </div>

        <Card className="border-neutral-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-neutral-900">Select Your Research Tools</CardTitle>
            <CardDescription>
              These tools will be available in your dashboard. You can modify your selection anytime in settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {availableTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTools.includes(tool.id)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => handleToolToggle(tool.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedTools.includes(tool.id)}
                      onChange={() => handleToolToggle(tool.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="bg-neutral-100 p-1.5 rounded">
                          {getCategoryIcon(tool.category)}
                        </div>
                        <h3 className="font-medium text-neutral-900">{tool.name}</h3>
                        {tool.isDefault && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">{tool.description}</p>
                      <p className="text-xs text-neutral-500 mt-1">Category: {tool.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-neutral-50 rounded-lg p-4">
              <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
                What you get as a researcher:
              </h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Access to advanced analytics and visualization tools</li>
                <li>• Bulk data export in multiple formats (CSV, JSON, XML)</li>
                <li>• API access for programmatic data retrieval</li>
                <li>• Priority support for research inquiries</li>
                <li>• Collaboration features for team research projects</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-neutral-600">
                Selected: {selectedTools.length} of {availableTools.length} tools
              </div>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isSubmitting || selectedTools.length === 0}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  'Setting up...'
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-neutral-500">
          Need help? Check out our{' '}
          <Link href="/docs/researcher-guide" className="text-teal-600 hover:text-teal-700">
            Researcher Guide
          </Link>{' '}
          or{' '}
          <Link href="/support" className="text-teal-600 hover:text-teal-700">
            contact support
          </Link>
        </div>
      </div>
    </div>
  )
}