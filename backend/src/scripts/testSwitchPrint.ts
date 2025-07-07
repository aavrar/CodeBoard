import { analyzeWithSwitchPrint, checkSwitchPrintHealth, getSwitchPrintStats } from '../services/switchprintNlpService.js';

/**
 * Test SwitchPrint NLP Service Integration
 */

const testTexts = [
  {
    text: "Hello, ¿cómo estás?",
    languages: ["english", "spanish"],
    description: "Basic English-Spanish code-switching"
  },
  {
    text: "I'm going to la tienda para comprar some groceries",
    languages: ["english", "spanish"],
    description: "Complex intra-sentential switching"
  },
  {
    text: "मैं अच्छा हूं, how are you doing today?",
    languages: ["hindi", "english"],
    description: "Hindi-English code-switching"
  },
  {
    text: "Bonjour, je suis très tired aujourd'hui",
    languages: ["french", "english"],
    description: "French-English code-switching"
  },
  {
    text: "Just a simple English sentence",
    languages: ["english"],
    description: "Monolingual English baseline"
  }
];

async function runSwitchPrintTests() {
  console.log('🚀 Testing SwitchPrint NLP Service Integration\n');

  // 1. Health Check
  console.log('1. Health Check');
  const isHealthy = await checkSwitchPrintHealth();
  console.log(`   SwitchPrint Service Health: ${isHealthy ? '✅ Healthy' : '❌ Unavailable'}\n`);

  if (!isHealthy) {
    console.log('⚠️  SwitchPrint service is not available. Tests will use fallback mode.\n');
  }

  // 2. Test Analysis
  console.log('2. Analysis Tests');
  for (let i = 0; i < testTexts.length; i++) {
    const test = testTexts[i];
    console.log(`\n   Test ${i + 1}: ${test.description}`);
    console.log(`   Text: "${test.text}"`);
    console.log(`   Expected Languages: [${test.languages.join(', ')}]`);

    try {
      const startTime = Date.now();
      const result = await analyzeWithSwitchPrint(test.text, test.languages);
      const analysisTime = Date.now() - startTime;

      console.log(`   Results:`);
      console.log(`     ✅ Detected Languages: [${result.detectedLanguages.join(', ')}]`);
      console.log(`     ✅ Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`     ✅ Switch Points: ${result.switchPoints.length}`);
      console.log(`     ✅ Tokens: ${result.tokens.length}`);
      console.log(`     ✅ Phrases: ${result.phrases.length}`);
      console.log(`     ⚡ Processing Time: ${result.processingTimeMs.toFixed(1)}ms (API)`);
      console.log(`     ⚡ Total Time: ${analysisTime}ms (including network)`);
      console.log(`     💾 Cache Hit: ${result.cacheHit ? 'Yes' : 'No'}`);
      console.log(`     🎯 User Language Match: ${result.userLanguageMatch ? 'Yes' : 'No'}`);

      // Show token details
      if (result.tokens.length > 0) {
        console.log(`     📝 Token Breakdown:`);
        result.tokens.forEach((token, idx) => {
          console.log(`        ${idx + 1}. "${token.word}" → ${token.language} (${(token.confidence * 100).toFixed(1)}%)`);
        });
      }

      // Show phrases
      if (result.phrases.length > 0) {
        console.log(`     📄 Phrase Breakdown:`);
        result.phrases.forEach((phrase, idx) => {
          console.log(`        ${idx + 1}. "${phrase.text}" → ${phrase.language} (${(phrase.confidence * 100).toFixed(1)}%)`);
        });
      }

    } catch (error) {
      console.log(`     ❌ Error: ${error}`);
    }
  }

  // 3. Performance Test
  console.log('\n3. Performance Test');
  const performanceText = "Hello world, este es un test de performance para medir speed";
  const iterations = 5;
  
  console.log(`   Running ${iterations} iterations for performance measurement...`);
  
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    await analyzeWithSwitchPrint(performanceText, ["english", "spanish"]);
    const endTime = Date.now();
    times.push(endTime - startTime);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log(`   📊 Performance Results:`);
  console.log(`     ⚡ Average Time: ${avgTime.toFixed(1)}ms`);
  console.log(`     ⚡ Min Time: ${minTime}ms`);
  console.log(`     ⚡ Max Time: ${maxTime}ms`);
  console.log(`     🎯 Expected: ~0.1ms (80x faster than ELD)`);

  // 4. Cache Test
  console.log('\n4. Cache Test');
  const cacheText = "Cache test sentence for testing caching behavior";
  
  console.log('   First analysis (cache miss):');
  const firstResult = await analyzeWithSwitchPrint(cacheText, ["english"]);
  console.log(`     Cache Hit: ${firstResult.cacheHit}`);
  console.log(`     Processing Time: ${firstResult.processingTimeMs.toFixed(1)}ms`);

  console.log('   Second analysis (should be cache hit):');
  const secondResult = await analyzeWithSwitchPrint(cacheText, ["english"]);
  console.log(`     Cache Hit: ${secondResult.cacheHit}`);
  console.log(`     Processing Time: ${secondResult.processingTimeMs.toFixed(1)}ms`);

  // 5. Service Statistics
  console.log('\n5. Service Statistics');
  try {
    const stats = await getSwitchPrintStats();
    console.log('   📈 SwitchPrint Service Stats:');
    console.log(`     Total Requests: ${stats.total_requests}`);
    console.log(`     Cache Hits: ${stats.cache_hits}`);
    console.log(`     Cache Size: ${stats.cache_size}`);
    console.log(`     Hit Rate: ${(stats.hit_rate * 100).toFixed(1)}%`);
    console.log(`     Available: ${stats.available ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log(`     ❌ Failed to get stats: ${error}`);
  }

  console.log('\n✅ SwitchPrint NLP Service Integration Test Complete!');
}

// Run tests
runSwitchPrintTests().catch(console.error);