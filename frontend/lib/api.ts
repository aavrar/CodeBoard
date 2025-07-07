// API utility functions for backend integration
// TODO: Replace with actual backend endpoints

import type {
  CodeSwitchingExample,
  DashboardMetrics,
  LanguagePairStats,
  SwitchPointData,
  PlatformStats,
  RegionStats,
  SubmissionData,
  SearchFilters,
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// Create axios-like API client
export const api = {
  get: async (url: string, config?: { headers?: Record<string, string> }) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    })
    
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText
    }
  },
  
  post: async (url: string, data?: any, config?: { headers?: Record<string, string> }) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    })
    
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText
    }
  },
  
  put: async (url: string, data?: any, config?: { headers?: Record<string, string> }) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    })
    
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText
    }
  }
}

// Authentication helpers
// TODO: Implement with your auth provider (NextAuth, Supabase, etc.)
export async function getAuthToken(): Promise<string | null> {
  // Return JWT token from your auth system
  return null
}

// Examples API
export async function fetchExamples(filters?: SearchFilters): Promise<CodeSwitchingExample[]> {
  const queryParams = new URLSearchParams()
  
  if (filters) {
    if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm)
    if (filters.languages) {
      filters.languages.forEach(lang => queryParams.append('languages', lang))
    }
    if (filters.region) queryParams.append('region', filters.region)
    if (filters.platform) queryParams.append('platform', filters.platform)
    if (filters.dateRange) {
      if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start)
      if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end)
    }
  }

  const response = await fetch(`${API_BASE_URL}/examples?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch examples: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function submitExample(data: SubmissionData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/examples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error || response.statusText }
    }

    return { success: result.success, id: result.data?.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Dashboard API
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(`${API_BASE_URL}/dashboard/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

export async function fetchLanguagePairStats(): Promise<LanguagePairStats[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/language-pairs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch language pair stats: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function fetchSwitchPointData(): Promise<SwitchPointData[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/switch-points`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch switch point data: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function fetchPlatformStats(): Promise<PlatformStats[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/platforms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch platform stats: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function fetchRegionStats(): Promise<RegionStats[]> {
  const response = await fetch(`${API_BASE_URL}/dashboard/regions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch region stats: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

// Reference data fetching
export async function fetchAvailableLanguages(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/languages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch available languages: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data?.map((lang: any) => lang.name) || []
}

export async function fetchAvailableRegions(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/regions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch available regions: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data?.map((region: any) => region.name) || []
}

export async function fetchAvailablePlatforms(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/platforms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch available platforms: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data?.map((platform: any) => platform.name) || []
}

// Render keep-alive ping service
export async function pingServer(): Promise<{ success: boolean; uptime?: number; error?: string }> {
  try {
    const pingUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/ping') || 'http://localhost:3001/ping'
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return { success: false, error: `Ping failed: ${response.statusText}` }
    }

    const data = await response.json()
    return { success: true, uptime: data.uptime }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown ping error' 
    }
  }
}
