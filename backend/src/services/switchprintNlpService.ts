import axios from 'axios';
import { nlpCache } from './cacheService.js';

// SwitchPrint Bridge Service Configuration
const SWITCHPRINT_API_URL = process.env.SWITCHPRINT_API_URL || 'http://localhost:5001';
const SWITCHPRINT_TIMEOUT = parseInt(process.env.SWITCHPRINT_TIMEOUT || '30000');

// Enhanced interfaces for SwitchPrint analysis
interface Token {
  word: string;
  lang: string;
  language: string;
  confidence: number;
}

interface PhraseCluster {
  words: string[];
  text: string;
  language: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  isUserLanguage: boolean;
}

export interface SwitchPrintResult {
  tokens: Token[];
  phrases: PhraseCluster[];
  switchPoints: number[];
  confidence: number;
  userLanguageMatch: boolean;
  detectedLanguages: string[];
  processingTimeMs: number;
  cacheHit: boolean;
  
  // v2.1.2 breakthrough features
  calibratedConfidence: number;
  reliabilityScore: number;
  qualityAssessment: string;
  calibrationMethod: string;
  contextOptimization?: {
    textType: string;
    optimalWindowSize: number;
    improvementScore: number;
    contextEnhancedConfidence: number;
    optimizationApplied: boolean;
  };
  performanceMode: string;
  version: string;
}

// Raw response from SwitchPrint bridge service (snake_case)
interface SwitchPrintRawResponse {
  tokens: Token[];
  phrases: PhraseCluster[];
  switch_points: number[];
  confidence: number;
  user_language_match: boolean;
  detected_languages: string[];
  processing_time_ms: number;
  cache_hit: boolean;
  
  // v2.1.2 breakthrough features (snake_case from Python)
  calibrated_confidence: number;
  reliability_score: number;
  quality_assessment: string;
  calibration_method: string;
  context_optimization?: {
    text_type: string;
    optimal_window_size: number;
    improvement_score: number;
    context_enhanced_confidence: number;
    optimization_applied: boolean;
  };
  performance_mode: string;
  version: string;
}

interface SwitchPrintApiResponse {
  success: boolean;
  data?: SwitchPrintRawResponse;
  error?: string;
  version?: string;
  
  // v2.1.2 metadata in API response
  v2_1_2_metadata?: {
    version: string;
    features_used: {
      auto_calibration: boolean;
      context_optimization: boolean;
      reliability_scoring: boolean;
      quality_assessment: boolean;
    };
    performance_metrics: {
      calibration_improvement: string;
      context_enhancement: string;
      processing_mode: string;
    };
  };
}

/**
 * SwitchPrint NLP Service
 * Provides 85.98% accuracy and 80x faster performance than ELD
 */

// Language code normalization map
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'english': 'en', 'español': 'es', 'spanish': 'es', 'français': 'fr', 'french': 'fr',
  'deutsch': 'de', 'german': 'de', 'italiano': 'it', 'italian': 'it',
  'português': 'pt', 'portuguese': 'pt', 'русский': 'ru', 'russian': 'ru',
  'العربية': 'ar', 'arabic': 'ar', '中文': 'zh', 'chinese': 'zh', 'mandarin': 'zh',
  'हिंदी': 'hi', 'hindi': 'hi', '日本語': 'ja', 'japanese': 'ja', '한국어': 'ko', 'korean': 'ko',
  'اردو': 'ur', 'urdu': 'ur', 'urd': 'ur', 'romanized urdu': 'ur', 'roman urdu': 'ur',
  'türkçe': 'tr', 'turkish': 'tr', 'فارسی': 'fa', 'persian': 'fa', 'farsi': 'fa',
  'বাংলা': 'bn', 'bengali': 'bn', 'bangla': 'bn', 'پنجابی': 'pa', 'punjabi': 'pa',
  'मराठी': 'mr', 'marathi': 'mr', 'ગુજરાતી': 'gu', 'gujarati': 'gu',
  'தமிழ்': 'ta', 'tamil': 'ta', 'తెలుగు': 'te', 'telugu': 'te'
};

// Reverse mapping for CodeBoard compatibility
const SWITCHPRINT_TO_CODEBOARD_LANG: Record<string, string> = {
  'en': 'english', 'es': 'spanish', 'fr': 'french', 'de': 'german',
  'it': 'italian', 'pt': 'portuguese', 'ru': 'russian', 'ar': 'arabic',
  'zh': 'chinese', 'hi': 'hindi', 'ja': 'japanese', 'ko': 'korean',
  'ur': 'urdu', 'tr': 'turkish', 'fa': 'persian', 'bn': 'bengali'
};

