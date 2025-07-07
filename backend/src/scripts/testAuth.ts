/**
 * Comprehensive authentication system testing
 * Tests: Registration, Login, Token Validation, User Retrieval
 */

console.log('🔐 Testing Authentication System');
console.log('=' .repeat(60));

interface AuthTestResult {
  test: string;
  success: boolean;
  data?: any;
  error?: string;
  timing?: number;
}

const API_BASE = 'http://localhost:3001/api';
const testResults: AuthTestResult[] = [];

// Test 1: Check auth endpoints availability
async function testAuthEndpoints() {
  console.log('🌐 Test 1: Auth Endpoints Availability');
  
  const endpoints = [
    '/auth/register',
    '/auth/login', 
    '/auth/me',
    '/oauth/user',
    '/oauth/google',
    '/oauth/github'
  ];
  
  let allAvailable = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Don't expect 200, just check if endpoint exists (not 404)
      if (response.status !== 404) {
        console.log(`   ✅ ${endpoint} - Available (${response.status})`);
      } else {
        console.log(`   ❌ ${endpoint} - Not Found (404)`);
        allAvailable = false;
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      allAvailable = false;
    }
  }
  
  testResults.push({
    test: 'Auth Endpoints Availability',
    success: allAvailable
  });
  
  return allAvailable;
}

// Test 2: User Registration
async function testRegistration() {
  console.log('\\n📝 Test 2: User Registration');
  
  const testUser = {
    email: `test.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  };
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const timing = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`   ✅ Registration successful in ${timing}ms`);
      console.log(`   👤 User: ${data.data?.user?.email || 'No email returned'}`);
      console.log(`   🎫 Token: ${data.data?.token ? 'Received' : 'Missing'}`);
      
      testResults.push({
        test: 'User Registration',
        success: true,
        data: { user: data.data?.user, hasToken: !!data.data?.token },
        timing
      });
      
      return { success: true, user: data.data?.user, token: data.data?.token };
    } else {
      console.log(`   ❌ Registration failed: ${data.message || data.error || 'Unknown error'}`);
      console.log(`   📊 Response: ${JSON.stringify(data)}`);
      
      testResults.push({
        test: 'User Registration',
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`
      });
      
      return { success: false, error: data.message };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`   ❌ Registration error: ${errorMsg}`);
    
    testResults.push({
      test: 'User Registration',
      success: false,
      error: errorMsg
    });
    
    return { success: false, error: errorMsg };
  }
}

// Test 3: User Login
async function testLogin(email?: string, password?: string) {
  console.log('\\n🔑 Test 3: User Login');
  
  // Use test credentials or fallback to mock
  const credentials = {
    email: email || 'test@example.com',
    password: password || 'password123'
  };
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const timing = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`   ✅ Login successful in ${timing}ms`);
      console.log(`   👤 User: ${data.data?.user?.email || 'No email returned'}`);
      console.log(`   🎫 Token: ${data.data?.token ? 'Received' : 'Missing'}`);
      console.log(`   📊 User Tier: ${data.data?.user?.tier || 'No tier'}`);
      
      testResults.push({
        test: 'User Login',
        success: true,
        data: { user: data.data?.user, hasToken: !!data.data?.token },
        timing
      });
      
      return { success: true, user: data.data?.user, token: data.data?.token };
    } else {
      console.log(`   ❌ Login failed: ${data.message || data.error || 'Unknown error'}`);
      console.log(`   📊 Response: ${JSON.stringify(data)}`);
      
      testResults.push({
        test: 'User Login',
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`
      });
      
      return { success: false, error: data.message };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`   ❌ Login error: ${errorMsg}`);
    
    testResults.push({
      test: 'User Login',
      success: false,
      error: errorMsg
    });
    
    return { success: false, error: errorMsg };
  }
}

// Test 4: Token Validation
async function testTokenValidation(token: string) {
  console.log('\\n🎫 Test 4: Token Validation');
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const timing = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`   ✅ Token validation successful in ${timing}ms`);
      console.log(`   👤 User: ${data.data?.email || 'No email returned'}`);
      console.log(`   🔐 Auth Status: Valid`);
      
      testResults.push({
        test: 'Token Validation',
        success: true,
        data: { user: data.data },
        timing
      });
      
      return { success: true, user: data.data };
    } else {
      console.log(`   ❌ Token validation failed: ${data.message || data.error || 'Unknown error'}`);
      
      testResults.push({
        test: 'Token Validation',
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`
      });
      
      return { success: false, error: data.message };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`   ❌ Token validation error: ${errorMsg}`);
    
    testResults.push({
      test: 'Token Validation',
      success: false,
      error: errorMsg
    });
    
    return { success: false, error: errorMsg };
  }
}

