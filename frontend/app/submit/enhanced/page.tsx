"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Zap, 
  Send, 
  Edit3, 
  CheckCircle, 
  ArrowRight, 
  Info,
  Clock,
  Languages
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LiveAnalyzer } from "@/components/live-analyzer"
import { SwitchPointEditor } from "@/components/switch-point-editor"
import type { LiveAnalysisResponse } from "@/hooks/use-live-analysis"

type SubmissionStep = 'analyze' | 'edit' | 'submit' | 'complete'

interface SubmissionData {
  text: string
  languages: string[]
  context?: string
  age?: string
  region?: string
  platform?: string
  analysisResult?: LiveAnalysisResponse
  corrections?: any
}

export default function EnhancedSubmitPage() {
  const [currentStep, setCurrentStep] = useState<SubmissionStep>('analyze')
  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    text: '',
    languages: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleAnalysisComplete = (result: LiveAnalysisResponse) => {
    setSubmissionData(prev => ({
      ...prev,
      text: result.text,
      languages: result.userLanguages,
      analysisResult: result
    }))
  }

  const handleEditComplete = (corrections: any) => {
    setSubmissionData(prev => ({
      ...prev,
      corrections
    }))
    setCurrentStep('submit')
  }

  const handleSubmit = async () => {
    if (!submissionData.analysisResult) {
      toast({
        title: "Analysis Required",
        description: "Please analyze your text before submitting.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare submission data with analysis results
      const submissionPayload = {
        text: submissionData.text,
        languages: submissionData.languages,
        context: submissionData.context,
        age: submissionData.age,
        region: submissionData.region,
        platform: submissionData.platform,
        // Include analysis results for database storage
        analysisData: {
          tokens: submissionData.analysisResult.analysis.tokens,
          phrases: submissionData.analysisResult.analysis.phrases,
          switchPoints: submissionData.analysisResult.analysis.switchPoints,
          confidence: submissionData.analysisResult.analysis.confidence,
          detectedLanguages: submissionData.analysisResult.analysis.detectedLanguages,
          userLanguageMatch: submissionData.analysisResult.analysis.userLanguageMatch,
          processingTime: submissionData.analysisResult.processing.timeMs
        },
        // Include any user corrections
        userCorrections: submissionData.corrections || null,
        submissionType: 'enhanced-interactive',
        version: 'v2.0'
      }

      // Submit to the enhanced examples endpoint
      const response = await fetch('/api/examples/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if user is logged in
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(submissionPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      toast({
        title: "Success!",
        description: "Your code-switching example has been submitted and saved to the corpus.",
      })
      
      setCurrentStep('complete')
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your example. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmissionData({ text: '', languages: [] })
    setCurrentStep('analyze')
  }

  const canProceedToEdit = submissionData.analysisResult && 
    submissionData.analysisResult.analysis.confidence > 0

  const canSubmit = submissionData.analysisResult && 
    submissionData.text.length > 10

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Enhanced Code-Switching Submission</h1>
          <p className="text-muted-foreground">
            Submit your multilingual text with real-time analysis and interactive editing
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`flex items-center space-x-2 ${currentStep === 'analyze' ? 'text-blue-600' : currentStep === 'edit' || currentStep === 'submit' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'analyze' ? 'bg-blue-100' : currentStep === 'edit' || currentStep === 'submit' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Analyze</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'edit' ? 'text-blue-600' : currentStep === 'submit' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'edit' ? 'bg-blue-100' : currentStep === 'submit' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Edit3 className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Edit (Optional)</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'submit' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'submit' ? 'bg-blue-100' : currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Send className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Submit</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-gray-400" />
          
          <div className={`flex items-center space-x-2 ${currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`rounded-full p-2 ${currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'analyze' && (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Enter your multilingual text and select the languages you're using. 
                Our enhanced AI will analyze your text in real-time and highlight language boundaries.
                <strong> No data is saved until you complete the final submission step.</strong>
              </AlertDescription>
            </Alert>
            
            <LiveAnalyzer 
              onAnalysisComplete={handleAnalysisComplete}
              initialText={submissionData.text}
              initialLanguages={submissionData.languages}
            />
            
            {submissionData.analysisResult && (
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('edit')}
                  disabled={!canProceedToEdit}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Detection (Optional)
                </Button>
                <Button
                  onClick={() => setCurrentStep('submit')}
                  disabled={!canSubmit}
                >
                  Skip to Submit
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'edit' && submissionData.analysisResult && (
          <div className="space-y-6">
            <Alert>
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                Review and correct the language detection. Your corrections help improve our system for everyone!
              </AlertDescription>
            </Alert>
            
            <SwitchPointEditor
              analysisResult={submissionData.analysisResult}
              onSaveCorrections={handleEditComplete}
              onCancel={() => setCurrentStep('analyze')}
            />
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('submit')}
              >
                Skip to Submit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'submit' && submissionData.analysisResult && (
          <div className="space-y-6">
            <Alert>
              <Send className="h-4 w-4" />
              <AlertDescription>
                Review your analysis and add optional context. Your example will only be saved to the database when you click "Submit Example".
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Review Your Submission</CardTitle>
                <CardDescription>
                  Confirm your analyzed text and add optional context information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Analysis Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Analysis Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Text Length</div>
                      <div className="font-medium">{submissionData.text.length} characters</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Languages</div>
                      <div className="font-medium">{submissionData.analysisResult.analysis.detectedLanguages.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Switch Points</div>
                      <div className="font-medium">{submissionData.analysisResult.analysis.switchPoints.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-medium">{Math.round(submissionData.analysisResult.analysis.confidence * 100)}%</div>
                    </div>
                  </div>
                  
                  {submissionData.corrections && (
                    <div className="mt-3 p-2 bg-blue-50 rounded border">
                      <div className="text-sm text-blue-800">
                        ✓ User corrections applied ({submissionData.corrections.correctionType})
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Context Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="context">Context (Optional)</Label>
                    <Textarea
                      id="context"
                      placeholder="Describe the situation where this text might be used..."
                      value={submissionData.context || ''}
                      onChange={(e) => setSubmissionData(prev => ({ ...prev, context: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="region">Region (Optional)</Label>
                      <Input
                        id="region"
                        placeholder="e.g., California, Mumbai, London"
                        value={submissionData.region || ''}
                        onChange={(e) => setSubmissionData(prev => ({ ...prev, region: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="platform">Platform (Optional)</Label>
                      <Select value={submissionData.platform || ''} onValueChange={(value) => setSubmissionData(prev => ({ ...prev, platform: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="messaging">Messaging</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual Conversation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('edit')}
                  >
                    Back to Edit
                  </Button>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canSubmit}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Example
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-green-600">Submission Complete!</h2>
              <p className="text-muted-foreground mt-2">
                Thank you for contributing to our code-switching corpus. Your example will help advance multilingual research.
              </p>
            </div>
            
            {submissionData.analysisResult && (
              <div className="bg-green-50 p-4 rounded-lg max-w-md mx-auto">
                <h4 className="font-medium text-green-800 mb-2">Contribution Summary</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Languages: {submissionData.analysisResult.analysis.detectedLanguages.join(', ')}</div>
                  <div>Switch Points: {submissionData.analysisResult.analysis.switchPoints.length}</div>
                  <div>Processing Time: {submissionData.analysisResult.processing.timeMs}ms</div>
                  {submissionData.corrections && <div>✓ User corrections included</div>}
                </div>
              </div>
            )}
            
            <div className="space-x-3">
              <Button onClick={resetForm}>
                Submit Another Example
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/explore'}>
                Explore Corpus
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}