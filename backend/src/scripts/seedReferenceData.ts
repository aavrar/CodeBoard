#!/usr/bin/env node

import { supabase, tables } from '../utils/supabase.js'

// Comprehensive language list with ISO codes
const languages = [
  // Major World Languages
  { name: 'English', code: 'en' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian', code: 'ru' },
  { name: 'Chinese (Mandarin)', code: 'zh-cn' },
  { name: 'Chinese (Cantonese)', code: 'zh-hk' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Urdu', code: 'ur' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Norwegian', code: 'no' },
  { name: 'Danish', code: 'da' },
  { name: 'Finnish', code: 'fi' },
  { name: 'Polish', code: 'pl' },
  { name: 'Czech', code: 'cs' },
  { name: 'Hungarian', code: 'hu' },
  { name: 'Romanian', code: 'ro' },
  { name: 'Bulgarian', code: 'bg' },
  { name: 'Croatian', code: 'hr' },
  { name: 'Serbian', code: 'sr' },
  { name: 'Slovak', code: 'sk' },
  { name: 'Slovenian', code: 'sl' },
  { name: 'Ukrainian', code: 'uk' },
  { name: 'Greek', code: 'el' },
  { name: 'Hebrew', code: 'he' },
  { name: 'Persian (Farsi)', code: 'fa' },
  { name: 'Thai', code: 'th' },
  { name: 'Vietnamese', code: 'vi' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Malay', code: 'ms' },
  { name: 'Tagalog', code: 'tl' },
  
  // Indian Subcontinent Languages
  { name: 'Tamil', code: 'ta' },
  { name: 'Telugu', code: 'te' },
  { name: 'Gujarati', code: 'gu' },
  { name: 'Marathi', code: 'mr' },
  { name: 'Punjabi', code: 'pa' },
  { name: 'Kannada', code: 'kn' },
  { name: 'Malayalam', code: 'ml' },
  { name: 'Odia', code: 'or' },
  { name: 'Assamese', code: 'as' },
  { name: 'Nepali', code: 'ne' },
  { name: 'Sinhala', code: 'si' },
  
  // African Languages
  { name: 'Swahili', code: 'sw' },
  { name: 'Hausa', code: 'ha' },
  { name: 'Yoruba', code: 'yo' },
  { name: 'Igbo', code: 'ig' },
  { name: 'Amharic', code: 'am' },
  { name: 'Zulu', code: 'zu' },
  { name: 'Xhosa', code: 'xh' },
  { name: 'Afrikaans', code: 'af' },
  
  // Latin American Languages
  { name: 'Quechua', code: 'qu' },
  { name: 'Guarani', code: 'gn' },
  { name: 'Nahuatl', code: 'nah' },
  { name: 'Maya', code: 'myn' },
  
  // European Regional Languages
  { name: 'Catalan', code: 'ca' },
  { name: 'Basque', code: 'eu' },
  { name: 'Galician', code: 'gl' },
  { name: 'Welsh', code: 'cy' },
  { name: 'Irish', code: 'ga' },
  { name: 'Scottish Gaelic', code: 'gd' },
  { name: 'Breton', code: 'br' },
  { name: 'Corsican', code: 'co' },
  { name: 'Sardinian', code: 'sc' },
  { name: 'Maltese', code: 'mt' },
  { name: 'Luxembourgish', code: 'lb' },
  
  // Sign Languages
  { name: 'American Sign Language (ASL)', code: 'ase' },
  { name: 'British Sign Language (BSL)', code: 'bfi' },
  { name: 'French Sign Language (LSF)', code: 'fsl' },
  
  // Other Notable Languages
  { name: 'Esperanto', code: 'eo' },
  { name: 'Latin', code: 'la' },
  { name: 'Sanskrit', code: 'sa' },
  { name: 'Yiddish', code: 'yi' },
  { name: 'Ladino', code: 'lad' },
  { name: 'Romani', code: 'rom' }
]

// Global regions and countries
const regions = [
  // North America
  { name: 'United States', country: 'United States' },
  { name: 'Canada', country: 'Canada' },
  { name: 'Mexico', country: 'Mexico' },
  { name: 'Puerto Rico', country: 'Puerto Rico' },
  
  // Central America
  { name: 'Guatemala', country: 'Guatemala' },
  { name: 'Belize', country: 'Belize' },
  { name: 'El Salvador', country: 'El Salvador' },
  { name: 'Honduras', country: 'Honduras' },
  { name: 'Nicaragua', country: 'Nicaragua' },
  { name: 'Costa Rica', country: 'Costa Rica' },
  { name: 'Panama', country: 'Panama' },
  
  // South America
  { name: 'Argentina', country: 'Argentina' },
  { name: 'Bolivia', country: 'Bolivia' },
  { name: 'Brazil', country: 'Brazil' },
  { name: 'Chile', country: 'Chile' },
  { name: 'Colombia', country: 'Colombia' },
  { name: 'Ecuador', country: 'Ecuador' },
  { name: 'Guyana', country: 'Guyana' },
  { name: 'Paraguay', country: 'Paraguay' },
  { name: 'Peru', country: 'Peru' },
  { name: 'Suriname', country: 'Suriname' },
  { name: 'Uruguay', country: 'Uruguay' },
  { name: 'Venezuela', country: 'Venezuela' },
  
  // Europe
  { name: 'United Kingdom', country: 'United Kingdom' },
  { name: 'Ireland', country: 'Ireland' },
  { name: 'France', country: 'France' },
  { name: 'Germany', country: 'Germany' },
  { name: 'Italy', country: 'Italy' },
  { name: 'Spain', country: 'Spain' },
  { name: 'Portugal', country: 'Portugal' },
  { name: 'Netherlands', country: 'Netherlands' },
  { name: 'Belgium', country: 'Belgium' },
  { name: 'Switzerland', country: 'Switzerland' },
  { name: 'Austria', country: 'Austria' },
  { name: 'Sweden', country: 'Sweden' },
  { name: 'Norway', country: 'Norway' },
  { name: 'Denmark', country: 'Denmark' },
  { name: 'Finland', country: 'Finland' },
  { name: 'Poland', country: 'Poland' },
  { name: 'Czech Republic', country: 'Czech Republic' },
  { name: 'Hungary', country: 'Hungary' },
  { name: 'Romania', country: 'Romania' },
  { name: 'Bulgaria', country: 'Bulgaria' },
  { name: 'Croatia', country: 'Croatia' },
  { name: 'Serbia', country: 'Serbia' },
  { name: 'Greece', country: 'Greece' },
  { name: 'Turkey', country: 'Turkey' },
  { name: 'Russia', country: 'Russia' },
  { name: 'Ukraine', country: 'Ukraine' },
  
  // Asia
  { name: 'China', country: 'China' },
  { name: 'Japan', country: 'Japan' },
  { name: 'South Korea', country: 'South Korea' },
  { name: 'North Korea', country: 'North Korea' },
  { name: 'India', country: 'India' },
  { name: 'Pakistan', country: 'Pakistan' },
  { name: 'Bangladesh', country: 'Bangladesh' },
  { name: 'Sri Lanka', country: 'Sri Lanka' },
  { name: 'Nepal', country: 'Nepal' },
  { name: 'Bhutan', country: 'Bhutan' },
  { name: 'Myanmar', country: 'Myanmar' },
  { name: 'Thailand', country: 'Thailand' },
  { name: 'Vietnam', country: 'Vietnam' },
  { name: 'Cambodia', country: 'Cambodia' },
  { name: 'Laos', country: 'Laos' },
  { name: 'Malaysia', country: 'Malaysia' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Indonesia', country: 'Indonesia' },
  { name: 'Philippines', country: 'Philippines' },
  { name: 'Mongolia', country: 'Mongolia' },
  
  // Middle East
  { name: 'Saudi Arabia', country: 'Saudi Arabia' },
  { name: 'UAE', country: 'United Arab Emirates' },
  { name: 'Qatar', country: 'Qatar' },
  { name: 'Kuwait', country: 'Kuwait' },
  { name: 'Bahrain', country: 'Bahrain' },
  { name: 'Oman', country: 'Oman' },
  { name: 'Yemen', country: 'Yemen' },
  { name: 'Iraq', country: 'Iraq' },
  { name: 'Iran', country: 'Iran' },
  { name: 'Afghanistan', country: 'Afghanistan' },
  { name: 'Israel', country: 'Israel' },
  { name: 'Palestine', country: 'Palestine' },
  { name: 'Jordan', country: 'Jordan' },
  { name: 'Lebanon', country: 'Lebanon' },
  { name: 'Syria', country: 'Syria' },
  
  // Africa
  { name: 'Egypt', country: 'Egypt' },
  { name: 'Libya', country: 'Libya' },
  { name: 'Tunisia', country: 'Tunisia' },
  { name: 'Algeria', country: 'Algeria' },
  { name: 'Morocco', country: 'Morocco' },
  { name: 'Nigeria', country: 'Nigeria' },
  { name: 'Ghana', country: 'Ghana' },
  { name: 'Kenya', country: 'Kenya' },
  { name: 'Ethiopia', country: 'Ethiopia' },
  { name: 'South Africa', country: 'South Africa' },
  { name: 'Tanzania', country: 'Tanzania' },
  { name: 'Uganda', country: 'Uganda' },
  { name: 'Rwanda', country: 'Rwanda' },
  
  // Oceania
  { name: 'Australia', country: 'Australia' },
  { name: 'New Zealand', country: 'New Zealand' },
  { name: 'Papua New Guinea', country: 'Papua New Guinea' },
  { name: 'Fiji', country: 'Fiji' }
]

// Digital platforms where code-switching occurs
const platforms = [
  // Social Media
  { name: 'Twitter/X', description: 'Microblogging and social networking' },
  { name: 'Facebook', description: 'Social networking platform' },
  { name: 'Instagram', description: 'Photo and video sharing' },
  { name: 'TikTok', description: 'Short-form video platform' },
  { name: 'YouTube', description: 'Video sharing and streaming' },
  { name: 'LinkedIn', description: 'Professional networking' },
  { name: 'Snapchat', description: 'Multimedia messaging' },
  { name: 'Pinterest', description: 'Visual discovery platform' },
  { name: 'Reddit', description: 'Forum and discussion platform' },
  { name: 'Tumblr', description: 'Microblogging platform' },
  
  // Messaging Apps
  { name: 'WhatsApp', description: 'Instant messaging' },
  { name: 'Telegram', description: 'Cloud-based messaging' },
  { name: 'Signal', description: 'Encrypted messaging' },
  { name: 'WeChat', description: 'Multi-purpose messaging app' },
  { name: 'Line', description: 'Mobile messaging app' },
  { name: 'Viber', description: 'Voice and messaging service' },
  { name: 'iMessage', description: 'Apple messaging service' },
  { name: 'SMS/Text', description: 'Traditional text messaging' },
  
  // Professional & Educational
  { name: 'Slack', description: 'Workplace communication' },
  { name: 'Microsoft Teams', description: 'Collaboration platform' },
  { name: 'Discord', description: 'Voice and text chat for communities' },
  { name: 'Zoom Chat', description: 'Video conferencing chat' },
  { name: 'Google Meet Chat', description: 'Video meeting chat' },
  { name: 'Canvas', description: 'Educational platform' },
  { name: 'Moodle', description: 'Learning management system' },
  
  // Dating & Social
  { name: 'Tinder', description: 'Dating app' },
  { name: 'Bumble', description: 'Dating and networking app' },
  { name: 'Hinge', description: 'Dating app' },
  
  // Gaming & Entertainment
  { name: 'Twitch Chat', description: 'Live streaming chat' },
  { name: 'Steam', description: 'Gaming platform' },
  { name: 'PlayStation Network', description: 'Gaming network' },
  { name: 'Xbox Live', description: 'Gaming service' },
  
  // Regional Platforms
  { name: 'WeChat Moments', description: 'Chinese social platform' },
  { name: 'Weibo', description: 'Chinese microblogging' },
  { name: 'VKontakte', description: 'Russian social network' },
  { name: 'Orkut', description: 'Former social network (archival data)' },
  
  // Other Digital Contexts
  { name: 'Email', description: 'Electronic mail' },
  { name: 'Blog Comments', description: 'Website comment sections' },
  { name: 'Forum Posts', description: 'Online discussion forums' },
  { name: 'News Comments', description: 'News website comments' },
  { name: 'Product Reviews', description: 'E-commerce review sections' },
  { name: 'Academic Papers', description: 'Scholarly publications' },
  { name: 'Literature', description: 'Books and written works' },
  { name: 'Transcripts', description: 'Spoken conversation transcripts' },
  { name: 'Subtitles', description: 'Video/movie subtitles' },
  { name: 'Other', description: 'Other digital platforms' }
]

async function seedLanguages() {
  console.log('🌍 Seeding languages...')
  
  try {
    // Clear existing languages
    const { error: deleteError } = await supabase
      .from(tables.languages)
      .delete()
      .neq('id', 'impossible-id') // Delete all
      
    if (deleteError) {
      console.log('⚠️ Note: Could not clear existing languages (table might be empty)')
    }

    // Insert languages in batches to avoid request size limits
    const batchSize = 50
    let successCount = 0
    
    for (let i = 0; i < languages.length; i += batchSize) {
      const batch = languages.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from(tables.languages)
        .insert(batch.map(lang => ({
          name: lang.name,
          code: lang.code
        })))
        .select()

      if (error) {
        console.error(`❌ Failed to insert language batch ${Math.floor(i/batchSize) + 1}:`, error)
      } else {
        successCount += data.length
        console.log(`✅ Inserted ${data.length} languages (batch ${Math.floor(i/batchSize) + 1})`)
      }
    }
    
    console.log(`✅ Successfully seeded ${successCount} languages`)
    return successCount
  } catch (error) {
    console.error('❌ Language seeding failed:', error)
    return 0
  }
}

async function seedRegions() {
  console.log('🗺️ Seeding regions...')
  
  try {
    // Clear existing regions
    const { error: deleteError } = await supabase
      .from(tables.regions)
      .delete()
      .neq('id', 'impossible-id') // Delete all
      
    if (deleteError) {
      console.log('⚠️ Note: Could not clear existing regions (table might be empty)')
    }

    // Insert regions in batches
    const batchSize = 50
    let successCount = 0
    
    for (let i = 0; i < regions.length; i += batchSize) {
      const batch = regions.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from(tables.regions)
        .insert(batch.map(region => ({
          name: region.name,
          country: region.country
        })))
        .select()

      if (error) {
        console.error(`❌ Failed to insert region batch ${Math.floor(i/batchSize) + 1}:`, error)
      } else {
        successCount += data.length
        console.log(`✅ Inserted ${data.length} regions (batch ${Math.floor(i/batchSize) + 1})`)
      }
    }
    
    console.log(`✅ Successfully seeded ${successCount} regions`)
    return successCount
  } catch (error) {
    console.error('❌ Region seeding failed:', error)
    return 0
  }
}

async function seedPlatforms() {
  console.log('📱 Seeding platforms...')
  
  try {
    // Clear existing platforms
    const { error: deleteError } = await supabase
      .from(tables.platforms)
      .delete()
      .neq('id', 'impossible-id') // Delete all
      
    if (deleteError) {
      console.log('⚠️ Note: Could not clear existing platforms (table might be empty)')
    }

    // Insert platforms in batches
    const batchSize = 50
    let successCount = 0
    
    for (let i = 0; i < platforms.length; i += batchSize) {
      const batch = platforms.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from(tables.platforms)
        .insert(batch.map(platform => ({
          name: platform.name,
          description: platform.description
        })))
        .select()

      if (error) {
        console.error(`❌ Failed to insert platform batch ${Math.floor(i/batchSize) + 1}:`, error)
      } else {
        successCount += data.length
        console.log(`✅ Inserted ${data.length} platforms (batch ${Math.floor(i/batchSize) + 1})`)
      }
    }
    
    console.log(`✅ Successfully seeded ${successCount} platforms`)
    return successCount
  } catch (error) {
    console.error('❌ Platform seeding failed:', error)
    return 0
  }
}

async function verifySeeding() {
  console.log('\n🔍 Verifying seeded data...')
  
  try {
    const [languageCount, regionCount, platformCount] = await Promise.all([
      supabase.from(tables.languages).select('*', { count: 'exact', head: true }),
      supabase.from(tables.regions).select('*', { count: 'exact', head: true }),
      supabase.from(tables.platforms).select('*', { count: 'exact', head: true })
    ])

    console.log(`📊 Database verification:`)
    console.log(`   Languages: ${languageCount.count || 0}`)
    console.log(`   Regions: ${regionCount.count || 0}`)
    console.log(`   Platforms: ${platformCount.count || 0}`)
    
    // Sample some data
    const { data: sampleLanguages } = await supabase
      .from(tables.languages)
      .select('name, code')
      .limit(5)
      
    if (sampleLanguages && sampleLanguages.length > 0) {
      console.log(`\n📝 Sample languages:`)
      sampleLanguages.forEach(lang => 
        console.log(`   ${lang.name} (${lang.code})`)
      )
    }
    
    return {
      languages: languageCount.count || 0,
      regions: regionCount.count || 0,
      platforms: platformCount.count || 0
    }
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return null
  }
}

async function runSeeding() {
  console.log('🌱 Reference Data Seeding Script')
  console.log('=' .repeat(50))
  console.log('Populating languages, regions, and platforms\n')

  try {
    const startTime = Date.now()
    
    // Seed all reference data
    const [languageCount, regionCount, platformCount] = await Promise.all([
      seedLanguages(),
      seedRegions(),
      seedPlatforms()
    ])
    
    // Verify the results
    const verification = await verifySeeding()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.log('\n' + '=' .repeat(50))
    console.log('✅ Reference data seeding completed!')
    console.log(`⏱️ Total time: ${duration}s`)
    console.log('\n📋 Summary:')
    console.log(`   ✅ Languages seeded: ${languageCount}`)
    console.log(`   ✅ Regions seeded: ${regionCount}`)
    console.log(`   ✅ Platforms seeded: ${platformCount}`)
    
    if (verification) {
      console.log('\n📊 Database contains:')
      console.log(`   🌍 ${verification.languages} languages available for selection`)
      console.log(`   🗺️ ${verification.regions} regions for geographic context`)
      console.log(`   📱 ${verification.platforms} platforms for submission context`)
    }
    
    console.log('\n🎉 Users can now select from comprehensive reference data!')
    console.log('💡 Consider implementing search functionality in the frontend for easy selection.')

  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeding()
}

export { runSeeding, seedLanguages, seedRegions, seedPlatforms }