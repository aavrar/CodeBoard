// Test script to debug frontend form submission
const API_BASE_URL = "http://localhost:3001/api"

async function testFrontendFormSubmission() {
  console.log("Testing frontend form submission simulation...")
  
  const submissionData = {
    text: "Hello मैं अच्छा हूं how are you doing today?",
    languages: ["English", "Hindi"],
    context: "Testing frontend form submission through script",
    region: "California",
    platform: "conversation",
    age: "26-35"
  }
  
  console.log("Submission data:", JSON.stringify(submissionData, null, 2))
  
  try {
    const response = await fetch(`${API_BASE_URL}/examples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })
    
    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)
    
    const result = await response.json()
    console.log("Response data:", JSON.stringify(result, null, 2))
    
    if (!response.ok) {
      console.log("❌ Submission failed:", result.error || response.statusText)
      return { success: false, error: result.error || response.statusText }
    }
    
    console.log("✅ Submission successful!")
    return { success: result.success, id: result.data?.id }
    
  } catch (error) {
    console.log("❌ Network error:", error.message)
    return { success: false, error: error.message }
  }
}

// Run the test
testFrontendFormSubmission().then(result => {
  console.log("Final result:", result)
}).catch(err => {
  console.error("Test failed:", err)
})