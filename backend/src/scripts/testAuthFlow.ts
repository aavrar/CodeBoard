import jwt from 'jsonwebtoken'
import { UserTier, AuthProvider, UserPayload } from '../types/index'

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'
const BASE_URL = 'http://localhost:3001'

// Test data for different user tiers
const testScenarios = [
  {
    name: 'Community User Registration',
    email: 'community-test@example.com',
    password: 'password123',
    expectedTier: UserTier.COMMUNITY
  },
  {
    name: 'Researcher Auto-Detection (.edu)',
    email: 'researcher-test@university.edu', 
    password: 'password123',
    expectedTier: UserTier.RESEARCHER
  }
]

async function testJwtFunctions() {
  console.log('🔑 Testing JWT Token Functions...')
  
  // Test token generation
  const testPayload: UserPayload = {
    id: 'test-123',
    email: 'test@example.com',
    name: 'Test User',
    tier: UserTier.COMMUNITY,
    authProvider: AuthProvider.EMAIL
  }
  
  try {
    // Generate token
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' })
    console.log(`✅ Token generated: ${token.substring(0, 50)}...`)
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    console.log(`✅ Token verified: ${decoded.email} (${decoded.tier})`)
    
    // Test expired token
    const expiredToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1ms' })
    await new Promise(resolve => setTimeout(resolve, 10))
    
    try {
      jwt.verify(expiredToken, JWT_SECRET)
      console.log('❌ Expired token should have been rejected')
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('✅ Expired token correctly rejected')
      }
    }
    
    // Test invalid secret
    try {
      jwt.verify(token, 'wrong-secret')
      console.log('❌ Token with wrong secret should have been rejected')
    } catch (error) {
      console.log('✅ Token with wrong secret correctly rejected')
    }
    
  } catch (error) {
    console.error('❌ JWT function test failed:', error.message)
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...')
  
  for (const scenario of testScenarios) {
    console.log(`\n📝 Testing: ${scenario.name}`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/oauth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: scenario.email,
          name: scenario.email.split('@')[0],
          password: scenario.password,
          authProvider: 'EMAIL'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Registration successful for ${scenario.email}`)
        console.log(`   Expected tier: ${scenario.expectedTier}`)
        console.log(`   Actual tier: ${data.data.user.tier}`)
        console.log(`   Token received: ${data.data.token ? 'Yes' : 'No'}`)
        
        if (data.data.user.tier === scenario.expectedTier) {
          console.log(`✅ Tier detection correct`)
        } else {
          console.log(`❌ Tier detection incorrect`)
        }
        
        // Test the token
        if (data.data.token) {
          try {
            const decoded = jwt.verify(data.data.token, JWT_SECRET) as UserPayload
            console.log(`✅ Registration token valid: ${decoded.email}`)
          } catch (error) {
            console.log(`❌ Registration token invalid: ${error.message}`)
          }
        }
        
      } else {
        console.log(`❌ Registration failed: ${data.message}`)
      }
      
    } catch (error) {
      console.error(`❌ Registration request failed:`, error.message)
    }
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...')
  
  for (const scenario of testScenarios) {
    console.log(`\n🔑 Testing login: ${scenario.email}`)
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: scenario.email,
          password: scenario.password
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Login successful for ${scenario.email}`)
        console.log(`   User tier: ${data.data.user.tier}`)
        console.log(`   Token: ${data.data.token.substring(0, 50)}...`)
        
        // Store token for access tests
        scenario.token = data.data.token
        
      } else {
        console.log(`❌ Login failed: ${data.message}`)
      }
      
    } catch (error) {
      console.error(`❌ Login request failed:`, error.message)
    }
  }
}

async function testProtectedEndpoints() {
  console.log('\n🛡️ Testing Protected Endpoints...')
  
  const endpoints = [
    {
      name: 'User Profile',
      url: `${BASE_URL}/api/oauth/user`,
      method: 'GET',
      requiresAuth: true,
      allowedTiers: [UserTier.COMMUNITY, UserTier.RESEARCHER, UserTier.ADMIN]
    },
    {
      name: 'Dashboard Metrics',
      url: `${BASE_URL}/api/dashboard/metrics`,
      method: 'GET',
      requiresAuth: false,
      allowedTiers: [UserTier.COMMUNITY, UserTier.RESEARCHER, UserTier.ADMIN]
    }
  ]
  
  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing ${endpoint.name}`)
    
    // Test without authentication
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (endpoint.requiresAuth) {
        if (response.status === 401) {
          console.log(`✅ Correctly rejected unauthorized access`)
        } else {
          console.log(`❌ Should require authentication but allowed access`)
        }
      } else {
        if (response.status === 200) {
          console.log(`✅ Public endpoint accessible without auth`)
        } else {
          console.log(`❌ Public endpoint failed: ${data.message}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`)
    }
    
    // Test with authentication for users who have tokens
    for (const scenario of testScenarios) {
      if (!scenario.token) continue
      
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${scenario.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const data = await response.json()
        
        if (response.status === 200) {
          console.log(`✅ ${scenario.expectedTier} user authorized for ${endpoint.name}`)
        } else {
          console.log(`❌ ${scenario.expectedTier} user denied access: ${data.message}`)
        }
        
      } catch (error) {
        console.log(`❌ Authenticated request failed for ${scenario.expectedTier}: ${error.message}`)
      }
    }
  }
}

async function testInvalidTokenScenarios() {
  console.log('\n🚫 Testing Invalid Token Scenarios...')
  
  const invalidTokens = [
    { name: 'Malformed Token', token: 'invalid.token.format' },
    { name: 'Empty Token', token: '' },
    { name: 'Bearer without token', token: null },
    { name: 'Wrong Format', token: 'NotBearerToken' }
  ]
  
  for (const testCase of invalidTokens) {
    console.log(`\n🔍 Testing: ${testCase.name}`)
    
    const headers: any = { 'Content-Type': 'application/json' }
    if (testCase.token !== null) {
      headers['Authorization'] = testCase.token.startsWith('Bearer ') 
        ? testCase.token 
        : `Bearer ${testCase.token}`
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/oauth/user`, {
        method: 'GET',
        headers
      })
      
      const data = await response.json()
      
      if (response.status === 401) {
        console.log(`✅ ${testCase.name} correctly rejected`)
      } else {
        console.log(`❌ ${testCase.name} should have been rejected but got: ${response.status}`)
      }
      
    } catch (error) {
      console.log(`✅ ${testCase.name} correctly failed at request level`)
    }
  }
}

async function runAuthFlowTests() {
  try {
    console.log('🧪 Authentication Flow Testing Suite')
    console.log('====================================\n')
    
    // Core JWT functionality
    await testJwtFunctions()
    
    // User registration and tier detection
    await testUserRegistration()
    
    // Login functionality
    await testUserLogin()
    
    // Protected endpoint access
    await testProtectedEndpoints()
    
    // Security tests
    await testInvalidTokenScenarios()
    
    console.log('\n🎉 Authentication Flow Testing Complete!')
    console.log('========================================')
    
  } catch (error) {
    console.error('❌ Auth flow test suite failed:', error)
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthFlowTests()
}

export { runAuthFlowTests }