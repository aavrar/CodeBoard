import { analyzeWithUserGuidance, EnhancedNlpResult } from '../services/enhancedNlpService.js'

interface UrduTestCase {
  name: string
  text: string
  userLanguages: string[]
  expectedLanguages?: string[]
  description: string
  romanized: boolean
}

const urduRomanizedTestCases: UrduTestCase[] = [
  // Pure Urdu romanized
  {
    name: 'Pure Urdu Romanized',
    text: 'main aap se milna chahta hun aur aap ka shukriya ada karna chahta hun',
    userLanguages: ['Urdu'],
    expectedLanguages: ['ur'],
    description: 'Pure Urdu text written in Roman script',
    romanized: true
  },
  
  // Urdu-English mixing
  {
    name: 'Urdu-English Mixed Common',
    text: 'main office gaya tha aur wahan meeting thi',
    userLanguages: ['Urdu', 'English'],
    expectedLanguages: ['ur', 'en'],
    description: 'Common Urdu-English code-switching with office terms',
    romanized: true
  },
  
  {
    name: 'Urdu-English Professional',
    text: 'aaj ka presentation bohot accha tha lekin timing thori late thi',
    userLanguages: ['Urdu', 'English'],
    expectedLanguages: ['ur', 'en'],
    description: 'Professional context mixing',
    romanized: true
  },
  
  // Religious/Cultural terms
  {
    name: 'Urdu Religious Terms',
    text: 'inshallah tomorrow ka weather accha hoga mashallah',
    userLanguages: ['Urdu', 'English'],
    expectedLanguages: ['ur', 'en'],
    description: 'Religious terms commonly used in code-switching',
    romanized: true
  },
  
  // Short expressions
  {
    name: 'Short Urdu-English',
    text: 'haan yes theek hai okay',
    userLanguages: ['Urdu', 'English'],
    expectedLanguages: ['ur', 'en'],
    description: 'Short agreement expressions',
    romanized: true
  },
  
  // Hindi-Urdu-English (trilingual)
  {
    name: 'Hindi-Urdu-English Mix',
    text: 'main ghar gaya tha phir mai office aaya aur meeting attend ki',
    userLanguages: ['Hindi', 'Urdu', 'English'],
    expectedLanguages: ['hi', 'ur', 'en'],
    description: 'Hindi-Urdu overlap with English',
    romanized: true
  },
  
  // Arabic-Urdu-English
  {
    name: 'Arabic-Urdu-English Mix',
    text: 'salam everyone main ana chahta hun inshallah meeting productive hogi',
    userLanguages: ['Arabic', 'Urdu', 'English'],
    expectedLanguages: ['ar', 'ur', 'en'],
    description: 'Arabic greetings with Urdu and English',
    romanized: true
  },
  
  // Family/Personal context
  {
    name: 'Urdu Family Context',
    text: 'ammi ne kaha hai ke dinner ready hai come quickly',
    userLanguages: ['Urdu', 'English'],
    expectedLanguages: ['ur', 'en'],
    description: 'Family context code-switching',
    romanized: true
  },
  
  // Very short phrases
  {
    name: 'Very Short Urdu',
    text: 'accha okay',
    userLanguages: ['Urdu', 'English'],
    expectedLanguages: ['ur', 'en'],
    description: 'Very short Urdu-English switch',
    romanized: true
  },
  
  // Persian-influenced Urdu
  {
    name: 'Persian-Urdu-English',
    text: 'salam dostam main office mein hun khoda hafez',
    userLanguages: ['Persian', 'Urdu', 'English'],
    expectedLanguages: ['fa', 'ur', 'en'],
    description: 'Persian-influenced Urdu with English',
    romanized: true
  }
];

