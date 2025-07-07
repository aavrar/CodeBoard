'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface LiveAnalysisToken {
  word: string
  lang: string
  language: string
  confidence: number
}

export interface LiveAnalysisPhrase {
  words: string[]
  text: string
  language: string
  confidence: number
  startIndex: number
  endIndex: number
  isUserLanguage: boolean
}

export interface LiveAnalysisResult {
  tokens: LiveAnalysisToken[]
  phrases: LiveAnalysisPhrase[]
  switchPoints: number[]
  confidence: number
  userLanguageMatch: boolean
  detectedLanguages: string[]
}

export interface LiveAnalysisResponse {
  text: string
  userLanguages: string[]
  analysis: LiveAnalysisResult
  processing: {
    timeMs: number
    tokensPerSecond: number
    timestamp: string
  }
  breakdown?: {
    totalTokens: number
    totalPhrases: number
    switchPointsDetected: number
    languagesDetected: string[]
    unknownTokenRate: number
    averageConfidence: number
    userLanguageMatch: boolean
  }
}

export interface UseLiveAnalysisOptions {
  debounceMs?: number
  includeConfidence?: boolean
  includeDetails?: boolean
  onAnalysisComplete?: (result: LiveAnalysisResponse) => void
  onError?: (error: string) => void
}

export function useLiveAnalysis(options: UseLiveAnalysisOptions = {}) {
  const {
    debounceMs = 300,
    includeConfidence = true,
    includeDetails = true,
    onAnalysisComplete,
    onError
  } = options

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<LiveAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<LiveAnalysisResponse[]>([])

  const debounceRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()

  const analyzeText = useCallback(async (text: string, languages: string[]) => {
    // Clear any existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Don't analyze empty text or if no languages selected
    if (!text.trim() || languages.length === 0) {
      setResult(null)
      setError(null)
      return
    }

    // Debounce the analysis
    debounceRef.current = setTimeout(async () => {
      try {
        setIsAnalyzing(true)
        setError(null)

        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController()

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        const response = await fetch(`${API_BASE_URL}/live-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            languages,
            includeConfidence,
            includeDetails
          }),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setResult(data.data)
          setAnalysisHistory(prev => [data.data, ...prev.slice(0, 9)]) // Keep last 10
          onAnalysisComplete?.(data.data)
        } else {
          throw new Error(data.error || 'Analysis failed')
        }

      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsAnalyzing(false)
      }
    }, debounceMs)
  }, [debounceMs, includeConfidence, includeDetails, onAnalysisComplete, onError])

  const clearAnalysis = useCallback(() => {
    setResult(null)
    setError(null)
    setAnalysisHistory([])
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    analyzeText,
    clearAnalysis,
    isAnalyzing,
    result,
    error,
    analysisHistory,
    hasResult: result !== null,
    hasError: error !== null
  }
}