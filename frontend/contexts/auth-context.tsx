"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  name?: string
  displayName?: string
  bio?: string
  profileImage?: string
  tier: 'COMMUNITY' | 'RESEARCHER' | 'ADMIN'
  authProvider: 'EMAIL' | 'GOOGLE' | 'GITHUB'
  emailVerified: boolean
  createdAt: string
  preferredTools: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const refreshUser = async () => {
    try {
      // Only run on client side to avoid SSR issues
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const response = await api.get('/oauth/user', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setUser(response.data.data)
      } else {
        localStorage.removeItem('authToken')
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      localStorage.removeItem('authToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token)
        }
        setUser(userData)
      } else {
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      window.location.href = '/'
    }
    setUser(null)
  }

  useEffect(() => {
    if (isClient) {
      refreshUser()
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          refreshUser()
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [isClient])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}