function analyzeUrduTestResults(result: EnhancedNlpResult, testCase: UrduTestCase): {
  score: number
  feedback: string[]
  metrics: {
    confidence: number
    unknownRate: number
    switchPointsDetected: number
    languageAccuracy: number
    romanizedDetected: boolean
  }
} {
  const feedback: string[] = []
  let score = 0
  
  // Calculate unknown rate
  const totalTokens = result.tokens.length
  const unknownTokens = result.tokens.filter(t => t.language === 'unknown').length
  const unknownRate = totalTokens > 0 ? (unknownTokens / totalTokens) * 100 : 0
  
  // Check if romanized languages were detected
  const romanizedLangs = ['ur', 'hi', 'ar', 'fa', 'tr']
  const romanizedDetected = result.tokens.some(t => romanizedLangs.includes(t.language))
  
  // Confidence evaluation (adjusted for romanized scripts)
  if (result.confidence > 0.6) {
    score += 3
    feedback.push('✅ High confidence achieved for romanized text')
  } else if (result.confidence > 0.4) {
    score += 2
    feedback.push('✅ Good confidence for romanized detection')
  } else if (result.confidence > 0.25) {
    score += 1
    feedback.push('⚠️ Moderate confidence for romanized text')
  } else {
    feedback.push('⚠️ Low confidence detected')
  }
  
  // Unknown rate evaluation (stricter for romanized)
  if (unknownRate < 5) {
    score += 3
    feedback.push('✅ Excellent romanized language coverage')
  } else if (unknownRate < 15) {
    score += 2
    feedback.push('✅ Good romanized language coverage')
  } else if (unknownRate < 30) {
    score += 1
    feedback.push('⚠️ Some unknown tokens in romanized text')
  } else {
    feedback.push('⚠️ High unknown token rate for romanized text')
  }
  
  // Romanized detection bonus
  if (testCase.romanized && romanizedDetected) {
    score += 2
    feedback.push('✅ Successfully detected romanized script')
  } else if (testCase.romanized && !romanizedDetected) {
    feedback.push('⚠️ Failed to detect expected romanized script')
  }
  
  // Switch-point detection
  if (result.switchPoints.length > 0) {
    score += 1
    feedback.push(`✅ ${result.switchPoints.length} switch points detected`)
  } else if (testCase.userLanguages.length > 1) {
    feedback.push('ℹ️ No switch points detected in multilingual text')
  }
  
  // Language accuracy for romanized
  const detectedLangs = [...new Set(result.tokens.filter(t => t.language !== 'unknown').map(t => t.language))]
  const expectedLangs = testCase.expectedLanguages || []
  const languageMatch = expectedLangs.length > 0 ? 
    detectedLangs.filter(lang => expectedLangs.includes(lang)).length / expectedLangs.length : 1
  
  if (languageMatch > 0.7) {
    score += 1
    feedback.push('✅ Good romanized language identification')
  } else if (languageMatch > 0.4) {
    feedback.push('⚠️ Partial romanized language identification')
  } else {
    feedback.push('⚠️ Limited romanized language identification')
  }
  
  return {
    score,
    feedback,
    metrics: {
      confidence: Math.round(result.confidence * 100),
      unknownRate: Math.round(unknownRate),
      switchPointsDetected: result.switchPoints.length,
      languageAccuracy: Math.round(languageMatch * 100),
      romanizedDetected
    }
  }
}

