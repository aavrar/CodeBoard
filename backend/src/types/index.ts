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
export enum UserTier {
  COMMUNITY = 'COMMUNITY',
  RESEARCHER = 'RESEARCHER',
  ADMIN = 'ADMIN'
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface UserPayload {
  id: string
  email: string
  name?: string
  tier: UserTier
  authProvider: AuthProvider
}

export interface PublicUserProfile {
  id: string
  displayName?: string
  bio?: string
  profileImage?: string
  tier: UserTier
  createdAt: string
  contributionCount: number
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
  password: z.string().min(8, 'Password must be at least 8 characters').optional(), // Optional for OAuth
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  displayName: z.string().max(50, 'Display name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  authProvider: z.nativeEnum(AuthProvider).default(AuthProvider.EMAIL)
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
  provider: z.nativeEnum(AuthProvider)
})

export const researchApplicationSchema = z.object({
  requestedTools: z.array(z.string()).min(1, 'At least one research tool required'),
  justification: z.string().min(50, 'Please provide detailed justification (min 50 characters)').max(2000, 'Justification too long'),
  institution: z.string().max(200, 'Institution name too long').optional(),
  researchArea: z.string().max(200, 'Research area too long').optional()
})

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>
export type OAuthCallbackData = z.infer<typeof oauthCallbackSchema>
export type ResearchApplicationData = z.infer<typeof researchApplicationSchema>

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

// Enhanced NLP types
export interface Token {
  word: string
  lang: string
  confidence: number
}

export interface PhraseCluster {
  words: string[]
  text: string
  language: string
  confidence: number
  startIndex: number
  endIndex: number
  isUserLanguage: boolean
}

export interface EnhancedNlpResult {
  tokens: Token[]
  phrases: PhraseCluster[]
  switchPoints: number[]
  confidence: number
  userLanguageMatch: boolean
  detectedLanguages: string[]
}

export interface NlpAnalysisResult {
  tokens: Token[]
  switchPoints: number[]
  confidence: number
}

export interface LanguageDetectionResult {
  language: string
  confidence: number
}

export interface DetectionStats {
  totalTokens: number
  totalSwitchPoints: number
  overallConfidence: number
  languageBreakdown: Array<{
    language: string
    count: number
    averageConfidence: number
    percentage: number
  }>
}

export interface EnhancedDetectionStats {
  totalTokens: number
  totalPhrases: number
  totalSwitchPoints: number
  overallConfidence: number
  userLanguageMatch: boolean
  detectedLanguages: string[]
  languageBreakdown: Array<{
    language: string
    tokenCount: number
    phraseCount: number
    averageConfidence: number
    percentage: number
  }>
  averageWordsPerPhrase: number
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
  isPublic: boolean
  qualityScore?: number
  contributorNotes?: string
  tokens?: Token[]
  phrases?: PhraseCluster[]
  switchPoints?: number[]
  confidence?: number
  detectedLanguages?: string[]
  userLanguageMatch?: boolean
}

// Research application interfaces
export interface ResearchApplication {
  id: string
  userId: string
  requestedTools: string[]
  justification: string
  institution?: string
  researchArea?: string
  status: ApplicationStatus
  reviewedBy?: string
  reviewNotes?: string
  submittedAt: string
  reviewedAt?: string
  user?: PublicUserProfile
  reviewer?: PublicUserProfile
}

// OAuth provider interfaces
export interface OAuthProfile {
  id: string
  email: string
  name?: string
  picture?: string
  verified_email?: boolean
}

export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

// Email domain validation
export interface EmailDomainInfo {
  domain: string
  isEducational: boolean
  institution?: string
  country?: string
}

// Research tools configuration
export interface ResearchTool {
  id: string
  name: string
  description: string
  category: string
  requiredTier: UserTier
  isDefault: boolean
}

// User session interface
export interface UserSession {
  user: UserPayload
  sessionId: string
  expiresAt: string
  lastActivity: string
}