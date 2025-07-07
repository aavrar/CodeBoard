import { eld } from 'eld';
import { nlpCache } from './cacheService.js';

// Enhanced interfaces for user-guided analysis
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

interface UserGuidedAnalysis {
  userLanguages: string[];
  phraseAnalysis: PhraseCluster[];
  confidenceThreshold: number;
  contextWindow: number;
}

export interface EnhancedNlpResult {
  tokens: Token[];
  phrases: PhraseCluster[];
  switchPoints: number[];
  confidence: number;
  userLanguageMatch: boolean;
  detectedLanguages: string[];
}

interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

/**
 * Enhanced NLP service using User-Guided Language Detection
 * Combines human linguistic knowledge with AI pattern recognition
 */

// Dynamic confidence thresholds
const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;
const USER_LANGUAGE_CONFIDENCE_THRESHOLD = 0.4; // Lower threshold for user-specified languages
const ROMANIZED_CONFIDENCE_THRESHOLD = 0.3; // Even lower for romanized scripts
const NON_LATIN_CONFIDENCE_THRESHOLD = 0.5; // Adjusted for non-Latin scripts

// Adaptive context window settings
const CONTEXT_WINDOWS = {
  VERY_SHORT: { minLength: 1, maxLength: 1, textThreshold: 5 },    // ≤5 words
  SHORT: { minLength: 2, maxLength: 3, textThreshold: 15 },        // 6-15 words  
  MEDIUM: { minLength: 2, maxLength: 4, textThreshold: 30 },       // 16-30 words
  LONG: { minLength: 3, maxLength: 5, textThreshold: Infinity }    // 31+ words
};

// Script-specific confidence adjustments
const SCRIPT_CONFIDENCE_MULTIPLIERS: Record<string, number> = {
  'ur': 1.2,  // Boost Urdu confidence
  'hi': 1.1,  // Boost Hindi confidence  
  'ar': 1.1,  // Boost Arabic confidence
  'fa': 1.1,  // Boost Persian confidence
  'tr': 1.05, // Slight boost for Turkish
  'en': 1.0,  // Baseline for English
  'es': 1.0,  // Baseline for Spanish
  'fr': 1.0,  // Baseline for French
  'de': 1.0   // Baseline for German
};

