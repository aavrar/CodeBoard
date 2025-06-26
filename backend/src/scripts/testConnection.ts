import { prisma } from '@/utils/database'

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')
    console.log('📊 Test query result:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('🔍 Error details:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔒 Database connection closed')
  }
}

testConnection()