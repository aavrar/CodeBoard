import { prisma } from '@/utils/database'

async function testTables() {
  try {
    console.log('🔍 Testing database tables...')
    
    // Test if we can query each table
    const userCount = await prisma.user.count()
    const exampleCount = await prisma.example.count()
    const languageCount = await prisma.language.count()
    
    console.log('✅ Tables working!')
    console.log(`📊 Users: ${userCount}`)
    console.log(`📊 Examples: ${exampleCount}`)
    console.log(`📊 Languages: ${languageCount}`)
    
  } catch (error) {
    console.error('❌ Table test failed!')
    console.error('🔍 Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTables()