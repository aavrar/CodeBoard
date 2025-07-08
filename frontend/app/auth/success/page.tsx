"use client"

import { useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const handleAuthSuccess = useCallback(async () => {
    try {
      const token = searchParams.get('token')
      const tier = searchParams.get('tier')

      if (!token) {
        throw new Error('No authentication token provided')
      }

      // Store the token in localStorage
      localStorage.setItem('authToken', token)
      console.log('Token stored in localStorage:', token.substring(0, 20) + '...')
      
      // Verify token was stored
      const storedToken = localStorage.getItem('authToken')
      console.log('Token verification - stored successfully:', !!storedToken)

      // Refresh the user data
      await refreshUser()

      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome! You're logged in as ${tier?.toLowerCase()} user.`,
      })

      // Redirect to dashboard or home
      router.replace('/dashboard')
    } catch (error) {
      console.error('Auth success handling error:', error)
      
      toast({
        title: "Authentication error",
        description: "There was an issue completing your login. Please try again.",
        variant: "destructive"
      })
      
      router.replace('/auth/login')
    }
  }, [searchParams, refreshUser, toast, router])

  useEffect(() => {
    handleAuthSuccess()
  }, [handleAuthSuccess])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing your login...</h2>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  )
}