// Enhanced function word mapping with language codes
const FUNCTION_WORD_MAPPING: Record<string, string> = {
  // English
  'the': 'en', 'and': 'en', 'or': 'en', 'but': 'en', 'is': 'en', 'are': 'en', 'was': 'en', 'were': 'en',
  'a': 'en', 'an': 'en', 'to': 'en', 'for': 'en', 'of': 'en', 'in': 'en', 'on': 'en', 'at': 'en',
  'i': 'en', 'you': 'en', 'he': 'en', 'she': 'en', 'it': 'en', 'we': 'en', 'they': 'en',
  'this': 'en', 'that': 'en', 'these': 'en', 'those': 'en', 'my': 'en', 'your': 'en', 'his': 'en', 'her': 'en',
  
  // Spanish
  'el': 'es', 'la': 'es', 'los': 'es', 'las': 'es', 'y': 'es', 'pero': 'es', 'es': 'es',
  'una': 'es', 'del': 'es', 'con': 'es', 'por': 'es', 'para': 'es',
  'yo': 'es', 'tú': 'es', 'él': 'es', 'ella': 'es', 'nosotros': 'es', 'ellos': 'es', 'ellas': 'es',
  
  // French  
  'le': 'fr', 'les': 'fr', 'et': 'fr', 'ou': 'fr', 'mais': 'fr', 'est': 'fr', 'sont': 'fr',
  'un': 'fr', 'une': 'fr', 'du': 'fr', 'des': 'fr', 'dans': 'fr', 'avec': 'fr',
  'je': 'fr', 'tu': 'fr', 'il': 'fr', 'elle': 'fr', 'nous': 'fr', 'vous': 'fr', 'ils': 'fr', 'elles': 'fr',
  
  // German
  'der': 'de', 'die': 'de', 'das': 'de', 'und': 'de', 'oder': 'de', 'aber': 'de', 'ist': 'de', 'sind': 'de',
  'ein': 'de', 'eine': 'de', 'dem': 'de', 'den': 'de', 'mit': 'de', 'für': 'de', 'von': 'de', 'zu': 'de',
  'ich': 'de', 'er': 'de', 'wir': 'de', 'ihr': 'de', 'du': 'de',
  
  // Urdu (romanized/transliterated)
  'main': 'ur', 'mein': 'ur', 'aap': 'ur', 'tum': 'ur', 'woh': 'ur', 'yeh': 'ur', 'hai': 'ur', 'hain': 'ur',
  'ka': 'ur', 'ki': 'ur', 'ke': 'ur', 'ko': 'ur', 'se': 'ur', 'par': 'ur', 'tak': 'ur',
  'aur': 'ur', 'ya': 'ur', 'lekin': 'ur', 'agar': 'ur', 'kyun': 'ur', 'kya': 'ur', 'kaise': 'ur', 'kahan': 'ur',
  'hum': 'ur', 'tumhara': 'ur', 'mera': 'ur', 'uska': 'ur', 'iska': 'ur', 'apna': 'ur', 'sab': 'ur', 'kuch': 'ur',
  'nahi': 'ur', 'nahin': 'ur', 'haan': 'ur', 'theek': 'ur', 'accha': 'ur', 'burra': 'ur', 'bara': 'ur', 'chota': 'ur',
  
  // Hindi (romanized/transliterated) 
  'mai': 'hi', 'mujhe': 'hi', 'tumhe': 'hi', 'usse': 'hi', 'isse': 'hi', 'humein': 'hi', 'unhe': 'hi', 'inhe': 'hi',
  'kab': 'hi', 'kaun': 'hi', 'kitna': 'hi', 'kitni': 'hi',
  'bhi': 'hi', 'sirf': 'hi', 'bas': 'hi', 'abhi': 'hi', 'phir': 'hi', 'tab': 'hi', 'jab': 'hi', 'kal': 'hi',
  
  // Arabic (romanized/transliterated)
  'ana': 'ar', 'anta': 'ar', 'anti': 'ar', 'huwa': 'ar', 'hiya': 'ar', 'nahnu': 'ar', 'antum': 'ar',
  'fi': 'ar', 'min': 'ar', 'ila': 'ar', 'ala': 'ar', 'an': 'ar', 'ma': 'ar', 'la': 'ar', 'wa': 'ar',
  'hatha': 'ar', 'hadhihi': 'ar', 'tilka': 'ar', 'dhalika': 'ar', 'kayf': 'ar', 'mata': 'ar', 'ayna': 'ar', 'madha': 'ar',
  
  // Portuguese
  'os': 'pt', 'as': 'pt', 'um': 'pt', 'uma': 'pt', 'do': 'pt', 'da': 'pt',
  'em': 'pt', 'no': 'pt', 'na': 'pt', 'com': 'pt', 'sem': 'pt', 'sobre': 'pt',
  'ele': 'pt', 'ela': 'pt', 'nós': 'pt', 'vós': 'pt', 'eles': 'pt', 'elas': 'pt',
  'este': 'pt', 'esta': 'pt', 'esse': 'pt', 'essa': 'pt', 'aquele': 'pt', 'aquela': 'pt', 'meu': 'pt', 'minha': 'pt',
  
  // Italian
  'il': 'it', 'lo': 'it', 'gli': 'it', 'uno': 'it',
  'di': 'it', 'del': 'it', 'della': 'it', 'nel': 'it', 'nella': 'it',
  'lui': 'it', 'lei': 'it', 'noi': 'it', 'voi': 'it', 'loro': 'it', 'questo': 'it', 'quella': 'it'
};

// Language code normalization
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

