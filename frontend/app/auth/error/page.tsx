"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Globe, AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorInfo = (errorCode: string | null) => {
    switch (errorCode) {
      case 'oauth_denied':
        return {
          title: 'Authorization Cancelled',
          description: 'You cancelled the sign-in process. No worries, you can try again anytime.',
          suggestions: [
            'Try signing in again with the same provider',
            'Make sure you grant the necessary permissions',
            'Use a different sign-in method if preferred'
          ]
        }
      case 'missing_code':
        return {
          title: 'Authentication Error',
          description: 'There was an issue with the authentication process.',
          suggestions: [
            'Try signing in again',
            'Clear your browser cache and cookies',
            'Try a different browser or device'
          ]
        }
      case 'no_email':
        return {
          title: 'Email Required',
          description: 'We need access to your email address to create your account.',
          suggestions: [
            'Make sure to grant email permissions when signing in',
            'Check your provider account has a valid email address',
            'Try signing in with a different provider'
          ]
        }
      case 'server_error':
        return {
          title: 'Server Error',
          description: 'Something went wrong on our end. This is usually temporary.',
          suggestions: [
            'Wait a few minutes and try again',
            'Check if there are any ongoing service issues',
            'Contact support if the problem persists'
          ]
        }
      case 'missing_token':
        return {
          title: 'Session Error',
          description: 'Your authentication session could not be established.',
          suggestions: [
            'Try signing in again from the beginning',
            'Make sure cookies are enabled in your browser',
            'Disable any browser extensions that might interfere'
          ]
        }
      case 'oauth_not_configured':
        return {
          title: 'OAuth Not Available',
          description: 'This sign-in method is not currently configured on this server.',
          suggestions: [
            'Try signing in with email and password instead',
            'Contact the administrator to set up OAuth providers',
            'Use a different sign-in method'
          ]
        }
      default:
        return {
          title: 'Authentication Failed',
          description: 'An unexpected error occurred during sign-in.',
          suggestions: [
            'Try signing in again',
            'Try a different sign-in method',
            'Contact support if the problem continues'
          ]
        }
    }
  }

  const errorInfo = getErrorInfo(error)

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

        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-neutral-900">{errorInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorInfo.description}
              </AlertDescription>
            </Alert>

            <div className="bg-neutral-50 rounded-lg p-4">
              <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 text-neutral-600 mr-2" />
                What you can try:
              </h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                <Link href="/auth/login">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Get Help
                  </Link>
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-center">
                <details className="text-xs text-neutral-500">
                  <summary className="cursor-pointer hover:text-neutral-700">
                    Technical details
                  </summary>
                  <div className="mt-2 p-2 bg-neutral-100 rounded text-left">
                    Error code: {error}
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-neutral-500">
          Still having trouble?{' '}
          <Link href="/contact" className="text-teal-600 hover:text-teal-700">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}