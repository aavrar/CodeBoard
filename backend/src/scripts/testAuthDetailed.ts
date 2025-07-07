/**
 * Detailed authentication debugging script
 * Tests database connectivity and auth endpoints step by step
 */

console.log('🔍 Detailed Authentication System Debugging');
console.log('=' .repeat(60));

const API_BASE = 'http://localhost:3001';

// Test 1: Check server health
async function testServerHealth() {
  console.log('🏥 Test 1: Server Health Check');
  
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Server is healthy');
      console.log(`   📊 Uptime: ${data.data.uptime}s`);
      console.log(`   ⏰ Timestamp: ${data.data.timestamp}`);
      return true;
    } else {
      console.log('   ❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Server not responding: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

// Test 2: Test specific auth endpoint with detailed logging
async function testAuthEndpointDetailed(endpoint: string, method: string = 'GET', body?: any) {
  console.log(`\\n🔍 Testing ${method} ${endpoint}`);
  
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    console.log(`   📡 Response Status: ${response.status} ${response.statusText}`);
    console.log(`   📋 Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log(`   📊 Response Data: ${JSON.stringify(responseData, null, 2)}`);
    } else {
      const textData = await response.text();
      console.log(`   📄 Response Text: ${textData.substring(0, 200)}${textData.length > 200 ? '...' : ''}`);
      responseData = { text: textData };
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
      contentType
    };
  } catch (error) {
    console.log(`   ❌ Request failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    return {
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown'
    };
  }
}

// Test 3: Check database connection via examples endpoint
async function testDatabaseConnection() {
  console.log('\\n💾 Test 3: Database Connection Check');
  
  try {
    const response = await fetch(`${API_BASE}/api/examples?limit=1`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Database connection working');
      console.log(`   📊 Examples available: ${data.data?.length || 0}`);
      return true;
    } else {
      console.log('   ❌ Database connection issues');
      console.log(`   📊 Error: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Database test failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

// Test 4: Check environment variables
async function testEnvironmentSetup() {
  console.log('\\n🌍 Test 4: Environment Setup Check');
  
  // We can't directly access env vars from the client, but we can infer from responses
  console.log('   🔍 Checking if JWT_SECRET is configured...');
  
  // Try to access a protected endpoint without auth
  const response = await fetch(`${API_BASE}/api/auth/me`);
  
  if (response.status === 401) {
    console.log('   ✅ JWT middleware is working (proper 401 response)');
    return true;
  } else {
    console.log(`   ❓ Unexpected response: ${response.status}`);
    return false;
  }
}

// Test 5: Manual auth flow test
async function testManualAuthFlow() {
  console.log('\\n🔐 Test 5: Manual Auth Flow Test');
  
  // Test registration with detailed logging
  console.log('\\n   📝 Testing Registration...');
  const regResult = await testAuthEndpointDetailed('/api/auth/register', 'POST', {
    email: `test.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User Debug'
  });
  
  if (regResult.ok && regResult.data?.success) {
    console.log('   ✅ Registration successful');
    const token = regResult.data.data?.token;
    const userEmail = regResult.data.data?.user?.email;
    
    if (token) {
      console.log('\\n   🔑 Testing Login...');
      const loginResult = await testAuthEndpointDetailed('/api/auth/login', 'POST', {
        email: userEmail,
        password: 'TestPassword123!'
      });
      
      if (loginResult.ok) {
        console.log('   ✅ Login successful');
        
        console.log('\\n   🎫 Testing Token Validation...');
        const tokenTest = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (tokenTest.ok) {
          console.log('   ✅ Token validation successful');
          const userData = await tokenTest.json();
          console.log(`   👤 User data: ${JSON.stringify(userData.data)}`);
          return true;
        } else {
          console.log('   ❌ Token validation failed');
        }
      } else {
        console.log('   ❌ Login failed');
      }
    } else {
      console.log('   ❌ No token received from registration');
    }
  } else {
    console.log('   ❌ Registration failed');
  }
  
  return false;
}

// Main debugging function
async function runDetailedAuthDebug() {
  console.log('🚀 Running Detailed Authentication Debug');
  console.log('=' .repeat(60));
  
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\\n🚨 CRITICAL: Server is not responding. Check if backend is running.');
    return false;
  }
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\\n⚠️  WARNING: Database connection issues detected.');
  }
  
  await testEnvironmentSetup();
  
  // Test basic auth endpoints
  console.log('\\n🔍 Testing Auth Endpoints:');
  await testAuthEndpointDetailed('/api/auth/register', 'GET'); // Should return 405 Method Not Allowed
  await testAuthEndpointDetailed('/api/auth/login', 'GET');    // Should return 405 Method Not Allowed
  await testAuthEndpointDetailed('/api/auth/me', 'GET');       // Should return 401 Unauthorized
  
  // Test full auth flow
  const authFlowWorking = await testManualAuthFlow();
  
  console.log('\\n📈 DEBUGGING SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Server Health: ${serverHealthy ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Database: ${dbConnected ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Auth Flow: ${authFlowWorking ? '✅ OK' : '❌ FAILED'}`);
  
  if (!authFlowWorking) {
    console.log('\\n🔧 TROUBLESHOOTING STEPS:');
    console.log('   1. Check if DATABASE_URL is properly configured');
    console.log('   2. Verify JWT_SECRET is set in environment');
    console.log('   3. Ensure Prisma client is generated: npx prisma generate');
    console.log('   4. Check database migrations: npx prisma migrate dev');
    console.log('   5. Review server logs for detailed error messages');
  }
  
  return authFlowWorking;
}

// Execute
if (import.meta.url === `file://${process.argv[1]}`) {
  runDetailedAuthDebug()
    .then(success => {
      console.log(`\\n🏁 Detailed auth debug: ${success ? 'SUCCESS' : 'ISSUES FOUND'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Debug execution failed:', error);
      process.exit(1);
    });
}