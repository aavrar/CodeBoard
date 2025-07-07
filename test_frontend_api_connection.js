// Test if frontend can reach backend API
const API_BASE_URL = "http://localhost:3001/api"

async function testFrontendAPIConnection() {
  console.log("Testing frontend API connection...")
  
  try {
    // Test fetching examples (like the explore page does)
    console.log("1. Testing fetchExamples...")
    const examplesResponse = await fetch(`${API_BASE_URL}/examples`)
    console.log("Examples response status:", examplesResponse.status)
    
    if (examplesResponse.ok) {
      const examplesData = await examplesResponse.json()
      console.log("✅ Examples fetch successful, count:", examplesData.data?.length || 0)
    } else {
      console.log("❌ Examples fetch failed")
    }
    
    // Test fetching languages (like the submit page does)
    console.log("\n2. Testing fetchAvailableLanguages...")
    const languagesResponse = await fetch(`${API_BASE_URL}/languages`)
    console.log("Languages response status:", languagesResponse.status)
    
    if (languagesResponse.ok) {
      const languagesData = await languagesResponse.json()
      console.log("✅ Languages fetch successful, count:", languagesData.data?.length || 0)
    } else {
      console.log("❌ Languages fetch failed")
      const errorText = await languagesResponse.text()
      console.log("Error response:", errorText)
    }
    
    // Test CORS from simulated frontend environment
    console.log("\n3. Testing CORS headers...")
    const corsResponse = await fetch(`${API_BASE_URL}/examples`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3004',
        'Content-Type': 'application/json'
      }
    })
    console.log("CORS test status:", corsResponse.status)
    console.log("CORS headers:", corsResponse.headers.get('access-control-allow-origin'))
    
  } catch (error) {
    console.log("❌ Connection test failed:", error.message)
  }
}

// Run the test
testFrontendAPIConnection()