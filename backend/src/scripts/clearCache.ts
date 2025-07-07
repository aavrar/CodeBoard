import { nlpCache } from '../services/cacheService.js'

function clearNLPCache() {
  console.log('🧹 Clearing NLP Cache for Performance Reset')
  console.log('=' .repeat(50))
  
  // Get current stats before clearing
  const statsBefore = nlpCache.getStats()
  console.log('📊 Cache Status Before Clearing:')
  console.log(`   📦 Size: ${statsBefore.size}/${statsBefore.maxSize}`)
  console.log(`   🎯 Hit Rate: ${statsBefore.hitRate.toFixed(1)}`)
  console.log(`   ⏰ TTL: ${statsBefore.ttlMinutes} minutes`)
  
  if (statsBefore.topEntries.length > 0) {
    console.log('   🏆 Top Cached Entries:')
    statsBefore.topEntries.forEach((entry, i) => {
      console.log(`     ${i + 1}. "${entry.text}" - ${entry.accessCount} hits`)
    })
  }
  
  console.log()
  
  // Clear the cache
  nlpCache.clear()
  
  // Verify it's cleared
  const statsAfter = nlpCache.getStats()
  console.log('✅ Cache Cleared Successfully:')
  console.log(`   📦 Size: ${statsAfter.size}/${statsAfter.maxSize}`)
  console.log(`   🚀 Memory freed: Cache reset for optimal performance`)
  console.log(`   💡 Next requests will be processed fresh (no cached results)`)
  
  console.log()
  console.log('🎯 Performance Reset Complete!')
  console.log('   - Database queries will run fresh')
  console.log('   - NLP processing will generate new results')
  console.log('   - Cache will rebuild with new usage patterns')
}

// Execute cache clearing
if (import.meta.url === `file://${process.argv[1]}`) {
  clearNLPCache()
}

export { clearNLPCache }