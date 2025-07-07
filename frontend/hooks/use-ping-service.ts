'use client'

import { useEffect, useRef, useState } from 'react'
import { pingServer } from '@/lib/api'

interface PingStatus {
  isConnected: boolean
  lastPingTime: Date | null
  uptime: number | null
  error: string | null
  pingCount: number
}

export function usePingService() {
  const [status, setStatus] = useState<PingStatus>({
    isConnected: false,
    lastPingTime: null,
    uptime: null,
    error: null,
    pingCount: 0
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const performPing = async () => {
    try {
      const result = await pingServer()
      
      if (result.success) {
        setStatus(prev => ({
          isConnected: true,
          lastPingTime: new Date(),
          uptime: result.uptime || null,
          error: null,
          pingCount: prev.pingCount + 1
        }))
      } else {
        throw new Error(result.error || 'Ping failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        error: errorMessage,
        pingCount: prev.pingCount + 1
      }))

      // Retry after 30 seconds on failure
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        performPing()
      }, 30000)
    }
  }

  const startPingService = () => {
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Perform initial ping
    performPing()

    // Set up regular ping every 7 minutes (420,000 ms)
    intervalRef.current = setInterval(() => {
      performPing()
    }, 420000)
  }

  const stopPingService = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined') return

    // Start ping service when component mounts
    startPingService()

    // Cleanup on unmount
    return () => {
      stopPingService()
    }
  }, [])

  return {
    status,
    startPingService,
    stopPingService,
    performPing
  }
}