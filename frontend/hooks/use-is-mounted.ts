'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to determine if component has mounted on client-side
 * Useful for preventing hydration mismatches caused by browser extensions
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}