/**
 * Normalize language names to SwitchPrint format
 */
const normalizeLanguageForSwitchPrint = (language: string): string => {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_CODE_MAP[normalized] || normalized;
};

/**
 * Convert SwitchPrint language codes to CodeBoard format
 */
const convertSwitchPrintToCodeBoard = (spLang: string): string => {
  return SWITCHPRINT_TO_CODEBOARD_LANG[spLang] || spLang;
};

/**
 * Check if SwitchPrint service is available
 */
export const checkSwitchPrintHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${SWITCHPRINT_API_URL}/health`, {
      timeout: 5000
    });
    return response.data?.status === 'healthy' && response.data?.switchprint_available === true;
  } catch (error) {
    console.warn('SwitchPrint service health check failed:', error);
    return false;
  }
};

/**
 * Enhanced text analysis using SwitchPrint v2.1.2 with breakthrough features
 */
export const analyzeWithSwitchPrint = async (
  text: string, 
  userLanguages: string[] = [],
  fastMode: boolean = false,
  performanceMode: 'fast' | 'balanced' | 'accurate' = 'balanced'
): Promise<SwitchPrintResult> => {
  
  if (!text || text.trim().length === 0) {
    return {
      tokens: [],
      phrases: [],
      switchPoints: [],
      confidence: 0,
      userLanguageMatch: false,
      detectedLanguages: [],
      processingTimeMs: 0,
      cacheHit: false,
      // v2.1.2 default values for empty text
      calibratedConfidence: 0,
      reliabilityScore: 0,
      qualityAssessment: 'empty_text',
      calibrationMethod: 'none',
      contextOptimization: undefined,
      performanceMode: performanceMode,
      version: '2.1.2'
    };
  }

  // Check local cache first (for performance optimization)
  const cacheKey = `v2.1.2:${text}:${userLanguages.join(',')}:${performanceMode}`;
  const cachedResult = nlpCache.get(text, userLanguages);
  if (cachedResult) {
    // Convert cached ELD result to SwitchPrint v2.1.2 format if needed
    if ('calibratedConfidence' in cachedResult) {
      return cachedResult as SwitchPrintResult;
    }
    // Convert legacy format to v2.1.2
    return convertLegacyToSwitchPrint(cachedResult, text, userLanguages, performanceMode);
  }

  try {
    // Normalize user languages for SwitchPrint
    const normalizedUserLangs = userLanguages.map(normalizeLanguageForSwitchPrint);

    // Call SwitchPrint v2.1.2 bridge service
    const response = await axios.post<SwitchPrintApiResponse>(
      `${SWITCHPRINT_API_URL}/analyze`,
      {
        text: text,
        user_languages: normalizedUserLangs,
        use_cache: true,
        fast_mode: fastMode,
        performance_mode: performanceMode  // v2.1.2 parameter
      },
      {
        timeout: SWITCHPRINT_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'SwitchPrint analysis failed');
    }

    const rawResult = response.data.data;

    // Convert from snake_case to camelCase and language codes to CodeBoard format
    const convertedResult: SwitchPrintResult = {
      tokens: (rawResult.tokens || []).map(token => ({
        ...token,
        lang: convertSwitchPrintToCodeBoard(token.lang || token.language || 'unknown'),
        language: convertSwitchPrintToCodeBoard(token.language || token.lang || 'unknown')
      })),
      phrases: (rawResult.phrases || []).map(phrase => ({
        ...phrase,
        language: convertSwitchPrintToCodeBoard(phrase.language || 'unknown')
      })),
      detectedLanguages: (rawResult.detected_languages || []).map(convertSwitchPrintToCodeBoard),
      switchPoints: rawResult.switch_points || [],
      confidence: rawResult.confidence || 0,
      userLanguageMatch: rawResult.user_language_match || false,
      processingTimeMs: rawResult.processing_time_ms || 0,
      cacheHit: rawResult.cache_hit || false,
      
      // v2.1.2 breakthrough features (convert snake_case to camelCase)
      calibratedConfidence: rawResult.calibrated_confidence || rawResult.confidence || 0,
      reliabilityScore: rawResult.reliability_score || 0,
      qualityAssessment: rawResult.quality_assessment || 'unknown',
      calibrationMethod: rawResult.calibration_method || 'none',
      contextOptimization: rawResult.context_optimization ? {
        textType: rawResult.context_optimization.text_type || 'unknown',
        optimalWindowSize: rawResult.context_optimization.optimal_window_size || 0,
        improvementScore: rawResult.context_optimization.improvement_score || 0,
        contextEnhancedConfidence: rawResult.context_optimization.context_enhanced_confidence || 0,
        optimizationApplied: rawResult.context_optimization.optimization_applied || false
      } : undefined,
      performanceMode: rawResult.performance_mode || performanceMode,
      version: rawResult.version || '2.1.2'
    };

    // Cache the result for future requests
    nlpCache.set(text, userLanguages, convertedResult);

    return convertedResult;

  } catch (error) {
    console.error('SwitchPrint analysis failed:', error);

    // Fallback to ELD-based analysis if SwitchPrint fails
    console.warn('Falling back to ELD-based analysis');
    return await fallbackToELD(text, userLanguages, performanceMode);
  }
};

/**
 * Fallback to ELD analysis when SwitchPrint is unavailable
 */
const fallbackToELD = async (text: string, userLanguages: string[], performanceMode: string = 'balanced'): Promise<SwitchPrintResult> => {
  try {
    // Import the existing enhanced NLP service
    const { analyzeWithUserGuidance } = await import('./enhancedNlpService.js');
    const eldResult = analyzeWithUserGuidance(text, userLanguages);

    // Convert ELD result to SwitchPrint v2.1.2 format
    return {
      tokens: eldResult.tokens,
      phrases: eldResult.phrases,
      switchPoints: eldResult.switchPoints,
      confidence: eldResult.confidence,
      userLanguageMatch: eldResult.userLanguageMatch,
      detectedLanguages: eldResult.detectedLanguages,
      processingTimeMs: 0, // ELD doesn't track processing time
      cacheHit: false,
      // v2.1.2 features - limited for ELD fallback
      calibratedConfidence: eldResult.confidence, // Same as original for ELD
      reliabilityScore: 0.5, // Default reliability for ELD
      qualityAssessment: 'eld_fallback',
      calibrationMethod: 'none',
      contextOptimization: undefined,
      performanceMode: 'fallback',
      version: 'eld_fallback'
    };
  } catch (error) {
    console.error('ELD fallback also failed:', error);
    
    // Return minimal mock result as last resort
    return createMockResult(text, userLanguages, performanceMode);
  }
};

/**
 * Convert legacy ELD result to SwitchPrint v2.1.2 format
 */
const convertLegacyToSwitchPrint = (
  legacyResult: any, 
  text: string, 
  userLanguages: string[],
  performanceMode: string = 'balanced'
): SwitchPrintResult => {
  return {
    tokens: legacyResult.tokens || [],
    phrases: legacyResult.phrases || [],
    switchPoints: legacyResult.switchPoints || [],
    confidence: legacyResult.confidence || 0,
    userLanguageMatch: legacyResult.userLanguageMatch || false,
    detectedLanguages: legacyResult.detectedLanguages || [],
    processingTimeMs: 0,
    cacheHit: true,
    // v2.1.2 features - legacy compatibility
    calibratedConfidence: legacyResult.confidence || 0,
    reliabilityScore: 0.5, // Default for legacy
    qualityAssessment: 'legacy_cache',
    calibrationMethod: 'none',
    contextOptimization: undefined,
    performanceMode: 'cached',
    version: 'legacy'
  };
};

/**
 * Create mock result for error cases
 */
const createMockResult = (text: string, userLanguages: string[], performanceMode: string = 'balanced'): SwitchPrintResult => {
  const words = text.split(/\s+/).filter(word => word.trim().length > 0);
  const mockLang = userLanguages.length > 0 ? userLanguages[0] : 'english';
  
  const tokens = words.map(word => ({
    word: word,
    lang: mockLang,
    language: mockLang,
    confidence: 0.5
  }));

  const phrases = [{
    words: words,
    text: text,
    language: mockLang,
    confidence: 0.5,
    startIndex: 0,
    endIndex: words.length - 1,
    isUserLanguage: userLanguages.includes(mockLang)
  }];

  return {
    tokens,
    phrases,
    switchPoints: [],
    confidence: 0.5,
    userLanguageMatch: userLanguages.length > 0,
    detectedLanguages: [mockLang],
    processingTimeMs: 0,
    cacheHit: false,
    // v2.1.2 features - mock values
    calibratedConfidence: 0.5,
    reliabilityScore: 0.3, // Low reliability for mock
    qualityAssessment: 'mock_result',
    calibrationMethod: 'none',
    contextOptimization: undefined,
    performanceMode: performanceMode,
    version: 'mock'
  };
};

/**
 * Backward compatibility function for existing codebase
 */
export const analyzeSentence = async (text: string): Promise<{
  tokens: Token[];
  switchPoints: number[];
  confidence: number;
}> => {
  const result = await analyzeWithSwitchPrint(text, []);
  return {
    tokens: result.tokens,
    switchPoints: result.switchPoints,
    confidence: result.confidence
  };
};

/**
 * Enhanced analysis for multiple sentences with SwitchPrint v2.1.2
 */
export const analyzeTextWithSwitchPrint = async (
  text: string, 
  userLanguages: string[] = [],
  performanceMode: 'fast' | 'balanced' | 'accurate' = 'balanced'
): Promise<SwitchPrintResult> => {
  
  // Split into sentences first
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 1) {
    return await analyzeWithSwitchPrint(text, userLanguages, false, performanceMode);
  }
  
  // For multiple sentences, analyze the full text at once
  // SwitchPrint v2.1.2 can handle longer texts better than ELD
  return await analyzeWithSwitchPrint(text, userLanguages, false, performanceMode);
};

/**
 * Get SwitchPrint service statistics
 */
export const getSwitchPrintStats = async (): Promise<any> => {
  try {
    const response = await axios.get(`${SWITCHPRINT_API_URL}/cache/stats`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get SwitchPrint stats:', error);
    return {
      total_requests: 0,
      cache_hits: 0,
      cache_size: 0,
      hit_rate: 0,
      available: false
    };
  }
};

/**
 * Clear SwitchPrint cache
 */
export const clearSwitchPrintCache = async (): Promise<boolean> => {
  try {
    const response = await axios.post(`${SWITCHPRINT_API_URL}/cache/clear`, {}, {
      timeout: 5000
    });
    return response.data.success;
  } catch (error) {
    console.error('Failed to clear SwitchPrint cache:', error);
    return false;
  }
};

/**
 * Get enhanced detection statistics with SwitchPrint v2.1.2 metadata
 */
export const getSwitchPrintDetectionStats = (result: SwitchPrintResult) => {
  const languageCounts: Record<string, number> = {};
  const confidenceSum: Record<string, number> = {};
  const phraseCounts: Record<string, number> = {};
  
  // Token-level statistics
  result.tokens.forEach(token => {
    languageCounts[token.lang] = (languageCounts[token.lang] || 0) + 1;
    confidenceSum[token.lang] = (confidenceSum[token.lang] || 0) + token.confidence;
  });
  
  // Phrase-level statistics
  result.phrases.forEach(phrase => {
    phraseCounts[phrase.language] = (phraseCounts[phrase.language] || 0) + 1;
  });
  
  const tokenStats = Object.keys(languageCounts).map(lang => ({
    language: lang,
    tokenCount: languageCounts[lang],
    phraseCount: phraseCounts[lang] || 0,
    averageConfidence: confidenceSum[lang] / languageCounts[lang],
    percentage: (languageCounts[lang] / result.tokens.length) * 100
  }));
  
  return {
    totalTokens: result.tokens.length,
    totalPhrases: result.phrases.length,
    totalSwitchPoints: result.switchPoints.length,
    overallConfidence: result.confidence,
    userLanguageMatch: result.userLanguageMatch,
    detectedLanguages: result.detectedLanguages,
    languageBreakdown: tokenStats.sort((a, b) => b.tokenCount - a.tokenCount),
    averageWordsPerPhrase: result.tokens.length / Math.max(result.phrases.length, 1),
    processingTimeMs: result.processingTimeMs,
    cacheHit: result.cacheHit,
    performanceGain: result.processingTimeMs > 0 ? 'SwitchPrint (80x faster)' : 'ELD fallback',
    
    // v2.1.2 enhanced statistics
    v2_1_2_features: {
      calibratedConfidence: result.calibratedConfidence,
      reliabilityScore: result.reliabilityScore,
      qualityAssessment: result.qualityAssessment,
      calibrationMethod: result.calibrationMethod,
      confidenceImprovement: result.calibratedConfidence - result.confidence,
      contextOptimization: result.contextOptimization,
      performanceMode: result.performanceMode,
      version: result.version,
      hasContextOptimization: result.contextOptimization !== undefined,
      hasCalibration: result.calibrationMethod !== 'none',
      isV2_1_2: result.version === '2.1.2'
    }
  };
};