// Romanization patterns for detecting languages written in Latin script
const ROMANIZATION_PATTERNS: Record<string, RegExp[]> = {
  'ur': [
    /\b(main|mein|aap|tum|woh|yeh|hai|hain|ka|ki|ke|ko|se|aur|lekin|agar|kya|kaise|kahan|nahi|nahin|haan|theek|accha)\b/gi,
    /\b(allah|inshallah|mashallah|bismillah|alhamdulillah|subhanallah)\b/gi,
    /\b(salam|walaikum|khuda|hafiz|shukria|meherbani|ghar|shaher|dost)\b/gi
  ],
  'hi': [
    /\b(mai|mujhe|tumhe|usse|isse|humein|unhe|inhe|bhi|sirf|bas|abhi|phir|tab|jab|kal)\b/gi,
    /\b(namaste|dhanyawad|kripaya|samay|desh|ghar|paani|khana|accha|bura)\b/gi,
    /\b(raj|singh|kumar|sharma|gupta|verma|agarwal|jain)\b/gi
  ],
  'ar': [
    /\b(ana|anta|anti|huwa|hiya|nahnu|antum|hum|fi|min|ila|ala|wa|la|ma)\b/gi,
    /\b(allah|bismillah|inshallah|mashallah|alhamdulillah|subhanallah|wallahi)\b/gi,
    /\b(salam|ahlan|marhaba|shukran|afwan|yalla|habibi|akhi|ukhti)\b/gi
  ],
  'fa': [
    /\b(man|to|oo|ma|shoma|anha|dar|az|ba|be|va|ya|agar|ke|chi|koja|chera)\b/gi,
    /\b(salam|khoda|hafez|merci|lotfan|bebakhshid|doost|khane|ab|nan)\b/gi
  ],
  'tr': [
    /\b(ben|sen|o|biz|siz|onlar|bu|şu|o|bir|ve|veya|ama|için|ile|den|dan)\b/gi,
    /\b(merhaba|selam|teşekkür|lütfen|özür|ev|su|ekmek|iyi|kötü)\b/gi
  ]
};

/**
 * Detect romanized language patterns
 */
const detectRomanizedLanguage = (text: string): { language: string; confidence: number } | null => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount === 0) return null;
  
  for (const [langCode, patterns] of Object.entries(ROMANIZATION_PATTERNS)) {
    let matches = 0;
    
    for (const pattern of patterns) {
      const patternMatches = text.match(pattern);
      if (patternMatches) {
        matches += patternMatches.length;
      }
    }
    
    // Calculate confidence based on match ratio
    const confidence = Math.min(matches / wordCount, 1.0);
    
    // Require at least 20% match for romanized languages
    if (confidence >= 0.2) {
      return { language: langCode, confidence: confidence * 0.8 }; // Slightly lower confidence for romanized
    }
  }
  
  return null;
};

/**
 * Normalize language names to ISO codes
 */
const normalizeLanguageCode = (language: string): string => {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_CODE_MAP[normalized] || normalized.slice(0, 2);
};

/**
 * Advanced text segmentation with phrase awareness
 */
const segmentIntoWords = (text: string): string[] => {
  return text
    .split(/\s+/)
    .filter(word => word.trim().length > 0)
    .map(word => word.trim());
};

/**
 * Detect language using ELD with enhanced error handling
 */
const detectLanguageWithELD = (text: string): LanguageDetectionResult => {
  try {
    const result = eld.detect(text);
    
    if (result && result.language) {
      return {
        language: normalizeLanguageCode(result.language),
        confidence: result.accuracy || 0
      };
    }
  } catch (error) {
    console.warn(`ELD detection failed for text: "${text}"`, error);
  }
  
  return { language: 'unknown', confidence: 0 };
};

/**
 * Get adaptive context window based on text length
 */
const getContextWindow = (totalWords: number) => {
  if (totalWords <= CONTEXT_WINDOWS.VERY_SHORT.textThreshold) {
    return CONTEXT_WINDOWS.VERY_SHORT;
  } else if (totalWords <= CONTEXT_WINDOWS.SHORT.textThreshold) {
    return CONTEXT_WINDOWS.SHORT;
  } else if (totalWords <= CONTEXT_WINDOWS.MEDIUM.textThreshold) {
    return CONTEXT_WINDOWS.MEDIUM;
  } else {
    return CONTEXT_WINDOWS.LONG;
  }
};

