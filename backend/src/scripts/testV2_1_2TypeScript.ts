#!/usr/bin/env node
/**
 * Test script for SwitchPrint v2.1.2 TypeScript interfaces
 * Validates that all v2.1.2 types compile correctly
 */

import { 
  analyzeWithSwitchPrint, 
  SwitchPrintResult,
  getSwitchPrintDetectionStats,
  analyzeTextWithSwitchPrint
} from '../services/switchprintNlpService.js';

async function testV2_1_2TypeScript() {
  console.log('🔍 Testing SwitchPrint v2.1.2 TypeScript Interfaces...\n');

  try {
    // Test 1: Basic analysis with v2.1.2 features
    const result1: SwitchPrintResult = await analyzeWithSwitchPrint(
      'I am going to la tienda', 
      ['english', 'spanish'], 
      false, 
      'balanced'
    );

    console.log('✅ Test 1 - Basic Analysis:');
    console.log(`  Confidence: ${result1.confidence}`);
    console.log(`  Calibrated Confidence: ${result1.calibratedConfidence}`);
    console.log(`  Reliability Score: ${result1.reliabilityScore}`);
    console.log(`  Quality Assessment: ${result1.qualityAssessment}`);
    console.log(`  Calibration Method: ${result1.calibrationMethod}`);
    console.log(`  Performance Mode: ${result1.performanceMode}`);
    console.log(`  Version: ${result1.version}`);
    
    if (result1.contextOptimization) {
      console.log('  Context Optimization:');
      console.log(`    Text Type: ${result1.contextOptimization.textType}`);
      console.log(`    Window Size: ${result1.contextOptimization.optimalWindowSize}`);
      console.log(`    Improvement: ${result1.contextOptimization.improvementScore}`);
    }

    // Test 2: Multi-sentence analysis
    const result2: SwitchPrintResult = await analyzeTextWithSwitchPrint(
      'Hello world. Hola mundo. Como estas?',
      ['english', 'spanish'],
      'accurate'
    );

    console.log('\n✅ Test 2 - Multi-sentence Analysis:');
    console.log(`  Switch Points: ${result2.switchPoints.length}`);
    console.log(`  Languages: ${result2.detectedLanguages.join(', ')}`);
    console.log(`  Performance Mode: ${result2.performanceMode}`);

    // Test 3: Enhanced statistics
    const stats = getSwitchPrintDetectionStats(result1);
    
    console.log('\n✅ Test 3 - Enhanced Statistics:');
    console.log(`  Total Tokens: ${stats.totalTokens}`);
    console.log(`  Overall Confidence: ${stats.overallConfidence}`);
    console.log(`  Performance Gain: ${stats.performanceGain}`);
    
    // v2.1.2 specific stats
    const v2Stats = stats.v2_1_2_features;
    console.log('  v2.1.2 Features:');
    console.log(`    Calibrated Confidence: ${v2Stats.calibratedConfidence}`);
    console.log(`    Reliability Score: ${v2Stats.reliabilityScore}`);
    console.log(`    Quality Assessment: ${v2Stats.qualityAssessment}`);
    console.log(`    Has Calibration: ${v2Stats.hasCalibration}`);
    console.log(`    Has Context Optimization: ${v2Stats.hasContextOptimization}`);
    console.log(`    Is v2.1.2: ${v2Stats.isV2_1_2}`);
    console.log(`    Confidence Improvement: ${v2Stats.confidenceImprovement}`);

    console.log('\n🎉 All TypeScript Interface Tests Passed!');
    console.log('✅ v2.1.2 TypeScript integration successful');
    
    return true;

  } catch (error) {
    console.error('❌ TypeScript Interface Test Failed:', error);
    return false;
  }
}

// Run the test
testV2_1_2TypeScript()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });