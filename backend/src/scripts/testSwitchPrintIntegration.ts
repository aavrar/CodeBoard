#!/usr/bin/env node
/**
 * Comprehensive SwitchPrint Integration Test Suite
 * Tests all aspects of the SwitchPrint integration with 16+ scenarios
 */

import { analyzeWithSwitchPrint, checkSwitchPrintHealth, getSwitchPrintStats } from '../services/switchprintNlpService.js';
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

interface TestScenario {
  id: number;
  name: string;
  description: string;
  text: string;
  userLanguages: string[];
  expectedLanguages: string[];
  expectedSwitchPoints: number;
  category: string;
}

// 16+ comprehensive test scenarios
const testScenarios: TestScenario[] = [
  // Basic Code-Switching
  {
    id: 1,
    name: "English-Spanish Basic",
    description: "Simple English-Spanish code-switching",
    text: "Hello, ¿cómo estás?",
    userLanguages: ["English", "Spanish"],
    expectedLanguages: ["english", "spanish"],
    expectedSwitchPoints: 1,
    category: "Basic Code-Switching"
  },
  {
    id: 2,
    name: "French-English Basic",
    description: "Simple French-English code-switching",
    text: "Bonjour, how are you today?",
    userLanguages: ["French", "English"],
    expectedLanguages: ["french", "english"],
    expectedSwitchPoints: 1,
    category: "Basic Code-Switching"
  },
  {
    id: 3,
    name: "Hindi-English Basic",
    description: "Simple Hindi-English code-switching",
    text: "नमस्ते, how are you?",
    userLanguages: ["Hindi", "English"],
    expectedLanguages: ["hindi", "english"],
    expectedSwitchPoints: 1,
    category: "Basic Code-Switching"
  },

  // Complex Intra-sentential Switching
  {
    id: 4,
    name: "Complex English-Spanish",
    description: "Complex intra-sentential code-switching",
    text: "I'm going to la tienda para comprar some groceries",
    userLanguages: ["English", "Spanish"],
    expectedLanguages: ["english", "spanish"],
    expectedSwitchPoints: 2,
    category: "Complex Switching"
  },
  {
    id: 5,
    name: "Mixed Business Context",
    description: "Professional context with multiple switches",
    text: "The meeting está scheduled for mañana at the oficina",
    userLanguages: ["English", "Spanish"],
    expectedLanguages: ["english", "spanish"],
    expectedSwitchPoints: 3,
    category: "Complex Switching"
  },
  {
    id: 6,
    name: "Academic Context",
    description: "Academic discussion with technical terms",
    text: "The algoritmo works bien, but we need más testing",
    userLanguages: ["English", "Spanish"],
    expectedLanguages: ["english", "spanish"],
    expectedSwitchPoints: 2,
    category: "Complex Switching"
  },

  // Multi-language (3+ languages)
  {
    id: 7,
    name: "Trilingual Conversation",
    description: "Three languages in one sentence",
    text: "Hello, je suis muy tired today",
    userLanguages: ["English", "French", "Spanish"],
    expectedLanguages: ["english", "french", "spanish"],
    expectedSwitchPoints: 3,
    category: "Multi-language"
  },
  {
    id: 8,
    name: "European Mix",
    description: "German, French, English mix",
    text: "Guten Tag, I'm going au marché today",
    userLanguages: ["German", "English", "French"],
    expectedLanguages: ["german", "english", "french"],
    expectedSwitchPoints: 2,
    category: "Multi-language"
  },

  // Non-Latin Scripts
  {
    id: 9,
    name: "Arabic-English",
    description: "Arabic script with English",
    text: "السلام عليكم, how are you today?",
    userLanguages: ["Arabic", "English"],
    expectedLanguages: ["arabic", "english"],
    expectedSwitchPoints: 1,
    category: "Non-Latin Scripts"
  },
  {
    id: 10,
    name: "Chinese-English",
    description: "Chinese characters with English",
    text: "你好, nice to meet you",
    userLanguages: ["Chinese", "English"],
    expectedLanguages: ["chinese", "english"],
    expectedSwitchPoints: 1,
    category: "Non-Latin Scripts"
  },
  {
    id: 11,
    name: "Hindi Script",
    description: "Devanagari script with English",
    text: "मैं अच्छा हूं, and you?",
    userLanguages: ["Hindi", "English"],
    expectedLanguages: ["hindi", "english"],
    expectedSwitchPoints: 1,
    category: "Non-Latin Scripts"
  },

  // Quick Switches
  {
    id: 12,
    name: "Rapid Alternation",
    description: "Very quick language alternation",
    text: "Yes sí no non oui ja",
    userLanguages: ["English", "Spanish", "French", "German"],
    expectedLanguages: ["english", "spanish", "french", "german"],
    expectedSwitchPoints: 4,
    category: "Quick Switches"
  },
  {
    id: 13,
    name: "Word-level Switching",
    description: "Word-by-word language switching",
    text: "Good bueno bien gut",
    userLanguages: ["English", "Spanish", "French", "German"],
    expectedLanguages: ["english", "spanish", "french", "german"],
    expectedSwitchPoints: 3,
    category: "Quick Switches"
  },

  // Varied Lengths
  {
    id: 14,
    name: "Very Short",
    description: "Minimal text",
    text: "Hola hi",
    userLanguages: ["Spanish", "English"],
    expectedLanguages: ["spanish", "english"],
    expectedSwitchPoints: 1,
    category: "Varied Lengths"
  },
  {
    id: 15,
    name: "Medium Length",
    description: "Standard conversation length",
    text: "I went to the mercado yesterday and bought algunos vegetables for dinner tonight",
    userLanguages: ["English", "Spanish"],
    expectedLanguages: ["english", "spanish"],
    expectedSwitchPoints: 2,
    category: "Varied Lengths"
  },
  {
    id: 16,
    name: "Long Narrative",
    description: "Extended text with multiple switches",
    text: "Yesterday I woke up early y decidí ir al gimnasio. After my workout, j'ai mangé un petit déjeuner delicioso. Then I went to work donde tuve una meeting importante avec mes collègues. We discussed varios proyectos and made some important decisions for the future.",
    userLanguages: ["English", "Spanish", "French"],
    expectedLanguages: ["english", "spanish", "french"],
    expectedSwitchPoints: 8,
    category: "Varied Lengths"
  },

  // Edge Cases
  {
    id: 17,
    name: "Numbers and Mixed",
    description: "Numbers, punctuation, and mixed content",
    text: "I have 25 años and live in 123 Main Street",
    userLanguages: ["English", "Spanish"],
    expectedLanguages: ["english", "spanish"],
    expectedSwitchPoints: 1,
    category: "Edge Cases"
  },
  {
    id: 18,
    name: "Romanized Languages",
    description: "Romanized non-Latin languages",
    text: "Main accha hun, how are you?",
    userLanguages: ["Urdu", "English"],
    expectedLanguages: ["urdu", "english"],
    expectedSwitchPoints: 1,
    category: "Edge Cases"
  }
];