/**
 * Apply script-specific confidence adjustments
 */
const adjustConfidenceForScript = (language: string, confidence: number): number => {
  const multiplier = SCRIPT_CONFIDENCE_MULTIPLIERS[language] || 1.0;
  return Math.min(confidence * multiplier, 1.0);
};

/**
 * Enhanced fallback detection with user language awareness and romanization support
 */
const detectWithEnhancedFallback = (
  text: string, 
  userLanguages: string[] = [],
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD
): LanguageDetectionResult => {
  
  const words = text.toLowerCase().split(/\s+/);
  
  // Check function word mapping first
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (FUNCTION_WORD_MAPPING[cleanWord]) {
      const functionLang = FUNCTION_WORD_MAPPING[cleanWord];
      const isUserLang = userLanguages.some(ul => normalizeLanguageCode(ul) === functionLang);
      
      // Apply script-specific confidence adjustment
      let confidence = isUserLang ? 0.9 : 0.8;
      confidence = adjustConfidenceForScript(functionLang, confidence);
      
      return {
        language: functionLang,
        confidence: confidence
      };
    }
  }
  
  // Check for romanized language patterns
  const romanizedResult = detectRomanizedLanguage(text);
  if (romanizedResult) {
    const isUserLang = userLanguages.some(ul => 
      normalizeLanguageCode(ul) === romanizedResult.language
    );
    
    if (isUserLang || romanizedResult.confidence >= ROMANIZED_CONFIDENCE_THRESHOLD) {
      let confidence = isUserLang ? 
        Math.max(romanizedResult.confidence, USER_LANGUAGE_CONFIDENCE_THRESHOLD) : 
        romanizedResult.confidence;
      
      confidence = adjustConfidenceForScript(romanizedResult.language, confidence);
      
      return {
        language: romanizedResult.language,
        confidence: confidence
      };
    }
  }
  
  // Try ELD detection
  const eldResult = detectLanguageWithELD(text);
  
  // Boost confidence for user-specified languages
  if (eldResult.language !== 'unknown') {
    const isUserLanguage = userLanguages.some(ul => 
      normalizeLanguageCode(ul) === eldResult.language
    );
    
    if (isUserLanguage) {
      eldResult.confidence = Math.max(eldResult.confidence, USER_LANGUAGE_CONFIDENCE_THRESHOLD);
    }
    
    // Apply script-specific confidence adjustment
    eldResult.confidence = adjustConfidenceForScript(eldResult.language, eldResult.confidence);
  }
  
  // Apply confidence threshold
  if (eldResult.confidence >= confidenceThreshold) {
    return eldResult;
  }
  
  return { language: 'unknown', confidence: 0 };
};

/**
 * Create phrase clusters using adaptive sliding window approach
 */
