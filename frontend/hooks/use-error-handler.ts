"use client"

import { useCallback } from 'react'

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, any>
}

interface ErrorReport {
  error: Error
  errorInfo?: React.ErrorInfo
  context?: ErrorContext
  timestamp: string
  userAgent: string
  url: string
}

export function useErrorHandler() {
  const reportError = useCallback((
    error: Error, 
    errorInfo?: React.ErrorInfo, 
    context?: ErrorContext
  ) => {
    const errorReport: ErrorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as Error,
      errorInfo,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🐛 Error Report')
      console.error('Error:', error)
      console.log('Context:', context)
      console.log('Error Info:', errorInfo)
      console.log('Report:', errorReport)
      console.groupEnd()
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to your error reporting service
      try {
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport)
        // }).catch(console.error)
        
        // Or use a service like Sentry:
        // Sentry.captureException(error, {
        //   extra: { errorInfo, context }
        // })
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
      }
    }
  }, [])

  const handleAsyncError = useCallback((
    error: Error,
    context?: ErrorContext
  ) => {
    reportError(error, undefined, {
      ...context,
      action: context?.action || 'async_operation'
    })
  }, [reportError])

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R> | R,
    context?: ErrorContext
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        const result = await fn(...args)
        return result
      } catch (error) {
        handleAsyncError(error as Error, context)
        return undefined
      }
    }
  }, [handleAsyncError])

  return {
    reportError,
    handleAsyncError,
    withErrorHandling
  }
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Create a synthetic error if the rejection isn't already an Error
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason))

    // Report the error
    const errorReport: ErrorReport = {
      error,
      context: {
        component: 'window',
        action: 'unhandled_promise_rejection'
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Unhandled Promise Rejection')
      console.error('Reason:', event.reason)
      console.log('Report:', errorReport)
      console.groupEnd()
    }
  })

  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error)
    
    const errorReport: ErrorReport = {
      error: event.error || new Error(event.message),
      context: {
        component: 'window',
        action: 'uncaught_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Uncaught Error')
      console.error('Error:', event.error)
      console.log('Report:', errorReport)
      console.groupEnd()
    }
  })
}