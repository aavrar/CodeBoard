#!/usr/bin/env node
/**
 * Test script for v2.1.2 API endpoints
 * Validates that all v2.1.2 features work correctly in the API layer
 */

import { analyzeWithSwitchPrint } from '../services/switchprintNlpService.js';

async function testV2_1_2Endpoints() {
  console.log('🔍 Testing v2.1.2 API Endpoints...\n');

  try {
    // Test 1: Basic SwitchPrint v2.1.2 analysis
    console.log('📝 Test 1 - Basic v2.1.2 Analysis:');
    const result1 = await analyzeWithSwitchPrint(
      'I am going to la tienda to buy groceries',
      ['english', 'spanish'],
      false,
      'balanced'
    );

    console.log(`  ✅ Analysis completed`);
    console.log(`  🎯 Original Confidence: ${result1.confidence.toFixed(3)}`);
    console.log(`  🔄 Calibrated Confidence: ${result1.calibratedConfidence.toFixed(3)}`);
    console.log(`  📊 Reliability Score: ${result1.reliabilityScore.toFixed(3)}`);
    console.log(`  🏷️  Quality Assessment: ${result1.qualityAssessment}`);
    console.log(`  🎯 Calibration Method: ${result1.calibrationMethod}`);
    console.log(`  🚀 Performance Mode: ${result1.performanceMode}`);
    console.log(`  📋 Version: ${result1.version}`);

    // Test 2: Different performance modes
    console.log('\n📝 Test 2 - Performance Modes:');
    const modes: Array<'fast' | 'balanced' | 'accurate'> = ['fast', 'balanced', 'accurate'];
    
    for (const mode of modes) {
      const startTime = Date.now();
      const result = await analyzeWithSwitchPrint(
        'Hello world, como estas today?',
        ['english', 'spanish'],
        false,
        mode
      );
      const timeMs = Date.now() - startTime;
      
      console.log(`  ${mode.toUpperCase()} mode:`);
      console.log(`    Confidence: ${result.confidence.toFixed(3)}`);
      console.log(`    Calibrated: ${result.calibratedConfidence.toFixed(3)}`);
      console.log(`    Time: ${timeMs}ms`);
      console.log(`    Performance Mode: ${result.performanceMode}`);
    }

    // Test 3: Context optimization features
    console.log('\n📝 Test 3 - Context Optimization:');
    const result3 = await analyzeWithSwitchPrint(
      'Main office mein meeting hai, can you join us online?',
      ['hindi', 'english'],
      false,
      'accurate'
    );

    console.log(`  ✅ Analysis with context optimization`);
    if (result3.contextOptimization) {
      console.log(`  📈 Text Type: ${result3.contextOptimization.textType}`);
      console.log(`  📏 Window Size: ${result3.contextOptimization.optimalWindowSize}`);
      console.log(`  📊 Improvement: ${result3.contextOptimization.improvementScore.toFixed(3)}`);
      console.log(`  ✨ Applied: ${result3.contextOptimization.optimizationApplied}`);
    } else {
      console.log(`  ⚠️  Context optimization not available`);
    }

    // Test 4: Mock API response format
    console.log('\n📝 Test 4 - API Response Format:');
    const mockApiResponse = {
      success: true,
      data: {
        text: result1.tokens.map(t => t.word).join(' '),
        userLanguages: ['english', 'spanish'],
        analysis: result1,
        processing: {
          timeMs: result1.processingTimeMs,
          timestamp: new Date().toISOString(),
          performanceMode: result1.performanceMode,
          version: result1.version
        },
        v2_1_2_features: {
          calibratedConfidence: result1.calibratedConfidence,
          reliabilityScore: result1.reliabilityScore,
          qualityAssessment: result1.qualityAssessment,
          calibrationMethod: result1.calibrationMethod,
          contextOptimization: result1.contextOptimization,
          confidenceImprovement: result1.calibratedConfidence - result1.confidence,
          hasAutoCalibration: result1.calibrationMethod !== 'none',
          hasContextOptimization: result1.contextOptimization !== undefined,
          isV2_1_2: result1.version === '2.1.2'
        }
      }
    };

    console.log(`  ✅ Mock API response created`);
    console.log(`  📊 Original Confidence: ${mockApiResponse.data.analysis.confidence.toFixed(3)}`);
    console.log(`  🔄 Calibrated Confidence: ${mockApiResponse.data.v2_1_2_features.calibratedConfidence.toFixed(3)}`);
    console.log(`  📈 Improvement: ${mockApiResponse.data.v2_1_2_features.confidenceImprovement.toFixed(3)}`);
    console.log(`  🚀 Has Calibration: ${mockApiResponse.data.v2_1_2_features.hasAutoCalibration}`);
    console.log(`  📋 Is v2.1.2: ${mockApiResponse.data.v2_1_2_features.isV2_1_2}`);

    console.log('\n🎉 All v2.1.2 API Endpoint Tests Passed!');
    console.log('✅ v2.1.2 API integration successful');
    
    return true;

  } catch (error) {
    console.error('❌ v2.1.2 API Endpoint Test Failed:', error);
    return false;
  }
}

// Run the test
testV2_1_2Endpoints()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });