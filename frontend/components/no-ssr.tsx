'use client'

import dynamic from 'next/dynamic'
import React from 'react'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const NoSSRWrapper = ({ children, fallback = null }: NoSSRProps) => {
  return <>{children}</>
}

// This creates a client-only version that won't render on the server
const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => null
})

export default NoSSR