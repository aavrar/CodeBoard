// Type definitions for backend API integration
export interface CodeSwitchingExample {
  id: string
  text: string
  languages: string[]
  context?: string
  region?: string
  platform?: string
  age?: string
  timestamp: string
  contributorId?: string
  isVerified: boolean
}

export interface LanguagePairStats {
  pair: string
  count: number
  fill?: string
}

export interface SwitchPointData {
  month: string
  switches: number
}

export interface PlatformStats {
  platform: string
  count: number
  fill: string
}

export interface RegionStats {
  region: string
  count: number
}

export interface DashboardMetrics {
  totalExamples: number
  languagePairs: number
  contributors: number
  countries: number
  monthlyGrowth: {
    examples: number
    contributors: number
    languagePairs: number
  }
}

export interface SubmissionData {
  text: string
  languages: string[]
  context?: string
  age?: string
  region?: string
  platform?: string
}

export interface SearchFilters {
  searchTerm?: string
  languages?: string[]
  region?: string
  platform?: string
  dateRange?: {
    start: string
    end: string
  }
}
