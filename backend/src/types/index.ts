import { z } from 'zod'

// API Response format
export interface ApiResponse<T = any> {
  success: boolean
  data: T | null
  message: string
  error: string | null
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// User types
export interface UserPayload {
  id: string
  email: string
  name?: string
}

// Example submission validation schema
export const exampleSubmissionSchema = z.object({
  text: z.string().min(1, 'Text is required').max(2000, 'Text too long'),
  languages: z.array(z.string()).min(2, 'At least 2 languages required'),
  context: z.string().max(1000, 'Context too long').optional(),
  region: z.string().max(100, 'Region too long').optional(),
  platform: z.string().max(50, 'Platform too long').optional(),
  age: z.string().max(20, 'Age too long').optional()
})

export type ExampleSubmissionData = z.infer<typeof exampleSubmissionSchema>

// Search filters validation schema
export const searchFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  languages: z.array(z.string()).optional(),
  region: z.string().optional(),
  platform: z.string().optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

export type SearchFilters = z.infer<typeof searchFiltersSchema>

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long')
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>

// Dashboard response types
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

// Database model types (matching Prisma)
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