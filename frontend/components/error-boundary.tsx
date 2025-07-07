"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: 'page' | 'component' | 'critical'
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorReportingService.captureException(error, { extra: errorInfo })
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  renderErrorUI() {
    const { level = 'component' } = this.props
    const { error, errorId } = this.state

    // Custom fallback component
    if (this.props.fallback) {
      return this.props.fallback
    }

    // Critical level errors (app-wide)
    if (level === 'critical') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Application Error</CardTitle>
              <CardDescription>
                CodeBoard encountered a critical error and needs to restart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>
              {process.env.NODE_ENV === 'development' && (
                <div className="rounded bg-neutral-100 p-3 text-sm text-neutral-600">
                  <p className="font-medium">Error ID: {errorId}</p>
                  <p className="text-xs mt-1">Check console for detailed information</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReload} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload App
              </Button>
              <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    // Page level errors
    if (level === 'page') {
      return (
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle>Page Error</CardTitle>
              <CardDescription>
                This page encountered an error and couldn't load properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error?.message || 'Something went wrong on this page'}
                </AlertDescription>
              </Alert>
              {process.env.NODE_ENV === 'development' && (
                <div className="rounded bg-neutral-100 p-3 text-sm text-neutral-600">
                  <p className="font-medium">Error ID: {errorId}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    // Component level errors (default)
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-medium text-orange-800">Component Error</h3>
              <p className="text-sm text-orange-700">
                {error?.message || 'This component failed to render properly'}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-orange-600">Error ID: {errorId}</p>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={this.handleRetry}
                className="mt-2"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI()
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Convenience wrapper components for different error levels
export const CriticalErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="critical" />
)

export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
)

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
)