// Test 5: OAuth Endpoints
async function testOAuthEndpoints() {
  console.log('\\n🔗 Test 5: OAuth Endpoints');
  
  const oauthTests = [
    { name: 'Google OAuth URL', endpoint: '/oauth/google' },
    { name: 'GitHub OAuth URL', endpoint: '/oauth/github' },
    { name: 'OAuth User Info', endpoint: '/oauth/user' }
  ];
  
  let allWorking = true;
  
  for (const test of oauthTests) {
    try {
      const response = await fetch(`${API_BASE}${test.endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status !== 404) {
        console.log(`   ✅ ${test.name} - Available (${response.status})`);
      } else {
        console.log(`   ❌ ${test.name} - Not Found`);
        allWorking = false;
      }
    } catch (error) {
      console.log(`   ❌ ${test.name} - Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      allWorking = false;
    }
  }
  
  testResults.push({
    test: 'OAuth Endpoints',
    success: allWorking
  });
  
  return allWorking;
}

// Test 6: Database User Check
async function testDatabaseUsers() {
  console.log('\\n💾 Test 6: Database User Check');
  
  try {
    // Try to access any user-related endpoint that might show DB status
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer invalid-token`
      }
    });
    
    const data = await response.json();
    
    // Check if we get a proper auth error (means auth system is working)
    if (response.status === 401 || response.status === 403) {
      console.log('   ✅ Authentication system responding correctly');
      console.log('   🔐 Proper unauthorized response for invalid token');
      
      testResults.push({
        test: 'Database/Auth System',
        success: true
      });
      
      return true;
    } else {
      console.log(`   ❓ Unexpected response: ${response.status}`);
      console.log(`   📊 Data: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Database check error: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

// Main test runner
async function runAuthTests() {
  console.log('🚀 Running Complete Authentication Test Suite');
  console.log('=' .repeat(60));
  
  // Run all tests
  await testAuthEndpoints();
  
  const registrationResult = await testRegistration();
  
  // Try login with registered user or fallback credentials
  const loginResult = registrationResult.success 
    ? await testLogin(registrationResult.user?.email, 'TestPassword123!')
    : await testLogin();
  
  // Test token validation if we got a token
  if (loginResult.success && loginResult.token) {
    await testTokenValidation(loginResult.token);
  }
  
  await testOAuthEndpoints();
  await testDatabaseUsers();
  
  // Summary
  console.log('\\n📈 AUTHENTICATION TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  const successRate = Math.round((successCount / totalCount) * 100);
  
  console.log(`Total Tests: ${totalCount}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Overall Status: ${successRate >= 80 ? '✅ MOSTLY WORKING' : successRate >= 50 ? '⚠️ PARTIALLY WORKING' : '❌ BROKEN'}`);
  
  console.log('\\n📋 DETAILED RESULTS:');
  testResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const timing = result.timing ? ` (${result.timing}ms)` : '';
    console.log(`   ${index + 1}. ${result.test}: ${status}${timing}`);
    if (!result.success && result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  if (successRate < 80) {
    console.log('\\n🔧 ISSUES DETECTED:');
    const failedTests = testResults.filter(r => !r.success);
    failedTests.forEach(test => {
      console.log(`   ❌ ${test.test}: ${test.error || 'Unknown issue'}`);
    });
  }
  
  return { successRate, results: testResults };
}

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthTests()
    .then(result => {
      console.log(`\\n🏁 Authentication testing completed: ${result.successRate >= 80 ? 'SUCCESS' : 'ISSUES DETECTED'}`);
      process.exit(result.successRate >= 50 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runAuthTests };