import { Router, Request, Response } from 'express'
import { supabase, tables, handleSupabaseError } from '../utils/supabase.js'
import { ApiResponse } from '../types/index.js'
import { asyncHandler } from '../middleware/errorHandler.js'
export const referenceRoutes = Router()

// GET /api/languages - Get all available languages
referenceRoutes.get('/languages', asyncHandler(async (req: Request, res: Response) => {
  let languages: any[] = []
  
  try {
    const { data, error } = await supabase
      .from(tables.languages)
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.log('Language table query failed, using fallback data:', error.message)
    } else {
      languages = data || []
    }
  } catch (error) {
    // Table doesn't exist, use fallback data
    console.log('Language table not found, using fallback data')
  }

  // If no languages in database, return a default set
  const languageList = languages.length > 0 
    ? languages
    : [
        { id: '1', name: 'English', code: 'en' },
        { id: '2', name: 'Spanish', code: 'es' },
        { id: '3', name: 'Hindi', code: 'hi' },
        { id: '4', name: 'Chinese (Mandarin)', code: 'zh-cn' },
        { id: '5', name: 'French', code: 'fr' },
        { id: '6', name: 'Arabic', code: 'ar' },
        { id: '7', name: 'Portuguese', code: 'pt' },
        { id: '8', name: 'Russian', code: 'ru' },
        { id: '9', name: 'Japanese', code: 'ja' },
        { id: '10', name: 'German', code: 'de' }
      ]

  const response: ApiResponse<any[]> = {
    success: true,
    data: languageList,
    message: 'Languages retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/regions - Get all available regions
referenceRoutes.get('/regions', asyncHandler(async (req: Request, res: Response) => {
  let regions: any[] = []
  
  try {
    const { data, error } = await supabase
      .from(tables.regions)
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.log('Region table query failed, using fallback data:', error.message)
    } else {
      regions = data || []
    }
  } catch (error) {
    // Table doesn't exist, use fallback data
    console.log('Region table not found, using fallback data')
  }

  // If no regions in database, return a default set
  const regionList = regions.length > 0
    ? regions
    : [
        { id: '1', name: 'North America', country: 'Multiple Countries' },
        { id: '2', name: 'South America', country: 'Multiple Countries' },
        { id: '3', name: 'Europe', country: 'Multiple Countries' },
        { id: '4', name: 'East Asia', country: 'Multiple Countries' },
        { id: '5', name: 'South Asia', country: 'Multiple Countries' },
        { id: '6', name: 'Southeast Asia', country: 'Multiple Countries' },
        { id: '7', name: 'Middle East', country: 'Multiple Countries' },
        { id: '8', name: 'Africa', country: 'Multiple Countries' },
        { id: '9', name: 'Oceania', country: 'Multiple Countries' },
        { id: '10', name: 'Others', country: 'Global' }
      ]

  const response: ApiResponse<any[]> = {
    success: true,
    data: regionList,
    message: 'Regions retrieved successfully',
    error: null
  }

  res.json(response)
}))

// GET /api/platforms - Get all available platforms
referenceRoutes.get('/platforms', asyncHandler(async (req: Request, res: Response) => {
  let platforms: any[] = []
  
  try {
    const { data, error } = await supabase
      .from(tables.platforms)
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.log('Platform table query failed, using fallback data:', error.message)
    } else {
      platforms = data || []
    }
  } catch (error) {
    // Table doesn't exist, use fallback data
    console.log('Platform table not found, using fallback data')
  }

  // If no platforms in database, return a default set
  const platformList = platforms.length > 0
    ? platforms
    : [
        { id: '1', name: 'Twitter/X', description: 'Microblogging and social networking' },
        { id: '2', name: 'WhatsApp', description: 'Instant messaging' },
        { id: '3', name: 'Facebook', description: 'Social networking platform' },
        { id: '4', name: 'Instagram', description: 'Photo and video sharing' },
        { id: '5', name: 'TikTok', description: 'Short-form video platform' },
        { id: '6', name: 'SMS/Text', description: 'Traditional text messaging' },
        { id: '7', name: 'Email', description: 'Electronic mail' },
        { id: '8', name: 'Face-to-face', description: 'In-person conversation' },
        { id: '9', name: 'Phone Call', description: 'Voice conversation' },
        { id: '10', name: 'Other', description: 'Other platforms' }
      ]

  const response: ApiResponse<any[]> = {
    success: true,
    data: platformList,
    message: 'Platforms retrieved successfully',
    error: null
  }

  res.json(response)
}))

// Health check for reference service
referenceRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Reference routes ready' },
    message: 'Reference API is healthy',
    error: null
  })
})