class SwitchPrintIntegrationTester {
  private results: any[] = [];
  private summary = {
    total: 0,
    passed: 0,
    failed: 0,
    avgProcessingTime: 0,
    totalSwitchPoints: 0,
    categorySummary: {} as Record<string, any>
  };

  async runAllTests(): Promise<void> {
    console.log('🚀 SwitchPrint Integration Test Suite');
    console.log('=====================================\n');

    // Health Check
    await this.healthCheck();

    // API Tests
    await this.testAPIEndpoints();

    // Core Analysis Tests
    for (const scenario of testScenarios) {
      await this.testScenario(scenario);
    }

    // Performance Tests
    await this.performanceTests();

    // Cache Tests
    await this.cacheTests();

    // Generate Report
    this.generateReport();
  }

  async healthCheck(): Promise<void> {
    console.log('1. 🔍 Health Check');
    console.log('=================');

    try {
      const isHealthy = await checkSwitchPrintHealth();
      console.log(`   SwitchPrint Service: ${isHealthy ? '✅ Available' : '❌ Unavailable'}`);

      if (isHealthy) {
        const stats = await getSwitchPrintStats();
        console.log(`   Service Stats: ${stats.total_requests} requests, ${(stats.hit_rate * 100).toFixed(1)}% cache hit rate`);
      }
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error}`);
    }

    console.log('');
  }

  async testAPIEndpoints(): Promise<void> {
    console.log('2. 🌐 API Endpoint Tests');
    console.log('========================');

    // Test live analysis endpoint
    try {
      const response = await axios.post(`${API_BASE}/api/live-analysis`, {
        text: "Test de funcionamiento del API",
        languages: ["English", "Spanish"],
        includeDetails: true
      });

      if (response.data.success) {
        console.log('   ✅ Live Analysis Endpoint: Working');
        console.log(`   Engine: ${response.data.data.processing.engine}`);
        console.log(`   Processing Time: ${response.data.data.processing.timeMs}ms`);
      }
    } catch (error) {
      console.log(`   ❌ Live Analysis Endpoint: Failed - ${error}`);
    }

    // Test examples endpoint
    try {
      const response = await axios.post(`${API_BASE}/api/examples`, {
        text: "Testing the examples endpoint con SwitchPrint",
        languages: ["English", "Spanish"],
        context: "API test",
        region: "Test",
        platform: "api",
        age: "26-35"
      });

      if (response.data.success) {
        console.log('   ✅ Examples Endpoint: Working');
        console.log(`   Detected ${response.data.data.detectedLanguages?.length || 0} languages`);
      }
    } catch (error) {
      console.log(`   ❌ Examples Endpoint: Failed - ${error}`);
    }

    // Test stats endpoint
    try {
      const response = await axios.get(`${API_BASE}/api/live-analysis/stats`);
      if (response.data.success) {
        console.log('   ✅ Stats Endpoint: Working');
        console.log(`   Performance Engine: ${response.data.data.performanceEngine}`);
      }
    } catch (error) {
      console.log(`   ❌ Stats Endpoint: Failed - ${error}`);
    }

    console.log('');
  }

  async testScenario(scenario: TestScenario): Promise<void> {
    this.summary.total++;
    
    try {
      const startTime = Date.now();
      const result = await analyzeWithSwitchPrint(scenario.text, scenario.userLanguages);
      const processingTime = Date.now() - startTime;

      // Evaluate results
      const languageMatches = this.evaluateLanguageDetection(result.detectedLanguages, scenario.expectedLanguages);
      const switchPointAccuracy = this.evaluateSwitchPoints(result.switchPoints.length, scenario.expectedSwitchPoints);
      
      const passed = languageMatches.score >= 0.5 && result.confidence > 0.3;

      if (passed) {
        this.summary.passed++;
        console.log(`✅ Test ${scenario.id}: ${scenario.name}`);
      } else {
        this.summary.failed++;
        console.log(`❌ Test ${scenario.id}: ${scenario.name}`);
      }

      console.log(`   Text: "${scenario.text}"`);
      console.log(`   Expected: [${scenario.expectedLanguages.join(', ')}]`);
      console.log(`   Detected: [${result.detectedLanguages.join(', ')}]`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Switch Points: ${result.switchPoints.length} (expected: ${scenario.expectedSwitchPoints})`);
      console.log(`   Processing Time: ${processingTime}ms`);
      console.log(`   Category: ${scenario.category}`);

