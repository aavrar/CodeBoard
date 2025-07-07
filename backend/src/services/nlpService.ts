import { eld } from 'eld';

interface Token {
  word: string;
  lang: string;
  confidence: number;
}

interface NlpAnalysisResult {
  tokens: Token[];
  switchPoints: number[];
  confidence: number;
}

interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

/**
 * Enhanced NLP service using ELD (Efficient Language Detector)
 * Provides better accuracy for code-switching detection
 */

// Minimum confidence threshold for language detection
const MIN_CONFIDENCE_THRESHOLD = 0.6;

// Fallback language mapping for common function words
const FUNCTION_WORD_MAPPING: Record<string, string> = {
  'the': 'en', 'and': 'en', 'or': 'en', 'but': 'en', 'is': 'en', 'are': 'en', 'was': 'en', 'were': 'en',
  'a': 'en', 'an': 'en', 'to': 'en', 'for': 'en', 'of': 'en', 'in': 'en', 'on': 'en', 'at': 'en',
  'el': 'es', 'la': 'es', 'los': 'es', 'las': 'es', 'y': 'es', 'o': 'es', 'pero': 'es', 'es': 'es',
  'le': 'fr', 'les': 'fr', 'et': 'fr', 'ou': 'fr', 'mais': 'fr', 'est': 'fr',
  'der': 'de', 'die': 'de', 'das': 'de', 'und': 'de', 'oder': 'de', 'aber': 'de', 'ist': 'de'
};

/**
 * Detect language using ELD with confidence scoring
 */
const detectLanguageWithELD = (text: string): LanguageDetectionResult => {
  try {
    const result = eld.detect(text);
    
    if (result && result.language) {
      // ELD returns accuracy as confidence
      const confidence = result.accuracy || 0;
      return {
        language: result.language,
        confidence: confidence
      };
    }
  } catch (error) {
    console.warn(`ELD detection failed for text: "${text}"`, error);
  }
  
  return { language: 'unknown', confidence: 0 };
};

/**
 * Fallback detection for short words and function words
 */
const detectWithFallback = (word: string): LanguageDetectionResult => {
  const normalizedWord = word.toLowerCase().replace(/[^\w]/g, '');
  
  // Check function word mapping first
  if (FUNCTION_WORD_MAPPING[normalizedWord]) {
    return {
      language: FUNCTION_WORD_MAPPING[normalizedWord],
      confidence: 0.8 // High confidence for known function words
    };
  }
  
  // Try ELD detection
  const eldResult = detectLanguageWithELD(word);
  
  // If confidence is too low, try with more context if available
  if (eldResult.confidence < MIN_CONFIDENCE_THRESHOLD) {
    return { language: 'unknown', confidence: 0 };
  }
  
  return eldResult;
};

/**
 * Advanced text segmentation - splits on sentence boundaries and word boundaries
 */
const segmentText = (text: string): string[] => {
  // First, split into sentences using multiple delimiters
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Then split each sentence into words
  const words: string[] = [];
  sentences.forEach(sentence => {
    const sentenceWords = sentence.split(/\s+/).filter(word => word.trim().length > 0);
    words.push(...sentenceWords);
  });
  
  return words;
};

/**
 * Calculate overall confidence based on individual token confidences
 */
const calculateOverallConfidence = (tokens: Token[]): number => {
  if (tokens.length === 0) return 0;
  
  const totalConfidence = tokens.reduce((sum, token) => sum + token.confidence, 0);
  return totalConfidence / tokens.length;
};

/**
 * Improved switch point detection with confidence-based filtering
 */
const detectSwitchPoints = (tokens: Token[]): number[] => {
  const switchPoints: number[] = [];
  let previousLang: string | null = null;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Only consider high-confidence detections for switch points
    if (token.confidence >= MIN_CONFIDENCE_THRESHOLD && token.lang !== 'unknown') {
      if (previousLang !== null && token.lang !== previousLang) {
        switchPoints.push(i);
      }
      previousLang = token.lang;
    }
  }
  
  return switchPoints;
};

/**
 * Enhanced sentence analysis with improved language detection
 */
export const analyzeSentence = (text: string): NlpAnalysisResult => {
  if (!text || text.trim().length === 0) {
    return { tokens: [], switchPoints: [], confidence: 0 };
  }
  
  // Segment text into words using advanced segmentation
  const words = segmentText(text);
  const tokens: Token[] = [];
  
  if (words.length === 0) {
    return { tokens: [], switchPoints: [], confidence: 0 };
  }
  
  // Analyze each word
  for (const word of words) {
    const cleanWord = word.trim();
    if (cleanWord.length === 0) continue;
    
    let detectionResult: LanguageDetectionResult;
    
    // For very short words (1-2 characters), use fallback immediately
    if (cleanWord.length <= 2) {
      detectionResult = detectWithFallback(cleanWord);
    } else {
      // For longer words, try ELD first, then fallback
      const eldResult = detectLanguageWithELD(cleanWord);
      
      if (eldResult.confidence >= MIN_CONFIDENCE_THRESHOLD) {
        detectionResult = eldResult;
      } else {
        detectionResult = detectWithFallback(cleanWord);
      }
    }
    
    tokens.push({
      word: cleanWord,
      lang: detectionResult.language,
      confidence: detectionResult.confidence
    });
  }
  
  // Detect switch points with confidence filtering
  const switchPoints = detectSwitchPoints(tokens);
  
  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence(tokens);
  
  return {
    tokens,
    switchPoints,
    confidence: overallConfidence
  };
};

/**
 * Analyze multiple sentences or longer text passages
 */
export const analyzeText = (text: string): NlpAnalysisResult => {
  // Split into sentences first
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 1) {
    return analyzeSentence(text);
  }
  
  // Analyze each sentence and combine results
  let allTokens: Token[] = [];
  let allSwitchPoints: number[] = [];
  let totalConfidence = 0;
  
  sentences.forEach((sentence) => {
    const result = analyzeSentence(sentence.trim());
    
    // Adjust switch point indices for combined text
    const adjustedSwitchPoints = result.switchPoints.map(
      point => point + allTokens.length
    );
    
    allTokens = allTokens.concat(result.tokens);
    allSwitchPoints = allSwitchPoints.concat(adjustedSwitchPoints);
    totalConfidence += result.confidence;
  });
  
  return {
    tokens: allTokens,
    switchPoints: allSwitchPoints,
    confidence: totalConfidence / sentences.length
  };
};

/**
 * Get language detection statistics for debugging
 */
export const getDetectionStats = (result: NlpAnalysisResult) => {
  const languageCounts: Record<string, number> = {};
  const confidenceSum: Record<string, number> = {};
  
  result.tokens.forEach(token => {
    languageCounts[token.lang] = (languageCounts[token.lang] || 0) + 1;
    confidenceSum[token.lang] = (confidenceSum[token.lang] || 0) + token.confidence;
  });
  
  const stats = Object.keys(languageCounts).map(lang => ({
    language: lang,
    count: languageCounts[lang],
    averageConfidence: confidenceSum[lang] / languageCounts[lang],
    percentage: (languageCounts[lang] / result.tokens.length) * 100
  }));
  
  return {
    totalTokens: result.tokens.length,
    totalSwitchPoints: result.switchPoints.length,
    overallConfidence: result.confidence,
    languageBreakdown: stats.sort((a, b) => b.count - a.count)
  };
};