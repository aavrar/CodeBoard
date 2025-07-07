import { analyzeWithUserGuidance } from '../services/enhancedNlpService.js'
import { nlpCache } from '../services/cacheService.js'

function testCachingPerformance() {
  console.log('🧪 Testing NLP Caching Performance')
  console.log('=' .repeat(50))
  
  const testText = "I'm going to la tienda to buy some groceries"
  const userLanguages = ['English', 'Spanish']
  
  // Clear cache for clean test
  nlpCache.clear()
  
  console.log('📝 Test Text:', testText)
  console.log('🗣️ User Languages:', userLanguages.join(', '))
  console.log()
  
  // First run (cache miss)
  console.log('🔄 First analysis (cache miss):')
  const start1 = Date.now()
  const result1 = analyzeWithUserGuidance(testText, userLanguages)
  const time1 = Date.now() - start1
  
  console.log(`   ⏱️ Processing time: ${time1}ms`)
  console.log(`   🎯 Confidence: ${Math.round(result1.confidence * 100)}%`)
  console.log(`   🔄 Switch points: ${result1.switchPoints.length}`)
  console.log()
  
  // Second run (cache hit)
  console.log('⚡ Second analysis (cache hit):')
  const start2 = Date.now()
  const result2 = analyzeWithUserGuidance(testText, userLanguages)
  const time2 = Date.now() - start2
  
  console.log(`   ⏱️ Processing time: ${time2}ms`)
  console.log(`   🎯 Confidence: ${Math.round(result2.confidence * 100)}%`)
  console.log(`   🔄 Switch points: ${result2.switchPoints.length}`)
  console.log()
  
  // Performance comparison
  const speedup = time1 / time2
  console.log('📊 Performance Analysis:')
  console.log(`   🚀 Cache speedup: ${speedup.toFixed(1)}x faster`)
  console.log(`   📉 Time reduction: ${Math.round(((time1 - time2) / time1) * 100)}%`)
  console.log()
  
  // Test with different languages
  console.log('🌍 Testing cache with different language combinations:')
  
  const testCases = [
    { text: testText, langs: ['English', 'Spanish'] },
    { text: testText, langs: ['Spanish', 'English'] }, // Different order, should be same cache key
    { text: testText, langs: ['English'] },              // Different languages
    { text: testText.toLowerCase(), langs: ['English', 'Spanish'] } // Different case, should be same cache key
  ]
  
  testCases.forEach((testCase, i) => {
    const start = Date.now()
    const result = analyzeWithUserGuidance(testCase.text, testCase.langs)
    const time = Date.now() - start
    
    console.log(`   Test ${i + 1}: ${time}ms (languages: ${testCase.langs.join(', ')})`)
  })
  
  console.log()
  
  // Cache statistics
  console.log('📈 Cache Statistics:')
  const stats = nlpCache.getStats()
  console.log(`   📦 Cache size: ${stats.size}/${stats.maxSize}`)
  console.log(`   ⏰ TTL: ${stats.ttlMinutes} minutes`)
  console.log(`   🎯 Average hit rate: ${stats.hitRate.toFixed(1)}`)
  
  if (stats.topEntries.length > 0) {
    console.log('   🏆 Top cached entries:')
    stats.topEntries.forEach((entry, i) => {
      console.log(`     ${i + 1}. "${entry.text}" (${entry.languages}) - ${entry.accessCount} hits`)
    })
  }
  
  console.log()
  console.log('✅ Cache testing completed successfully!')
}

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testCachingPerformance()
}

export { testCachingPerformance }