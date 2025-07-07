"use client"

import { useState, useEffect, useMemo } from 'react'
import { api } from '@/lib/api'

export interface Language {
  id: string
  name: string
  code: string
}

export interface Region {
  id: string
  name: string
  country: string
}

export interface Platform {
  id: string
  name: string
  description?: string
}

interface ReferenceData {
  languages: Language[]
  regions: Region[]
  platforms: Platform[]
}

interface UseReferenceDataReturn {
  data: ReferenceData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  
  // Formatted options for SearchableSelect component
  languageOptions: Array<{ value: string; label: string; code: string }>
  regionOptions: Array<{ value: string; label: string; description: string }>
  platformOptions: Array<{ value: string; label: string; description?: string }>
}

export function useReferenceData(): UseReferenceDataReturn {
  const [data, setData] = useState<ReferenceData>({
    languages: [],
    regions: [],
    platforms: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReferenceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all reference data in parallel
      const [languagesResponse, regionsResponse, platformsResponse] = await Promise.all([
        api.get('/languages'),
        api.get('/regions'), 
        api.get('/platforms')
      ])

      // Check for errors
      if (!languagesResponse.data.success) {
        throw new Error(languagesResponse.data.message || 'Failed to fetch languages')
      }
      if (!regionsResponse.data.success) {
        throw new Error(regionsResponse.data.message || 'Failed to fetch regions')
      }
      if (!platformsResponse.data.success) {
        throw new Error(platformsResponse.data.message || 'Failed to fetch platforms')
      }

      setData({
        languages: languagesResponse.data.data || [],
        regions: regionsResponse.data.data || [],
        platforms: platformsResponse.data.data || []
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reference data'
      setError(errorMessage)
      console.error('Reference data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchReferenceData()
  }

  useEffect(() => {
    fetchReferenceData()
  }, [])

  // Format data for SearchableSelect components
  const languageOptions = useMemo(() => {
    return data.languages.map(lang => ({
      value: lang.name, // Use name as value for backend compatibility
      label: lang.name,
      code: lang.code
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [data.languages])

  const regionOptions = useMemo(() => {
    return data.regions.map(region => ({
      value: region.name,
      label: region.name,
      description: region.country
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [data.regions])

  const platformOptions = useMemo(() => {
    return data.platforms.map(platform => ({
      value: platform.name,
      label: platform.name,
      description: platform.description
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [data.platforms])

  return {
    data,
    loading,
    error,
    refetch,
    languageOptions,
    regionOptions,
    platformOptions
  }
}

// Hook for just languages (commonly used)
export function useLanguages() {
  const { data, loading, error, languageOptions } = useReferenceData()
  
  return {
    languages: data.languages,
    languageOptions,
    loading,
    error
  }
}

// Hook for just regions
export function useRegions() {
  const { data, loading, error, regionOptions } = useReferenceData()
  
  return {
    regions: data.regions,
    regionOptions,
    loading,
    error
  }
}

// Hook for just platforms
export function usePlatforms() {
  const { data, loading, error, platformOptions } = useReferenceData()
  
  return {
    platforms: data.platforms,
    platformOptions,
    loading,
    error
  }
}