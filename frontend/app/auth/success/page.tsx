"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, CheckCircle, ArrowRight, GraduationCap, Users, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

function AuthSuccessContent() {
  const [isProcessing, setIsProcessing] = useState(true)
  const { refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processOAuthSuccess = async () => {
      const token = searchParams.get('token')
      const tier = searchParams.get('tier')

      if (token) {
        localStorage.setItem('authToken', token)
        await refreshUser()
        
        setIsProcessing(false)
        
        // Redirect based on tier
        setTimeout(() => {
          if (tier === 'RESEARCHER') {
            router.push('/auth/onboarding/researcher')
          } else {
            router.push('/auth/onboarding/community')
          }
        }, 2000)
      } else {
        router.push('/auth/error?error=missing_token')
      }
    }

    processOAuthSuccess()
  }, [searchParams, refreshUser, router])

  const tier = searchParams.get('tier') as 'COMMUNITY' | 'RESEARCHER' | 'ADMIN' | null

  const getTierInfo = (userTier: string | null) => {
    switch (userTier) {
      case 'RESEARCHER':
        return {
          icon: <GraduationCap className="h-6 w-6" />,
          label: 'Researcher Access',
          description: 'Educational email detected - you have access to research tools',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        }
      case 'ADMIN':
        return {
          icon: <Crown className="h-6 w-6" />,
          label: 'Admin Access',
          description: 'You have full administrative privileges',
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      default:
        return {
          icon: <Users className="h-6 w-6" />,
          label: 'Community Member',
          description: 'Welcome to the CodeBoard community',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }
  }

  const tierInfo = getTierInfo(tier)

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Completing sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">CodeBoard</span>
          </Link>
        </div>

        <Card className="border-emerald-200 shadow-lg bg-gradient-to-br from-emerald-50 to-neutral-50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-neutral-900">Welcome to CodeBoard!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className={tierInfo.color}>
                {tierInfo.icon}
                <span className="ml-2">{tierInfo.label}</span>
              </Badge>
              <p className="text-sm text-neutral-600 mt-2">{tierInfo.description}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <h3 className="font-medium text-neutral-900 mb-2">What's next?</h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                {tier === 'RESEARCHER' ? (
                  <>
                    <li>• Choose your research tools and preferences</li>
                    <li>• Set up your researcher profile</li>
                    <li>• Access advanced analytics and export features</li>
                  </>
                ) : (
                  <>
                    <li>• Complete your community profile setup</li>
                    <li>• Start contributing code-switching examples</li>
                    <li>• Explore the community corpus</li>
                  </>
                )}
              </ul>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-4">
                Redirecting you to complete your setup...
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => tier === 'RESEARCHER' ? router.push('/auth/onboarding/researcher') : router.push('/auth/onboarding/community')}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  Continue Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-neutral-500">
          Having trouble?{' '}
          <Link href="/help" className="text-teal-600 hover:text-teal-700">
            Get help
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}