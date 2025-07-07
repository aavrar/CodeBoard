'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Zap, Languages, Clock, TrendingUp } from 'lucide-react'
import { useLiveAnalysis, type LiveAnalysisResponse } from '@/hooks/use-live-analysis'

interface LanguageOption {
  code: string
  name: string
  nativeName: string
  romanized: boolean
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', romanized: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', romanized: false },
  { code: 'fr', name: 'French', nativeName: 'Français', romanized: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', romanized: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', romanized: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', romanized: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', romanized: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', romanized: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', romanized: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', romanized: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', romanized: true }
]

// Language colors for visual highlighting
const LANGUAGE_COLORS: Record<string, string> = {
  'en': 'bg-blue-100 text-blue-800 border-blue-200',
  'es': 'bg-green-100 text-green-800 border-green-200',
  'fr': 'bg-purple-100 text-purple-800 border-purple-200',
  'de': 'bg-orange-100 text-orange-800 border-orange-200',
  'pt': 'bg-pink-100 text-pink-800 border-pink-200',
  'it': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'ur': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'hi': 'bg-red-100 text-red-800 border-red-200',
  'ar': 'bg-teal-100 text-teal-800 border-teal-200',
  'fa': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'tr': 'bg-lime-100 text-lime-800 border-lime-200',
  'unknown': 'bg-gray-100 text-gray-600 border-gray-200'
}

interface LiveAnalyzerProps {
  onAnalysisComplete?: (result: LiveAnalysisResponse) => void
  initialText?: string
  initialLanguages?: string[]
}

export function LiveAnalyzer({ onAnalysisComplete, initialText = '', initialLanguages = [] }: LiveAnalyzerProps) {
  const [text, setText] = useState(initialText)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages)
  const [showDetails, setShowDetails] = useState(true)

  // Update state when props change (for modal re-opening with new data)
  useEffect(() => {
    setText(initialText)
  }, [initialText])

  useEffect(() => {
    setSelectedLanguages(initialLanguages)
  }, [initialLanguages])

  const { analyzeText, isAnalyzing, result, error, clearAnalysis } = useLiveAnalysis({
    debounceMs: 300,
    includeDetails: true,
    onAnalysisComplete
  })

  // Trigger analysis when text or languages change
  useEffect(() => {
    analyzeText(text, selectedLanguages)
  }, [text, selectedLanguages, analyzeText])

  const handleLanguageAdd = (languageCode: string) => {
    if (!selectedLanguages.includes(languageCode) && selectedLanguages.length < 5) {
      setSelectedLanguages([...selectedLanguages, languageCode])
    }
  }

  const handleLanguageRemove = (languageCode: string) => {
    setSelectedLanguages(selectedLanguages.filter(lang => lang !== languageCode))
  }

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
    return lang ? `${lang.name} (${lang.nativeName})` : code.toUpperCase()
  }

  const renderHighlightedText = () => {
    if (!result || !result.analysis.tokens.length) return null

    return (
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap gap-1">
          {result.analysis.tokens.map((token, index) => {
            const colorClass = LANGUAGE_COLORS[token.lang] || LANGUAGE_COLORS.unknown
            const isSwitchPoint = result.analysis.switchPoints.includes(index)
            
            return (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium border ${colorClass} ${
                  isSwitchPoint ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                }`}
                title={`${token.lang.toUpperCase()}: ${Math.round(token.confidence * 100)}% confidence${
                  isSwitchPoint ? ' (Switch Point)' : ''
                }`}
              >
                {token.word}
                {isSwitchPoint && <span className="ml-1 text-yellow-600">•</span>}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  const renderAnalysisStats = () => {
    if (!result || !result.breakdown) return null

    const stats = result.breakdown
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalTokens}</div>
          <div className="text-sm text-blue-600">Tokens</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.switchPointsDetected}</div>
          <div className="text-sm text-green-600">Switch Points</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{Math.round(stats.averageConfidence * 100)}%</div>
          <div className="text-sm text-purple-600">Confidence</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{(result.processing.tokensPerSecond || 0).toLocaleString()}</div>
          <div className="text-sm text-orange-600">Tokens/sec</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-Time Language Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Languages (up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedLanguages.map(langCode => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode)
                return (
                  <Badge
                    key={langCode}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {lang?.name}
                    {lang?.romanized && <span className="text-xs">(R)</span>}
                    <button
                      onClick={() => handleLanguageRemove(langCode)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )
              })}
            </div>
            <Select onValueChange={handleLanguageAdd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add a language..." />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES
                  .filter(lang => !selectedLanguages.includes(lang.code))
                  .map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                      {lang.romanized && <span className="ml-2 text-xs text-muted-foreground">Romanized</span>}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Enter your multilingual text</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your code-switching text here... e.g., 'I am going to la tienda with my dost'"
              className="min-h-24"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
              <span>{text.length}/1000 characters</span>
              {isAnalyzing && (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              size="sm"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setText('')
                setSelectedLanguages([])
                clearAnalysis()
              }}
              size="sm"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Analysis Results
              <Badge variant={result.analysis.userLanguageMatch ? "default" : "secondary"}>
                {result.analysis.userLanguageMatch ? "User Languages Matched" : "Additional Languages Detected"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Highlighted Text */}
            <div>
              <h4 className="text-sm font-medium mb-2">Language Detection</h4>
              {renderHighlightedText()}
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="text-xs text-muted-foreground">Legend:</div>
                {result.analysis.detectedLanguages.map(lang => (
                  <Badge
                    key={lang}
                    className={`text-xs ${LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.unknown}`}
                    variant="outline"
                  >
                    {getLanguageName(lang)}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                  • Switch Point
                </Badge>
              </div>
            </div>

            {/* Statistics */}
            {showDetails && renderAnalysisStats()}

            {/* Processing Info */}
            {showDetails && (
              <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Processed in {result.processing.timeMs}ms
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {(result.processing.tokensPerSecond || 0).toLocaleString()} tokens/sec
                  </div>
                  <div>
                    Unknown rate: {Math.round((result.breakdown?.unknownTokenRate || 0) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}