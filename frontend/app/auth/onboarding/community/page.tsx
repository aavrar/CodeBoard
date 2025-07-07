"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Users, Heart, BookOpen, ArrowRight, Plus, GraduationCap } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function CommunityOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true)
    await refreshUser()
    router.push('/dashboard?welcome=community')
  }

  const handleApplyForResearcher = () => {
    router.push('/auth/apply-researcher')
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
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Users className="h-4 w-4 mr-1" />
              Community Member
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome to CodeBoard Community</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            You're now part of a global community of multilingual speakers contributing to code-switching research. Here's what you can do:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Community Features */}
          <Card className="border-neutral-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-900 flex items-center">
                <Heart className="h-5 w-5 text-red-500 mr-2" />
                Community Features
              </CardTitle>
              <CardDescription>
                Everything you can do as a community member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-teal-100 p-1.5 rounded-full">
                    <Plus className="h-3 w-3 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">Submit Examples</h3>
                    <p className="text-sm text-neutral-600">Share your code-switching examples to help build the corpus</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 p-1.5 rounded-full">
                    <BookOpen className="h-3 w-3 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">Explore Data</h3>
                    <p className="text-sm text-neutral-600">Browse and discover patterns in the community corpus</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-emerald-100 p-1.5 rounded-full">
                    <Users className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">Community Dashboard</h3>
                    <p className="text-sm text-neutral-600">View analytics and insights about the platform</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCompleteOnboarding}
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? (
                  'Getting started...'
                ) : (
                  <>
                    Start Contributing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Researcher Access */}
          <Card className="border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50 to-neutral-50">
            <CardHeader>
              <CardTitle className="text-xl text-neutral-900 flex items-center">
                <GraduationCap className="h-5 w-5 text-emerald-600 mr-2" />
                Need Research Tools?
              </CardTitle>
              <CardDescription>
                Unlock advanced features for academic research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm text-neutral-600">
                  <strong>Researcher access includes:</strong>
                </div>
                
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Advanced analytics and visualizations</li>
                  <li>• Bulk data export (CSV, JSON, XML)</li>
                  <li>• API access for programmatic use</li>
                  <li>• ML model training capabilities</li>
                  <li>• Collaboration tools for research teams</li>
                </ul>

                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium">
                    ✓ Free for students and academics
                  </p>
                  <p className="text-xs text-neutral-600">
                    Submit an application to get researcher access
                  </p>
                </div>
              </div>

              <Button
                onClick={handleApplyForResearcher}
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                Apply for Researcher Access
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Tips */}
        <Card className="border-neutral-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-neutral-900">Quick Start Guide</CardTitle>
            <CardDescription>
              Here are some suggestions to get you started on CodeBoard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-neutral-200 rounded-lg">
                <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-teal-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">Submit Your First Example</h3>
                <p className="text-sm text-neutral-600">Share a code-switching example from your daily conversations</p>
              </div>
              
              <div className="text-center p-4 border border-neutral-200 rounded-lg">
                <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">Explore the Corpus</h3>
                <p className="text-sm text-neutral-600">Browse examples from other multilingual speakers</p>
              </div>
              
              <div className="text-center p-4 border border-neutral-200 rounded-lg">
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">Join the Community</h3>
                <p className="text-sm text-neutral-600">Connect with researchers and fellow contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-neutral-500">
          Questions about the platform?{' '}
          <Link href="/help" className="text-teal-600 hover:text-teal-700">
            Visit our help center
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-teal-600 hover:text-teal-700">
            get in touch
          </Link>
        </div>
      </div>
    </div>
  )
}