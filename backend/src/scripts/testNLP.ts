#!/usr/bin/env tsx

import { analyzeSentence, analyzeText, getDetectionStats } from '../services/nlpService.js';

// Test cases for code-switching validation
const testCases = [
  {
    name: "English-Spanish casual conversation",
    text: "I'm going to the store, pero first I need to finish this trabajo",
    expectedLanguages: ["en", "es"],
    description: "Common English-Spanish code-switching"
  },
  {
    name: "Hindi-English family conversation", 
    text: "मैं ठीक हूं but I'm very busy today with work",
    expectedLanguages: ["hi", "en"],
    description: "Hindi-English mixing common in bilingual families"
  },
  {
    name: "French-English business context",
    text: "Je suis très busy today, cannot meet for the réunion",
    expectedLanguages: ["fr", "en"],
    description: "French-English professional code-switching"
  },
  {
    name: "Spanish-English social media",
    text: "¿Vienes a la party tonight? It's going to be súper fun!",
    expectedLanguages: ["es", "en"],
    description: "Spanish-English informal communication"
  },
  {
    name: "Short function words test",
    text: "I go to la tienda and buy some things",
    expectedLanguages: ["en", "es"],
    description: "Testing detection of short function words"
  }
];

console.log('🚀 Testing Enhanced NLP Service with ELD\n');
console.log('=========================================\n');

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
  console.log(`Text: "${testCase.text}"`);
  console.log(`Expected languages: ${testCase.expectedLanguages.join(', ')}`);
  console.log(`Description: ${testCase.description}\n`);
  
  // Analyze the sentence
  const result = analyzeSentence(testCase.text);
  
  // Get detection statistics
  const stats = getDetectionStats(result);
  
  console.log('📊 Results:');
  console.log(`- Total tokens: ${stats.totalTokens}`);
  console.log(`- Switch points detected: ${stats.totalSwitchPoints}`);
  console.log(`- Overall confidence: ${(stats.overallConfidence * 100).toFixed(1)}%`);
  
  console.log('\n🔍 Token Analysis:');
  result.tokens.forEach((token, i) => {
    const switchMarker = result.switchPoints.includes(i) ? ' 🔄' : '';
    const confidence = (token.confidence * 100).toFixed(1);
    console.log(`  ${i + 1}. "${token.word}" → ${token.lang} (${confidence}%)${switchMarker}`);
  });
  
  console.log('\n📈 Language Breakdown:');
  stats.languageBreakdown.forEach((lang, i) => {
    const avgConf = (lang.averageConfidence * 100).toFixed(1);
    console.log(`  ${i + 1}. ${lang.language}: ${lang.count} tokens (${lang.percentage.toFixed(1)}%) - Avg confidence: ${avgConf}%`);
  });
  
  // Validate expected languages
  const detectedLanguages = stats.languageBreakdown
    .filter(lang => lang.language !== 'unknown')
    .map(lang => lang.language);
  
  const hasExpectedLanguages = testCase.expectedLanguages.every(expected => 
    detectedLanguages.some(detected => detected.startsWith(expected))
  );
  
  console.log(`\n✅ Validation: ${hasExpectedLanguages ? 'PASSED' : 'NEEDS REVIEW'}`);
  
  if (!hasExpectedLanguages) {
    console.log(`   Expected: ${testCase.expectedLanguages.join(', ')}`);
    console.log(`   Detected: ${detectedLanguages.join(', ')}`);
  }
  
  console.log('\n' + '─'.repeat(60));
});

console.log('\n🎯 Performance Summary');
console.log('====================');

// Test performance with longer text
const longText = `I'm really excited about this proyecto. We've been working on it por mucho tiempo and I think it's going to be amazing. The team is très dedicated and everyone brings their unique perspective. Espero que everything works out bien because this could be a game-changer for our company.`;

console.log(`\nTesting longer text analysis:`);
console.log(`Text: "${longText}"`);

const startTime = process.hrtime.bigint();
const longResult = analyzeText(longText);
const endTime = process.hrtime.bigint();

const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
const longStats = getDetectionStats(longResult);

console.log(`\n⚡ Performance:`);
console.log(`- Execution time: ${executionTime.toFixed(2)}ms`);
console.log(`- Tokens processed: ${longStats.totalTokens}`);
console.log(`- Tokens per second: ${(longStats.totalTokens / (executionTime / 1000)).toFixed(0)}`);
console.log(`- Switch points: ${longStats.totalSwitchPoints}`);
console.log(`- Overall confidence: ${(longStats.overallConfidence * 100).toFixed(1)}%`);

console.log('\n🏆 Enhanced NLP Service Test Complete!');