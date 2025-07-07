import { createPrismaClient } from '../utils/database.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UserTier, AuthProvider, UserPayload } from '../types/index'

const prisma = createPrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

// Test users for different tiers
const testUsers = [
  {
    email: 'community@test.com',
    name: 'Community User',
    tier: UserTier.COMMUNITY,
    password: 'password123'
  },
  {
    email: 'researcher@university.edu',
    name: 'Researcher User', 
    tier: UserTier.RESEARCHER,
    password: 'password123'
  },
  {
    email: 'admin@test.com',
    name: 'Admin User',
    tier: UserTier.ADMIN,
    password: 'password123'
  }
]

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up existing test users...')
  for (const user of testUsers) {
    await prisma.user.deleteMany({
      where: { email: user.email }
    })
  }
}

async function createTestUsers() {
  console.log('👥 Creating test users...')
  const createdUsers = []
  
  for (const userData of testUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        tier: userData.tier,
        authProvider: AuthProvider.EMAIL,
        passwordHash,
        emailVerified: true,
        isActive: true
      }
    })
    
    console.log(`✅ Created ${userData.tier} user: ${userData.email}`)
    createdUsers.push({ ...user, originalPassword: userData.password })
  }
  
  return createdUsers
}

function generateTestToken(user: any): string {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    tier: user.tier as UserTier,
    authProvider: user.authProvider as AuthProvider
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

async function testTokenGeneration(users: any[]) {
  console.log('\n🔑 Testing JWT Token Generation...')
  
  for (const user of users) {
    try {
      const token = generateTestToken(user)
      console.log(`✅ Generated token for ${user.tier}: ${token.substring(0, 50)}...`)
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
      console.log(`✅ Token verified for ${decoded.email} (${decoded.tier})`)
      
      // Store token for API testing
      user.testToken = token
    } catch (error) {
      console.error(`❌ Token generation failed for ${user.email}:`, error)
    }
  }
}

async function testAuthEndpoints(users: any[]) {
  console.log('\n🌐 Testing Authentication Endpoints...')
  
  for (const user of users) {
    try {
      // Test login endpoint
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.originalPassword
        })
      })
      
      const loginData = await loginResponse.json()
      
      if (loginData.success) {
        console.log(`✅ Login successful for ${user.tier}: ${user.email}`)
        console.log(`   Token: ${loginData.data.token.substring(0, 50)}...`)
        user.apiToken = loginData.data.token
      } else {
        console.error(`❌ Login failed for ${user.email}:`, loginData.message)
      }
      
    } catch (error) {
      console.error(`❌ Auth endpoint test failed for ${user.email}:`, error)
    }
  }
}

async function testRoleBasedAccess(users: any[]) {
  console.log('\n🛡️ Testing Role-Based Access Control...')
  
  // Test endpoints with different access levels
  const testEndpoints = [
    {
      name: 'Public Dashboard',
      url: 'http://localhost:3001/api/dashboard/metrics',
      requiredTier: UserTier.COMMUNITY,
      method: 'GET'
    },
    {
      name: 'Research Analytics',
      url: 'http://localhost:3001/api/research/analytics/language-pairs',
      requiredTier: UserTier.RESEARCHER,
      method: 'GET'
    },
    {
      name: 'Research Applications',
      url: 'http://localhost:3001/api/research/applications',
      requiredTier: UserTier.ADMIN,
      method: 'GET'
    }
  ]
  
  for (const endpoint of testEndpoints) {
    console.log(`\n📡 Testing ${endpoint.name} (requires ${endpoint.requiredTier})`)
    
    for (const user of users) {
      if (!user.apiToken) {
        console.log(`  ⏭️  Skipping ${user.tier} - no valid token`)
        continue
      }
      
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${user.apiToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()
        
        // Check if access should be allowed
        const hasAccess = shouldHaveAccess(user.tier, endpoint.requiredTier)
        
        if (hasAccess && response.status === 200) {
          console.log(`  ✅ ${user.tier} correctly granted access`)
        } else if (!hasAccess && (response.status === 401 || response.status === 403)) {
          console.log(`  ✅ ${user.tier} correctly denied access`)
        } else {
          console.log(`  ⚠️  ${user.tier} unexpected result: ${response.status} - ${data.message || 'No message'}`)
        }
        
      } catch (error) {
        console.error(`  ❌ ${user.tier} request failed:`, error.message)
      }
    }
  }
}

function shouldHaveAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierHierarchy = {
    [UserTier.COMMUNITY]: 1,
    [UserTier.RESEARCHER]: 2,
    [UserTier.ADMIN]: 3
  }
  
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
}

async function testTokenExpiration() {
  console.log('\n⏰ Testing Token Expiration...')
  
  // Create a short-lived token
  const shortToken = jwt.sign(
    { id: 'test', email: 'test@example.com', tier: UserTier.COMMUNITY },
    JWT_SECRET,
    { expiresIn: '1s' }
  )
  
  console.log('✅ Created short-lived token (1 second)')
  
  // Wait for token to expire
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  try {
    jwt.verify(shortToken, JWT_SECRET)
    console.log('❌ Token should have expired but is still valid')
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('✅ Token correctly expired')
    } else {
      console.log('❌ Unexpected token error:', error.message)
    }
  }
}

async function testInvalidTokens() {
  console.log('\n🚫 Testing Invalid Tokens...')
  
  const invalidTokens = [
    { name: 'Malformed', token: 'invalid.token.here' },
    { name: 'Wrong Secret', token: jwt.sign({ id: 'test' }, 'wrong-secret') },
    { name: 'Missing Claims', token: jwt.sign({}, JWT_SECRET) },
    { name: 'Empty', token: '' }
  ]
  
  for (const testCase of invalidTokens) {
    try {
      jwt.verify(testCase.token, JWT_SECRET)
      console.log(`❌ ${testCase.name} token should be invalid but passed verification`)
    } catch (error) {
      console.log(`✅ ${testCase.name} token correctly rejected: ${error.name}`)
    }
  }
}

async function testUserProfileAccess(users: any[]) {
  console.log('\n👤 Testing User Profile Access...')
  
  for (const user of users) {
    if (!user.apiToken) continue
    
    try {
      const response = await fetch('http://localhost:3001/api/oauth/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.apiToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.success && data.data.email === user.email) {
        console.log(`✅ ${user.tier} can access own profile`)
        console.log(`   Profile data: ${data.data.name} (${data.data.tier})`)
      } else {
        console.log(`❌ ${user.tier} profile access failed:`, data.message)
      }
      
    } catch (error) {
      console.error(`❌ Profile access error for ${user.tier}:`, error.message)
    }
  }
}

async function runJwtRbacTests() {
  try {
    console.log('🧪 JWT & RBAC Testing Suite')
    console.log('================================\n')
    
    // Setup
    await cleanupTestUsers()
    const users = await createTestUsers()
    
    // Core JWT Tests
    await testTokenGeneration(users)
    await testTokenExpiration()
    await testInvalidTokens()
    
    // Authentication Tests
    await testAuthEndpoints(users)
    await testUserProfileAccess(users)
    
    // Authorization Tests
    await testRoleBasedAccess(users)
    
    console.log('\n🎉 JWT & RBAC Testing Complete!')
    console.log('================================')
    
    // Cleanup
    await cleanupTestUsers()
    console.log('✅ Test users cleaned up')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runJwtRbacTests()
}

export { runJwtRbacTests }