#!/usr/bin/env node

// Test script for examples endpoints
// Run this after starting your backend server
// Usage: node test-endpoints.js [port]

const port = process.argv[2] || 3001;
const baseUrl = `http://localhost:${port}`;

console.log(`🧪 Testing endpoints on ${baseUrl}`);
console.log('Make sure your backend server is running first!\n');

// Test data
const testExample = {
  text: "I am going to la tienda to buy some groceries",
  languages: ["English", "Spanish"],
  context: "Shopping conversation",
  region: "California", 
  platform: "conversation",
  age: "25-35"
};

const testEnhancedExample = {
  text: "I want to go al parque with my friends",
  languages: ["English", "Spanish"],
  context: "Casual conversation",
  region: "Texas",
  platform: "text",
  age: "18-25",
  performanceMode: "balanced",
  analysisData: {
    tokens: [
      { word: "I", lang: "en", language: "English", confidence: 0.95 },
      { word: "want", lang: "en", language: "English", confidence: 0.95 },
      { word: "to", lang: "en", language: "English", confidence: 0.95 },
      { word: "go", lang: "en", language: "English", confidence: 0.95 },
      { word: "al", lang: "es", language: "Spanish", confidence: 0.90 },
      { word: "parque", lang: "es", language: "Spanish", confidence: 0.92 },
      { word: "with", lang: "en", language: "English", confidence: 0.95 },
      { word: "my", lang: "en", language: "English", confidence: 0.95 },
      { word: "friends", lang: "en", language: "English", confidence: 0.95 }
    ],
    phrases: [
      { words: ["I", "want", "to", "go"], text: "I want to go", language: "English", confidence: 0.95, startIndex: 0, endIndex: 3, isUserLanguage: true },
      { words: ["al", "parque"], text: "al parque", language: "Spanish", confidence: 0.91, startIndex: 4, endIndex: 5, isUserLanguage: true },
      { words: ["with", "my", "friends"], text: "with my friends", language: "English", confidence: 0.95, startIndex: 6, endIndex: 8, isUserLanguage: true }
    ],
    switchPoints: [3, 5],
    confidence: 0.92,
    detectedLanguages: ["English", "Spanish"],
    userLanguageMatch: true,
    processingTime: 45,
    calibratedConfidence: 0.89,
    reliabilityScore: 0.78,
    qualityAssessment: "high",
    calibrationMethod: "temperature_scaling",
    contextOptimization: {
      textType: "conversational",
      optimalWindowSize: 3,
      improvementScore: 0.15,
      contextEnhancedConfidence: 0.94,
      optimizationApplied: true
    },
    performanceMode: "balanced",
    version: "2.1.2"
  },
  submissionType: "enhanced-interactive",
  version: "v2.1.2"
};

async function testEndpoint(url, method, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`🔄 Testing ${method} ${url}`);
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (response.ok) {
      // Handle different response formats
      const dataId = result.data?.id || result.data?.example?.id || 'No ID';
      const hasNlpData = !!(result.data?.tokens || result.data?.phrases || result.data?.example?.tokens);
      
      console.log(`✅ SUCCESS (${response.status}):`, {
        success: result.success,
        message: result.message,
        dataId: dataId,
        hasNlpData: hasNlpData
      });
      
      // Check for Supabase save confirmation in logs
      if (dataId && dataId !== 'No ID' && !dataId.includes('mock') && !dataId.includes('enhanced_')) {
        console.log(`🎯 Real database save detected - ID: ${dataId}`);
      } else {
        console.log(`⚠️  Mock response - check backend logs for Supabase errors`);
      }
    } else {
      console.log(`❌ FAILED (${response.status}):`, result);
    }
    
    console.log('');
    return result;
    
  } catch (error) {
    console.log(`💥 ERROR:`, error.message);
    console.log('');
    return null;
  }
}

async function runTests() {
  console.log('📡 Testing server connectivity...');
  
  // Test basic connectivity
  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is responding\n');
    } else {
      throw new Error('Health check failed');
    }
  } catch (error) {
    console.log(`❌ Cannot connect to server at ${baseUrl}`);
    console.log('Make sure your backend is running and try again.\n');
    console.log('If your backend runs on a different port, use:');
    console.log(`node test-endpoints.js [port-number]\n`);
    return;
  }
  
  // Test examples endpoints
  console.log('🧪 Testing Examples Endpoints\n');
  
  // Test regular submission
  await testEndpoint(`${baseUrl}/api/examples`, 'POST', testExample);
  
  // Test enhanced submission  
  await testEndpoint(`${baseUrl}/api/examples/enhanced`, 'POST', testEnhancedExample);
  
  // Test GET examples
  await testEndpoint(`${baseUrl}/api/examples`, 'GET');
  
  console.log('🏁 Tests completed!');
  console.log('\n📋 What to check:');
  console.log('1. Look for "Real database save detected" messages above');
  console.log('2. Check your backend console logs for Supabase insert messages');
  console.log('3. Check your Supabase dashboard for new examples');
  console.log('4. If you see "Mock response" warnings, check backend logs for errors');
}

// Add fetch polyfill for older Node versions
if (!global.fetch) {
  console.log('Installing fetch polyfill...');
  import('node-fetch').then((fetch) => {
    global.fetch = fetch.default;
    runTests();
  }).catch(() => {
    console.log('❌ This script requires Node.js 18+ or you need to install node-fetch');
    console.log('Try: npm install node-fetch');
  });
} else {
  runTests();
}