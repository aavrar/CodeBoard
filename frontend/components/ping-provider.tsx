'use client'

import { useEffect, useState } from 'react'
import { usePingService } from '@/hooks/use-ping-service'

export function PingProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  
  // Initialize ping service - hook handles all the logic
  const { status } = usePingService()

  // Ensure we're on the client side to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Optional: Log ping status for debugging (remove in production)
  useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development' && status.pingCount > 0) {
      console.log(`[Ping Service] Status: ${status.isConnected ? 'Connected' : 'Disconnected'}, Count: ${status.pingCount}`)
    }
  }, [isClient, status.isConnected, status.pingCount])

  return <>{children}</>
}