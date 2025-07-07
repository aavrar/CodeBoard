"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const error = searchParams.get('error')
    
    let errorMessage = 'An unknown error occurred during authentication.'
    
    switch (error) {
      case 'oauth_denied':
        errorMessage = 'OAuth authentication was denied. Please try again.'
        break
      case 'missing_code':
        errorMessage = 'Missing authorization code. Please try the login process again.'
        break
      case 'server_error':
        errorMessage = 'Server error during authentication. Please try again later.'
        break
      case 'invalid_token':
        errorMessage = 'Invalid authentication token. Please try logging in again.'
        break
    }

    toast({
      title: "Authentication failed",
      description: errorMessage,
      variant: "destructive"
    })
  }, [searchParams, toast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">
            There was an issue with your login. Please try again.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}