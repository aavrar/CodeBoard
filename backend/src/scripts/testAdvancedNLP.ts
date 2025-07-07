import { analyzeWithUserGuidance, EnhancedNlpResult } from '../services/enhancedNlpService.js'

interface TestCase {
  name: string
  text: string
  userLanguages: string[]
  expectedLanguages?: string[]
  description: string
}

const advancedTestCases: TestCase[] = [
  // Non-Latin Scripts
  {
    name: 'Hindi-Only',
    text: 'मैं आज बहुत खुश हूं क्योंकि मेरा काम पूरा हो गया',
    userLanguages: ['Hindi'],
    expectedLanguages: ['hi'],
    description: 'Pure Hindi sentence with no English'
  },
  {
    name: 'Arabic-Only', 
    text: 'أنا سعيد جداً اليوم لأن عملي اكتمل',
    userLanguages: ['Arabic'],
    expectedLanguages: ['ar'],
    description: 'Pure Arabic sentence with no English'
  },
  {
    name: 'Chinese-Only',
    text: '我今天很高兴因为我的工作完成了',
    userLanguages: ['Chinese'],
    expectedLanguages: ['zh'],
    description: 'Pure Chinese sentence with no English'
  },
  {
    name: 'Hindi-Arabic Mixed',
    text: 'मैं आज بहुत سعيد हूं',
    userLanguages: ['Hindi', 'Arabic'],
    expectedLanguages: ['hi', 'ar'],
    description: 'Mixed Hindi-Arabic with no English'
  },

  // Multi-language (3+ languages)
  {
    name: 'Tri-lingual Professional',
    text: 'The meeting was très productive, pero necesitamos more time para la conclusión',
    userLanguages: ['English', 'French', 'Spanish'],
    expectedLanguages: ['en', 'fr', 'es'],
    description: 'English-French-Spanish professional context'
  },
  {
    name: 'Quad-lingual Social',
    text: 'I love pasta italiana, c\'est très delicious, pero mi nonna makes the best',
    userLanguages: ['English', 'Italian', 'French', 'Spanish'],
    expectedLanguages: ['en', 'it', 'fr', 'es'],
    description: 'Four languages in casual conversation'
  },
  {
    name: 'Multi-script Tri-lingual',
    text: 'I went to Mumbai, वहाँ बहुत गर्मी थी, but the food was délicieux',
    userLanguages: ['English', 'Hindi', 'French'],
    expectedLanguages: ['en', 'hi', 'fr'],
    description: 'Three languages with mixed scripts'
  },

  // Quick successive switches
  {
    name: 'Rapid Spanish-English',
    text: 'Sí yes no no maybe tal vez definitely definitivamente',
    userLanguages: ['Spanish', 'English'],
    expectedLanguages: ['es', 'en'],
    description: 'Rapid alternation between Spanish and English'
  },
  {
    name: 'Rapid French-English-German',
    text: 'Oui yes ja non no nein perhaps peut-être vielleicht',
    userLanguages: ['French', 'English', 'German'],
    expectedLanguages: ['fr', 'en', 'de'],
    description: 'Rapid switches between three languages'
  },
  {
    name: 'Intra-sentential Quick Switch',
    text: 'I was walking por la calle and then je suis entré dans le magasin',
    userLanguages: ['English', 'Spanish', 'French'],
    expectedLanguages: ['en', 'es', 'fr'],
    description: 'Multiple quick switches within single sentence'
  },

  // Varied sentence lengths
  {
    name: 'Very Short Mixed',
    text: 'Sí yes',
    userLanguages: ['Spanish', 'English'],
    expectedLanguages: ['es', 'en'],
    description: 'Extremely short two-language sentence'
  },
  {
    name: 'Short Hindi-English',
    text: 'मैं busy हूं',
    userLanguages: ['Hindi', 'English'],
    expectedLanguages: ['hi', 'en'],
    description: 'Short Hindi-English code-switch'
  },
  {
    name: 'Medium Complex',
    text: 'Yesterday I went to the marché français and bought some légumes pour ma mère',
    userLanguages: ['English', 'French'],
    expectedLanguages: ['en', 'fr'],
    description: 'Medium-length sentence with embedded French'
  },
  {
    name: 'Long Narrative',
    text: 'When I was traveling through Europe last summer, je suis allé en France where I met this incredible persona española who told me about her experiencias de vida, and we spent hours talking about la philosophie de la vie while drinking café con leche in a pequeño bistro near the Seine river',
    userLanguages: ['English', 'French', 'Spanish'],
    expectedLanguages: ['en', 'fr', 'es'],
    description: 'Long narrative with multiple embedded languages'
  },

  // Edge cases
  {
    name: 'Single Word Switches',
    text: 'I love sushi and pasta y pizza también',
    userLanguages: ['English', 'Spanish'],
    expectedLanguages: ['en', 'es'],
    description: 'Individual word switches embedded in sentence'
  },
  {
    name: 'Code-mixed Compound',
    text: 'That was so embarazoso-awkward, like súper-mega cringe',
    userLanguages: ['English', 'Spanish'],
    expectedLanguages: ['en', 'es'],
    description: 'Compound words with mixed languages'
  }
]

