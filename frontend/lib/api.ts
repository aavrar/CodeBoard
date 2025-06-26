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

// Authentication helpers
// TODO: Implement with your auth provider (NextAuth, Supabase, etc.)
export async function getAuthToken(): Promise<string | null> {
  // Return JWT token from your auth system
  return null
}

// Examples API
export async function fetchExamples(filters?: SearchFilters): Promise<CodeSwitchingExample[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/examples`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${await getAuthToken()}`
  //   },
  //   body: JSON.stringify(filters)
  // })
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}

export async function submitExample(data: SubmissionData): Promise<{ success: boolean; id?: string; error?: string }> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/examples`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${await getAuthToken()}`
  //   },
  //   body: JSON.stringify(data)
  // })
  // return response.json()

  // MOCK RESPONSE - Remove when backend is ready
  return { success: true, id: "mock-id-" + Date.now() }
}

// Dashboard API
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/dashboard/metrics`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return {
    totalExamples: 15247,
    languagePairs: 127,
    contributors: 1234,
    countries: 67,
    monthlyGrowth: {
      examples: 12,
      contributors: 89,
      languagePairs: 3,
    },
  }
}

export async function fetchLanguagePairStats(): Promise<LanguagePairStats[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/dashboard/language-pairs`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}

export async function fetchSwitchPointData(): Promise<SwitchPointData[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/dashboard/switch-points`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}

export async function fetchPlatformStats(): Promise<PlatformStats[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/dashboard/platforms`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}

export async function fetchRegionStats(): Promise<RegionStats[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/dashboard/regions`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}

// Utility functions
export async function fetchAvailableLanguages(): Promise<string[]> {
  // TODO: Replace with actual API call to get supported languages
  // const response = await fetch(`${API_BASE_URL}/languages`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return [
    "English",
    "Spanish",
    "Hindi",
    "Mandarin",
    "French",
    "Arabic",
    "Portuguese",
    "Russian",
    "Japanese",
    "German",
    "Korean",
    "Italian",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Tagalog",
    "Urdu",
    "Bengali",
  ]
}

export async function fetchAvailableRegions(): Promise<string[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/regions`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}

export async function fetchAvailablePlatforms(): Promise<string[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/platforms`)
  // return response.json()

  // MOCK DATA - Remove when backend is ready
  return []
}