const createPhraseClusters = (
  words: string[], 
  userLanguages: string[] = [],
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD
): PhraseCluster[] => {
  
  const clusters: PhraseCluster[] = [];
  let currentCluster: string[] = [];
  let currentLanguage = 'unknown';
  let currentConfidence = 0;
  let startIndex = 0;
  
  // Get adaptive context window based on text length
  const contextWindow = getContextWindow(words.length);
  const maxClusterSize = contextWindow.maxLength;
  const minWindowSize = contextWindow.minLength;
  const maxWindowSize = Math.min(contextWindow.maxLength, 3); // Cap at 3 for performance
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Try different context windows based on text length
    let bestDetection = { language: 'unknown', confidence: 0 };
    
    for (let windowSize = minWindowSize; windowSize <= Math.min(maxWindowSize, words.length - i); windowSize++) {
      const windowText = words.slice(i, i + windowSize).join(' ');
      const detection = detectWithEnhancedFallback(windowText, userLanguages, confidenceThreshold);
      
      if (detection.confidence > bestDetection.confidence) {
        bestDetection = detection;
      }
    }
    
    // If language changes or we have enough words, finalize current cluster
    if (bestDetection.language !== currentLanguage || currentCluster.length >= maxClusterSize) {
      if (currentCluster.length > 0) {
        const isUserLang = userLanguages.some(ul => 
          normalizeLanguageCode(ul) === currentLanguage
        );
        
        clusters.push({
          words: [...currentCluster],
          text: currentCluster.join(' '),
          language: currentLanguage,
          confidence: currentConfidence,
          startIndex: startIndex,
          endIndex: startIndex + currentCluster.length - 1,
          isUserLanguage: isUserLang
        });
      }
      
      // Start new cluster
      currentCluster = [word];
      currentLanguage = bestDetection.language;
      currentConfidence = bestDetection.confidence;
      startIndex = i;
    } else {
      // Add to current cluster
      currentCluster.push(word);
      // Update confidence (weighted average, giving more weight to recent detections)
      currentConfidence = (currentConfidence * 0.7) + (bestDetection.confidence * 0.3);
    }
  }
  
  // Finalize last cluster
  if (currentCluster.length > 0) {
    const isUserLang = userLanguages.some(ul => 
      normalizeLanguageCode(ul) === currentLanguage
    );
    
    clusters.push({
      words: [...currentCluster],
      text: currentCluster.join(' '),
      language: currentLanguage,
      confidence: currentConfidence,
      startIndex: startIndex,
      endIndex: startIndex + currentCluster.length - 1,
      isUserLanguage: isUserLang
    });
  }
  
  return clusters;
};

/**
 * Detect switch points between phrase clusters
 */
const detectPhraseSwitchPoints = (clusters: PhraseCluster[]): number[] => {
  const switchPoints: number[] = [];
  
  for (let i = 1; i < clusters.length; i++) {
    const prevCluster = clusters[i - 1];
    const currentCluster = clusters[i];
    
    // Switch detected if languages are different and both have sufficient confidence
    if (prevCluster.language !== currentCluster.language &&
        prevCluster.language !== 'unknown' &&
        currentCluster.language !== 'unknown' &&
        (prevCluster.confidence >= USER_LANGUAGE_CONFIDENCE_THRESHOLD || 
         currentCluster.confidence >= USER_LANGUAGE_CONFIDENCE_THRESHOLD)) {
      
      switchPoints.push(currentCluster.startIndex);
    }
  }
  
  return switchPoints;
};

/**
 * Convert phrase clusters to token format for compatibility
 */
const clustersToTokens = (clusters: PhraseCluster[]): Token[] => {
  const tokens: Token[] = [];
  
  clusters.forEach(cluster => {
    cluster.words.forEach(word => {
      tokens.push({
        word: word,
        lang: cluster.language,
        language: cluster.language,
        confidence: cluster.confidence
      });
    });
  });
  
  return tokens;
};

/**
 * Enhanced sentence analysis with user-guided approach
 */