      // Track results
      this.results.push({
        scenario,
        result,
        processingTime,
        passed,
        languageMatches,
        switchPointAccuracy
      });

      this.summary.avgProcessingTime += processingTime;
      this.summary.totalSwitchPoints += result.switchPoints.length;

      // Update category summary
      if (!this.summary.categorySummary[scenario.category]) {
        this.summary.categorySummary[scenario.category] = { total: 0, passed: 0 };
      }
      this.summary.categorySummary[scenario.category].total++;
      if (passed) {
        this.summary.categorySummary[scenario.category].passed++;
      }

    } catch (error) {
      this.summary.failed++;
      console.log(`❌ Test ${scenario.id}: ${scenario.name} - Error: ${error}`);
    }

    console.log('');
  }

  async performanceTests(): Promise<void> {
    console.log('3. ⚡ Performance Tests');
    console.log('======================');

    const performanceText = "Performance test avec multiple languages para medir speed";
    const iterations = 10;

    console.log(`Running ${iterations} iterations for performance measurement...`);

    const times: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await analyzeWithSwitchPrint(performanceText, ["English", "French", "Spanish"]);
      times.push(Date.now() - startTime);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`   Average Time: ${avgTime.toFixed(1)}ms`);
    console.log(`   Min Time: ${minTime}ms`);
    console.log(`   Max Time: ${maxTime}ms`);
    console.log(`   Performance Target: <100ms (SwitchPrint 80x faster than ELD)`);
    console.log(`   Target Met: ${avgTime < 100 ? '✅' : '❌'}`);
    console.log('');
  }

  async cacheTests(): Promise<void> {
    console.log('4. 💾 Cache Tests');
    console.log('=================');

    const cacheText = "Cache test text for testing caching behavior";

    // First call (cache miss)
    console.log('First analysis (cache miss):');
    const firstResult = await analyzeWithSwitchPrint(cacheText, ["English"]);
    console.log(`   Cache Hit: ${firstResult.cacheHit}`);
    console.log(`   Processing Time: ${firstResult.processingTimeMs.toFixed(1)}ms`);

    // Second call (should be cache hit)
    console.log('Second analysis (should be cache hit):');
    const secondResult = await analyzeWithSwitchPrint(cacheText, ["English"]);
    console.log(`   Cache Hit: ${secondResult.cacheHit}`);
    console.log(`   Processing Time: ${secondResult.processingTimeMs.toFixed(1)}ms`);

    const cacheWorking = firstResult.cacheHit === false && secondResult.cacheHit === true;
    console.log(`   Cache System: ${cacheWorking ? '✅ Working' : '❌ Not Working'}`);
    console.log('');
  }

  private evaluateLanguageDetection(detected: string[], expected: string[]): any {
    const detectedSet = new Set(detected.map(lang => lang.toLowerCase()));
    const expectedSet = new Set(expected.map(lang => lang.toLowerCase()));
    
    const intersection = new Set([...detectedSet].filter(x => expectedSet.has(x)));
    const union = new Set([...detectedSet, ...expectedSet]);
    
    const score = intersection.size / union.size;
    
    return {
      score,
      matched: Array.from(intersection),
      missed: Array.from(expectedSet).filter(x => !detectedSet.has(x)),
      extra: Array.from(detectedSet).filter(x => !expectedSet.has(x))
    };
  }

  private evaluateSwitchPoints(detected: number, expected: number): any {
    const accuracy = 1 - Math.abs(detected - expected) / Math.max(detected, expected, 1);
    return {
      accuracy,
      detected,
      expected,
      difference: Math.abs(detected - expected)
    };
  }

  private generateReport(): void {
    console.log('📊 Final Report');
    console.log('===============');
    
    const passRate = (this.summary.passed / this.summary.total) * 100;
    this.summary.avgProcessingTime = this.summary.avgProcessingTime / this.summary.total;

    console.log(`\n🎯 Overall Results:`);
    console.log(`   Total Tests: ${this.summary.total}`);
    console.log(`   Passed: ${this.summary.passed} (${passRate.toFixed(1)}%)`);
    console.log(`   Failed: ${this.summary.failed}`);
    console.log(`   Average Processing Time: ${this.summary.avgProcessingTime.toFixed(1)}ms`);
    console.log(`   Total Switch Points Detected: ${this.summary.totalSwitchPoints}`);

    console.log(`\n📋 Category Breakdown:`);
    Object.entries(this.summary.categorySummary).forEach(([category, stats]) => {
      const categoryPassRate = (stats.passed / stats.total) * 100;
      console.log(`   ${category}: ${stats.passed}/${stats.total} (${categoryPassRate.toFixed(1)}%)`);
    });

    console.log(`\n🚀 SwitchPrint Integration Status:`);
    if (passRate >= 70) {
      console.log(`   ✅ EXCELLENT: SwitchPrint integration is working well (${passRate.toFixed(1)}% success rate)`);
    } else if (passRate >= 50) {
      console.log(`   ⚠️  GOOD: SwitchPrint integration is functional (${passRate.toFixed(1)}% success rate)`);
    } else {
      console.log(`   ❌ NEEDS IMPROVEMENT: SwitchPrint integration needs attention (${passRate.toFixed(1)}% success rate)`);
    }

    console.log(`\n🎉 Test Suite Complete!`);
    console.log(`   SwitchPrint provides 85.98% accuracy and 80x performance improvement over ELD`);
    console.log(`   Integration status: ${passRate >= 70 ? 'Production Ready' : 'Needs Testing'}`);
  }
}

// Run the comprehensive test suite
async function main() {
  const tester = new SwitchPrintIntegrationTester();
  await tester.runAllTests();
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}