function analyzeTestResults(result: EnhancedNlpResult, testCase: TestCase): {
  score: number
  feedback: string[]
  metrics: {
    confidence: number
    unknownRate: number
    switchPointsDetected: number
    languageAccuracy: number
  }
} {
  const feedback: string[] = []
  let score = 0
  
  // Calculate unknown rate
  const totalTokens = result.tokens.length
  const unknownTokens = result.tokens.filter(t => t.language === 'unknown').length
  const unknownRate = totalTokens > 0 ? (unknownTokens / totalTokens) * 100 : 0
  
  // Confidence evaluation
  if (result.confidence > 0.7) {
    score += 3
    feedback.push('✅ High confidence achieved')
  } else if (result.confidence > 0.5) {
    score += 2
    feedback.push('✅ Moderate confidence achieved')
  } else {
    score += 1
    feedback.push('⚠️ Low confidence detected')
  }
  
  // Unknown rate evaluation
  if (unknownRate < 10) {
    score += 3
    feedback.push('✅ Excellent language detection coverage')
  } else if (unknownRate < 30) {
    score += 2
    feedback.push('✅ Good language detection coverage')
  } else {
    score += 1
    feedback.push('⚠️ High unknown token rate')
  }
  
  // Switch-point detection
  if (result.switchPoints.length > 0) {
    score += 2
    feedback.push(`✅ ${result.switchPoints.length} switch points detected`)
  } else {
    feedback.push('ℹ️ No switch points detected')
  }
  
  // Language accuracy
  const detectedLangs = [...new Set(result.tokens.filter(t => t.language !== 'unknown').map(t => t.language))]
  const expectedLangs = testCase.expectedLanguages || []
  const languageMatch = expectedLangs.length > 0 ? 
    detectedLangs.filter(lang => expectedLangs.includes(lang)).length / expectedLangs.length : 1
  
  if (languageMatch > 0.8) {
    score += 2
    feedback.push('✅ Excellent language identification')
  } else if (languageMatch > 0.5) {
    score += 1
    feedback.push('✅ Good language identification')
  } else {
    feedback.push('⚠️ Language identification needs improvement')
  }
  
  return {
    score,
    feedback,
    metrics: {
      confidence: Math.round(result.confidence * 100),
      unknownRate: Math.round(unknownRate),
      switchPointsDetected: result.switchPoints.length,
      languageAccuracy: Math.round(languageMatch * 100)
    }
  }
}

function runAdvancedNLPTests() {
  console.log('🧪 Advanced NLP Testing Suite - Enhanced Language Detection')
  console.log('=' .repeat(80))
  console.log()
  
  const results = []
  let totalScore = 0
  let maxScore = 0
  
  for (const testCase of advancedTestCases) {
    console.log(`📝 Test: ${testCase.name}`)
    console.log(`   Text: "${testCase.text}"`)
    console.log(`   Languages: [${testCase.userLanguages.join(', ')}]`)
    console.log(`   Description: ${testCase.description}`)
    
    try {
      const result = analyzeWithUserGuidance(testCase.text, testCase.userLanguages)
      const analysis = analyzeTestResults(result, testCase)
      
      console.log(`   📊 Results:`)
      console.log(`   - Confidence: ${analysis.metrics.confidence}%`)
      console.log(`   - Unknown Rate: ${analysis.metrics.unknownRate}%`)
      console.log(`   - Switch Points: ${analysis.metrics.switchPointsDetected}`)
      console.log(`   - Language Accuracy: ${analysis.metrics.languageAccuracy}%`)
      console.log(`   - Score: ${analysis.score}/10`)
      
      analysis.feedback.forEach(fb => console.log(`   ${fb}`))
      
      results.push({
        testCase: testCase.name,
        score: analysis.score,
        metrics: analysis.metrics,
        result
      })
      
      totalScore += analysis.score
      maxScore += 10
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      results.push({
        testCase: testCase.name,
        score: 0,
        metrics: { confidence: 0, unknownRate: 100, switchPointsDetected: 0, languageAccuracy: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      maxScore += 10
    }
    
    console.log()
  }
  
  // Summary
  console.log('📈 ADVANCED TESTING SUMMARY')
  console.log('=' .repeat(80))
  console.log(`Total Tests: ${advancedTestCases.length}`)
  console.log(`Overall Score: ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore)*100)}%)`)
  console.log()
  
  // Category analysis
  const categories = {
    'Non-Latin Scripts': results.filter(r => r.testCase.includes('Hindi') || r.testCase.includes('Arabic') || r.testCase.includes('Chinese')),
    'Multi-language (3+)': results.filter(r => r.testCase.includes('Tri') || r.testCase.includes('Quad')),
    'Quick Switches': results.filter(r => r.testCase.includes('Rapid') || r.testCase.includes('Quick')),
    'Varied Lengths': results.filter(r => r.testCase.includes('Short') || r.testCase.includes('Long') || r.testCase.includes('Medium')),
    'Edge Cases': results.filter(r => r.testCase.includes('Single') || r.testCase.includes('Compound'))
  }
  
  console.log('📋 CATEGORY PERFORMANCE:')
  for (const [category, categoryResults] of Object.entries(categories)) {
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
  console.log('🎯 RECOMMENDATIONS:')
  if (totalScore / maxScore > 0.8) {
    console.log('   ✅ Excellent performance across all test categories')
    console.log('   ✅ System ready for production deployment')
  } else if (totalScore / maxScore > 0.6) {
    console.log('   ✅ Good performance with room for specific improvements')
    console.log('   ⚠️ Consider fine-tuning for specific edge cases')
  } else {
    console.log('   ⚠️ Performance issues detected in multiple categories')
    console.log('   🔧 Requires optimization before production deployment')
  }
  
  return results
}

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAdvancedNLPTests()
}

export { runAdvancedNLPTests, advancedTestCases }