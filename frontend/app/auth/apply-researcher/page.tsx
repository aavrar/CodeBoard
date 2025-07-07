"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Globe, GraduationCap, Clock, Send, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface ResearchTool {
  id: string
  name: string
  description: string
  category: string
}

export default function ApplyResearcherPage() {
  const [availableTools, setAvailableTools] = useState<ResearchTool[]>([])
  const [formData, setFormData] = useState({
    requestedTools: [] as string[],
    justification: '',
    institution: '',
    researchArea: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.tier === 'RESEARCHER' || user?.tier === 'ADMIN') {
      router.push('/dashboard')
      return
    }
    loadResearchTools()
  }, [user, router])

  const loadResearchTools = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await api.get('/research/tools', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setAvailableTools(response.data.data)
      }
    } catch (err) {
      console.error('Failed to load research tools:', err)
      setError('Failed to load research tools')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToolToggle = (toolId: string) => {
    setFormData(prev => ({
      ...prev,
      requestedTools: prev.requestedTools.includes(toolId)
        ? prev.requestedTools.filter(id => id !== toolId)
        : [...prev.requestedTools, toolId]
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (formData.requestedTools.length === 0) {
      setError('Please select at least one research tool')
      setIsSubmitting(false)
      return
    }

    if (formData.justification.length < 50) {
      setError('Please provide a more detailed justification (minimum 50 characters)')
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await api.post('/research/applications', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setSuccess(true)
      } else {
        setError(response.data.message || 'Application submission failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading application form...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50 to-neutral-50">
            <CardHeader className="text-center">
              <div className="mx-auto bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-neutral-900">Application Submitted!</CardTitle>
              <CardDescription>
                Your researcher access request has been received
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-emerald-200">
                <h3 className="font-medium text-neutral-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Our team will review your application</li>
                  <li>• You'll receive an email update within 3-5 business days</li>
                  <li>• If approved, researcher tools will be activated automatically</li>
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => router.push('/dashboard')} className="flex-1 bg-teal-600 hover:bg-teal-700">
                  Go to Dashboard
                </Button>
                <Button onClick={() => router.push('/auth/applications')} variant="outline" className="flex-1">
                  View Status
                </Button>
              </div>
            </CardContent>
          </Card>
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
          
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Apply for Researcher Access</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Get access to advanced research tools and collaborate with the academic community
          </p>
        </div>

        <form onSubmit={handleSubmitApplication}>
          <div className="space-y-6">
            {/* Research Tools Selection */}
            <Card className="border-neutral-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-900">Research Tools Requested *</CardTitle>
                <CardDescription>
                  Select the tools you need for your research. You can request additional tools later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {availableTools.map((tool) => (
                    <div
                      key={tool.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.requestedTools.includes(tool.id)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      onClick={() => handleToolToggle(tool.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={formData.requestedTools.includes(tool.id)}
                          onChange={() => handleToolToggle(tool.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900 mb-1">{tool.name}</h3>
                          <p className="text-sm text-neutral-600 mb-2">{tool.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card className="border-neutral-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-900">Application Details</CardTitle>
                <CardDescription>
                  Tell us about your research and why you need these tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution" className="text-neutral-700">Institution/Organization</Label>
                    <Input
                      id="institution"
                      type="text"
                      placeholder="University, company, or research institution"
                      value={formData.institution}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="researchArea" className="text-neutral-700">Research Area</Label>
                    <Input
                      id="researchArea"
                      type="text"
                      placeholder="e.g., Computational Linguistics, NLP, Sociolinguistics"
                      value={formData.researchArea}
                      onChange={(e) => handleInputChange('researchArea', e.target.value)}
                      className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification" className="text-neutral-700">Research Justification *</Label>
                  <Textarea
                    id="justification"
                    placeholder="Please describe your research project, how you plan to use CodeBoard data, and why you need researcher access. Include details about your methodology, expected outcomes, and how this research will contribute to the field."
                    value={formData.justification}
                    onChange={(e) => handleInputChange('justification', e.target.value)}
                    required
                    minLength={50}
                    maxLength={2000}
                    className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500 min-h-[120px]"
                  />
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Minimum 50 characters required</span>
                    <span>{formData.justification.length}/2000</span>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                    <Clock className="h-4 w-4 text-amber-600 mr-2" />
                    Review Process
                  </h3>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• Applications are reviewed by our research team</li>
                    <li>• Typical review time: 3-5 business days</li>
                    <li>• You'll receive email updates on your application status</li>
                    <li>• Additional information may be requested if needed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-neutral-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-600">
                    <p>Selected tools: {formData.requestedTools.length}</p>
                    <p>Justification: {formData.justification.length} characters</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || formData.requestedTools.length === 0 || formData.justification.length < 50}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        Submit Application
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>

        <div className="text-center mt-8 text-sm text-neutral-500">
          Need help with your application?{' '}
          <Link href="/help/researcher-application" className="text-teal-600 hover:text-teal-700">
            View our guide
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-teal-600 hover:text-teal-700">
            contact support
          </Link>
        </div>
      </div>
    </div>
  )
}