export const analyzeWithUserGuidance = (
  text: string, 
  userLanguages: string[] = []
): EnhancedNlpResult => {
  
  if (!text || text.trim().length === 0) {
    return {
      tokens: [],
      phrases: [],
      switchPoints: [],
      confidence: 0,
      userLanguageMatch: false,
      detectedLanguages: []
    };
  }
  
  // Check cache first (for performance optimization)
  const cachedResult = nlpCache.get(text, userLanguages);
  if (cachedResult) {
    return cachedResult;
  }
  
  // Normalize user languages
  const normalizedUserLangs = userLanguages.map(normalizeLanguageCode);
  
  // Determine confidence threshold based on user input
  const confidenceThreshold = normalizedUserLangs.length > 0 ? 
    USER_LANGUAGE_CONFIDENCE_THRESHOLD : DEFAULT_CONFIDENCE_THRESHOLD;
  
  // Segment text into words
  const words = segmentIntoWords(text);
  
  if (words.length === 0) {
    return {
      tokens: [],
      phrases: [],
      switchPoints: [],
      confidence: 0,
      userLanguageMatch: false,
      detectedLanguages: []
    };
  }
  
  // Create phrase clusters
  const clusters = createPhraseClusters(words, normalizedUserLangs, confidenceThreshold);
  
  // Detect switch points
  const switchPoints = detectPhraseSwitchPoints(clusters);
  
  // Convert to tokens for compatibility
  const tokens = clustersToTokens(clusters);
  
  // Calculate overall confidence
  const totalConfidence = clusters.reduce((sum, cluster) => sum + cluster.confidence, 0);
  const overallConfidence = clusters.length > 0 ? totalConfidence / clusters.length : 0;
  
  // Get detected languages
  const detectedLanguages = [...new Set(
    clusters
      .filter(c => c.language !== 'unknown')
      .map(c => c.language)
  )];
  
  // Check if detected languages match user input
  const userLanguageMatch = normalizedUserLangs.length > 0 && 
    normalizedUserLangs.every(ul => detectedLanguages.includes(ul));
  
  // Create result object
  const result: EnhancedNlpResult = {
    tokens,
    phrases: clusters,
    switchPoints,
    confidence: overallConfidence,
    userLanguageMatch,
    detectedLanguages
  };
  
  // Cache the result for future requests (performance optimization)
  nlpCache.set(text, userLanguages, result);
  
  return result;
};

/**
 * Backward compatibility function
 */
export const analyzeSentence = (text: string): {
  tokens: Token[];
  switchPoints: number[];
  confidence: number;
} => {
  const result = analyzeWithUserGuidance(text, []);
  return {
    tokens: result.tokens,
    switchPoints: result.switchPoints,
    confidence: result.confidence
  };
};

/**
 * Enhanced analysis for multiple sentences with user guidance
 */
export const analyzeTextWithUserGuidance = (
  text: string, 
  userLanguages: string[] = []
): EnhancedNlpResult => {
  
  // Split into sentences first
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 1) {
    return analyzeWithUserGuidance(text, userLanguages);
  }
  
  // Analyze each sentence and combine results
  let allTokens: Token[] = [];
  let allPhrases: PhraseCluster[] = [];
  let allSwitchPoints: number[] = [];
  let totalConfidence = 0;
  let allDetectedLanguages: string[] = [];
  let userLanguageMatches = 0;
  
  sentences.forEach((sentence) => {
    const result = analyzeWithUserGuidance(sentence.trim(), userLanguages);
    
    // Adjust indices for combined text
    const adjustedSwitchPoints = result.switchPoints.map(
      point => point + allTokens.length
    );
    
    const adjustedPhrases = result.phrases.map(phrase => ({
      ...phrase,
      startIndex: phrase.startIndex + allTokens.length,
      endIndex: phrase.endIndex + allTokens.length
    }));
    
    allTokens = allTokens.concat(result.tokens);
    allPhrases = allPhrases.concat(adjustedPhrases);
    allSwitchPoints = allSwitchPoints.concat(adjustedSwitchPoints);
    totalConfidence += result.confidence;
    allDetectedLanguages = allDetectedLanguages.concat(result.detectedLanguages);
    
    if (result.userLanguageMatch) {
      userLanguageMatches++;
    }
  });
  
  // Remove duplicate languages
  const uniqueDetectedLanguages = [...new Set(allDetectedLanguages)];
  
  return {
    tokens: allTokens,
    phrases: allPhrases,
    switchPoints: allSwitchPoints,
    confidence: totalConfidence / sentences.length,
    userLanguageMatch: userLanguageMatches > 0,
    detectedLanguages: uniqueDetectedLanguages
  };
};

/**
 * Get enhanced detection statistics for debugging and analysis
 */
export const getEnhancedDetectionStats = (result: EnhancedNlpResult) => {
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
    averageWordsPerPhrase: result.tokens.length / Math.max(result.phrases.length, 1)
  };
};