function runUrduRomanizedTests() {
  console.log('🔤 Urdu & Romanized Script Testing Suite - Enhanced Detection')
  console.log('=' .repeat(80))
  console.log()
  
  const results = []
  let totalScore = 0
  let maxScore = 0
  
  for (const testCase of urduRomanizedTestCases) {
    console.log(`📝 Test: ${testCase.name}`)
    console.log(`   Text: "${testCase.text}"`)
    console.log(`   Languages: [${testCase.userLanguages.join(', ')}]`)
    console.log(`   Description: ${testCase.description}`)
    console.log(`   Romanized: ${testCase.romanized ? 'Yes' : 'No'}`)
    
    try {
      const result = analyzeWithUserGuidance(testCase.text, testCase.userLanguages)
      const analysis = analyzeUrduTestResults(result, testCase)
      
      console.log(`   📊 Results:`)
      console.log(`   - Confidence: ${analysis.metrics.confidence}%`)
      console.log(`   - Unknown Rate: ${analysis.metrics.unknownRate}%`)
      console.log(`   - Switch Points: ${analysis.metrics.switchPointsDetected}`)
      console.log(`   - Language Accuracy: ${analysis.metrics.languageAccuracy}%`)
      console.log(`   - Romanized Detected: ${analysis.metrics.romanizedDetected ? 'Yes' : 'No'}`)
      console.log(`   - Score: ${analysis.score}/10`)
      
      // Show detected languages
      const detectedLangs = [...new Set(result.tokens.filter(t => t.language !== 'unknown').map(t => t.language))]
      console.log(`   - Detected Languages: [${detectedLangs.join(', ')}]`)
      
      analysis.feedback.forEach(fb => console.log(`   ${fb}`))
      
      results.push({
        testCase: testCase.name,
        score: analysis.score,
        metrics: analysis.metrics,
        result,
        romanized: testCase.romanized
      })
      
      totalScore += analysis.score
      maxScore += 10
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      results.push({
        testCase: testCase.name,
        score: 0,
        metrics: { 
          confidence: 0, 
          unknownRate: 100, 
          switchPointsDetected: 0, 
          languageAccuracy: 0, 
          romanizedDetected: false 
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        romanized: testCase.romanized
      })
      maxScore += 10
    }
    
    console.log()
  }
  
  // Summary
  console.log('📈 URDU & ROMANIZED TESTING SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Total Tests: ${urduRomanizedTestCases.length}`)
  console.log(`Overall Score: ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore)*100)}%)`)
  console.log()
  
  // Romanized vs Non-romanized analysis
  const romanizedResults = results.filter(r => r.romanized)
  const nonRomanizedResults = results.filter(r => !r.romanized)
  
  if (romanizedResults.length > 0) {
    const avgRomanizedScore = romanizedResults.reduce((sum, r) => sum + r.score, 0) / romanizedResults.length
    const avgRomanizedConfidence = romanizedResults.reduce((sum, r) => sum + r.metrics.confidence, 0) / romanizedResults.length
    const romanizedDetectionRate = romanizedResults.filter(r => r.metrics.romanizedDetected).length / romanizedResults.length * 100
    
    console.log('📋 ROMANIZED SCRIPT PERFORMANCE:')
    console.log(`   - Average Score: ${avgRomanizedScore.toFixed(1)}/10`)
    console.log(`   - Average Confidence: ${avgRomanizedConfidence.toFixed(1)}%`)
    console.log(`   - Romanized Detection Rate: ${romanizedDetectionRate.toFixed(1)}%`)
    console.log()
  }
  
  // Language-specific analysis
  const languagePerformance = {
    'Urdu': results.filter(r => r.testCase.includes('Urdu')),
    'Mixed Scripts': results.filter(r => r.testCase.includes('Mix') || r.testCase.includes('Arabic') || r.testCase.includes('Persian')),
    'Short Text': results.filter(r => r.testCase.includes('Short') || r.testCase.includes('Very')),
    'Professional': results.filter(r => r.testCase.includes('Professional') || r.testCase.includes('office'))
  }
  
  console.log('🎯 CATEGORY PERFORMANCE:')
  for (const [category, categoryResults] of Object.entries(languagePerformance)) {
    if (categoryResults.length > 0) {
      const avgScore = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length
      const avgConfidence = categoryResults.reduce((sum, r) => sum + r.metrics.confidence, 0) / categoryResults.length
      const avgUnknown = categoryResults.reduce((sum, r) => sum + r.metrics.unknownRate, 0) / categoryResults.length
      
      console.log(`   ${category}:`)
      console.log(`   - Average Score: ${avgScore.toFixed(1)}/10`)
      console.log(`   - Average Confidence: ${avgConfidence.toFixed(1)}%`)
      console.log(`   - Average Unknown Rate: ${avgUnknown.toFixed(1)}%`)
      console.log()
    }
  }
  
  // Recommendations
  console.log('🎯 ROMANIZED SCRIPT RECOMMENDATIONS:')
  const overallPerformance = totalScore / maxScore
  if (overallPerformance > 0.75) {
    console.log('   ✅ Excellent romanized script detection performance')
    console.log('   ✅ Ready for Urdu and multilingual romanized text processing')
  } else if (overallPerformance > 0.6) {
    console.log('   ✅ Good romanized script detection with room for improvement')
    console.log('   ⚠️ Consider expanding romanization patterns for edge cases')
  } else {
    console.log('   ⚠️ Romanized script detection needs significant improvement')
    console.log('   🔧 Requires pattern refinement and confidence adjustments')
  }
  
  return results
}

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runUrduRomanizedTests()
}

export { runUrduRomanizedTests, urduRomanizedTestCases }