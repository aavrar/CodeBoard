import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables at module level
dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Don't persist auth sessions on server
  },
  db: {
    schema: 'public'
  }
})

// Database table names
export const tables = {
  users: 'users',
  examples: 'examples',
  researchApplications: 'research_applications',
  languages: 'languages',
  regions: 'regions',
  platforms: 'platforms'
} as const

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any, operation: string) {
  console.error(`Supabase ${operation} error:`, error)
  throw new Error(`Database ${operation} failed: ${error.message || 'Unknown error'}`)
}

// Type definitions for database tables
export interface User {
  id: string
  email: string
  password_hash?: string
  name?: string
  display_name?: string
  bio?: string
  profile_image?: string
  tier: 'COMMUNITY' | 'RESEARCHER' | 'ADMIN'
  auth_provider: 'EMAIL' | 'GOOGLE' | 'GITHUB'
  provider_user_id?: string
  email_verified: boolean
  is_active: boolean
  last_login_at?: string
  preferred_tools: string[]
  created_at: string
  updated_at: string
}

export interface Example {
  id: string
  text: string
  languages: string[]
  context?: string
  region?: string
  platform?: string
  age?: string
  is_verified: boolean
  is_public: boolean
  quality_score?: number
  contributor_notes?: string
  created_at: string
  updated_at: string
  
  // Enhanced NLP fields
  tokens: any[]
  phrases: any[]
  switch_points: number[]
  confidence?: number
  detected_languages: string[]
  user_language_match: boolean
  
  // Relations
  user_id?: string
}

export interface ResearchApplication {
  id: string
  user_id: string
  requested_tools: string[]
  justification: string
  institution?: string
  research_area?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewed_by?: string
  review_notes?: string
  submitted_at: string
  reviewed_at?: string
}

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