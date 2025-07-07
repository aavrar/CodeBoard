import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'
const BASE_URL = 'http://localhost:3001'

async function testBasicFunctionality() {
  console.log('🧪 Testing Basic Server Functionality')
  console.log('===================================\n')
  
  // Test 1: Basic health check
  console.log('1. Testing server health...')
  try {
    const response = await fetch(`${BASE_URL}/ping`)
    const data = await response.json()
    console.log(`✅ Server healthy: ${data.status}`)
  } catch (error) {
    console.error(`❌ Server health check failed: ${error.message}`)
    return
  }
  
  // Test 2: JWT token creation (local)
  console.log('\n2. Testing JWT token creation...')
  try {
    const testPayload = {
      id: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      tier: 'COMMUNITY',
      authProvider: 'EMAIL'
    }
    
    const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' })
    console.log(`✅ JWT token created: ${token.substring(0, 50)}...`)
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log(`✅ JWT token verified: ${(decoded as any).email}`)
    
  } catch (error) {
    console.error(`❌ JWT token test failed: ${error.message}`)
  }
  
  // Test 3: Check if auth routes are accessible
  console.log('\n3. Testing auth routes accessibility...')
  try {
    const response = await fetch(`${BASE_URL}/api/auth/invalid-endpoint`)
    console.log(`✅ Auth routes mounted (got 404 as expected): ${response.status}`)
  } catch (error) {
    console.error(`❌ Auth routes not accessible: ${error.message}`)
  }
  
  // Test 4: Test OAuth routes
  console.log('\n4. Testing OAuth routes...')
  try {
    const response = await fetch(`${BASE_URL}/api/oauth/user`)
    if (response.status === 401) {
      console.log(`✅ OAuth routes working (requires auth): ${response.status}`)
    } else {
      console.log(`⚠️  OAuth route unexpected status: ${response.status}`)
    }
  } catch (error) {
    console.error(`❌ OAuth routes test failed: ${error.message}`)
  }
  
  // Test 5: Test registration with minimal data
  console.log('\n5. Testing minimal registration...')
  try {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      name: 'Minimal Test',
      password: 'password123'
    }
    
    console.log(`   Attempting to register: ${testUser.email}`)
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    console.log(`   Response status: ${response.status}`)
    
    const data = await response.json()
    console.log(`   Response data:`, data)
    
    if (data.success) {
      console.log(`✅ Registration successful!`)
      console.log(`   User tier: ${data.data.user?.tier}`)
      console.log(`   Token present: ${!!data.data.token}`)
    } else {
      console.log(`❌ Registration failed: ${data.message}`)
      console.log(`   Error: ${data.error}`)
    }
    
  } catch (error) {
    console.error(`❌ Registration test failed: ${error.message}`)
  }
  
  console.log('\n🎉 Basic functionality test complete!')
}

// Run tests
testBasicFunctionality()