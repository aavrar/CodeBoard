'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Edit3, Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import type { LiveAnalysisResponse, LiveAnalysisToken } from '@/hooks/use-live-analysis'

interface CorrectedToken extends LiveAnalysisToken {
  originalLanguage: string
  isModified: boolean
}

interface SwitchPointEditorProps {
  analysisResult: LiveAnalysisResponse
  onSaveCorrections?: (corrections: CorrectionData) => void
  onCancel?: () => void
}

interface CorrectionData {
  originalText: string
  originalLanguages: string[]
  correctedSwitchPoints: number[]
  correctedLanguages: Array<{
    startIndex: number
    endIndex: number
    language: string
    confidence: number
  }>
  userFeedback: string
  correctionType: 'switch_points' | 'language_assignment' | 'both'
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fa', name: 'Persian' },
  { code: 'tr', name: 'Turkish' }
]

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

export function SwitchPointEditor({ analysisResult, onSaveCorrections, onCancel }: SwitchPointEditorProps) {
  const [tokens, setTokens] = useState<CorrectedToken[]>(() =>
    analysisResult.analysis.tokens.map(token => ({
      ...token,
      originalLanguage: token.lang,
      isModified: false
    }))
  )
  
  const [switchPoints, setSwitchPoints] = useState<number[]>(analysisResult.analysis.switchPoints)
  const [userFeedback, setUserFeedback] = useState('')
  const [isModified, setIsModified] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateTokenLanguage = useCallback((tokenIndex: number, newLanguage: string) => {
    setTokens(prev => prev.map((token, index) => {
      if (index === tokenIndex) {
        const isModified = newLanguage !== token.originalLanguage
        setIsModified(true)
        return {
          ...token,
          lang: newLanguage,
          language: newLanguage,
          isModified
        }
      }
      return token
    }))
    
    // Recalculate switch points based on new language assignments
    recalculateSwitchPoints(tokens, tokenIndex, newLanguage)
  }, [tokens])

  const recalculateSwitchPoints = useCallback((currentTokens: CorrectedToken[], changedIndex: number, newLanguage: string) => {
    const updatedTokens = [...currentTokens]
    if (updatedTokens[changedIndex]) {
      updatedTokens[changedIndex] = { ...updatedTokens[changedIndex], lang: newLanguage }
    }

    const newSwitchPoints: number[] = []
    let previousLang: string | null = null

    for (let i = 0; i < updatedTokens.length; i++) {
      const token = updatedTokens[i]
      if (token.lang !== 'unknown' && previousLang !== null && token.lang !== previousLang) {
        newSwitchPoints.push(i)
      }
      if (token.lang !== 'unknown') {
        previousLang = token.lang
      }
    }

    setSwitchPoints(newSwitchPoints)
  }, [])

  const toggleSwitchPoint = useCallback((tokenIndex: number) => {
    setSwitchPoints(prev => {
      const newSwitchPoints = prev.includes(tokenIndex)
        ? prev.filter(sp => sp !== tokenIndex)
        : [...prev, tokenIndex].sort((a, b) => a - b)
      
      setIsModified(true)
      return newSwitchPoints
    })
  }, [])

  const resetToOriginal = useCallback(() => {
    setTokens(analysisResult.analysis.tokens.map(token => ({
      ...token,
      originalLanguage: token.lang,
      isModified: false
    })))
    setSwitchPoints(analysisResult.analysis.switchPoints)
    setUserFeedback('')
    setIsModified(false)
  }, [analysisResult])

  const handleSave = useCallback(async () => {
    if (!onSaveCorrections) return

    setIsSaving(true)
    
    try {
      // Determine correction type
      const hasLanguageChanges = tokens.some(token => token.isModified)
      const hasSwitchPointChanges = JSON.stringify(switchPoints) !== JSON.stringify(analysisResult.analysis.switchPoints)
      
      let correctionType: 'switch_points' | 'language_assignment' | 'both'
      if (hasLanguageChanges && hasSwitchPointChanges) {
        correctionType = 'both'
      } else if (hasLanguageChanges) {
        correctionType = 'language_assignment'
      } else {
        correctionType = 'switch_points'
      }

      // Create corrected languages array
      const correctedLanguages = []
      let currentGroup = { startIndex: 0, language: tokens[0]?.lang || 'unknown', tokens: [tokens[0]] }
      
      for (let i = 1; i < tokens.length; i++) {
        if (tokens[i].lang === currentGroup.language) {
          currentGroup.tokens.push(tokens[i])
        } else {
          // Finalize current group
          correctedLanguages.push({
            startIndex: currentGroup.startIndex,
            endIndex: currentGroup.startIndex + currentGroup.tokens.length - 1,
            language: currentGroup.language,
            confidence: currentGroup.tokens.reduce((sum, t) => sum + t.confidence, 0) / currentGroup.tokens.length
          })
          
          // Start new group
          currentGroup = {
            startIndex: i,
            language: tokens[i].lang,
            tokens: [tokens[i]]
          }
        }
      }
      
      // Add final group
      if (currentGroup.tokens.length > 0) {
        correctedLanguages.push({
          startIndex: currentGroup.startIndex,
          endIndex: currentGroup.startIndex + currentGroup.tokens.length - 1,
          language: currentGroup.language,
          confidence: currentGroup.tokens.reduce((sum, t) => sum + t.confidence, 0) / currentGroup.tokens.length
        })
      }

      const corrections: CorrectionData = {
        originalText: analysisResult.text,
        originalLanguages: analysisResult.userLanguages,
        correctedSwitchPoints: switchPoints,
        correctedLanguages,
        userFeedback,
        correctionType
      }

      await onSaveCorrections(corrections)
      setIsModified(false)
    } catch (error) {
      console.error('Failed to save corrections:', error)
    } finally {
      setIsSaving(false)
    }
  }, [tokens, switchPoints, userFeedback, analysisResult, onSaveCorrections])

  const getLanguageName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
    return lang ? lang.name : code.toUpperCase()
  }

  const hasChanges = isModified || tokens.some(token => token.isModified)

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Edit Language Detection
          {hasChanges && (
            <Badge variant="secondary" className="ml-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              Modified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <Alert>
          <AlertDescription>
            Click on words to change their language assignment, or click between words to add/remove switch points.
            Your corrections help improve the system for everyone!
          </AlertDescription>
        </Alert>

        {/* Interactive Text Editor */}
        <div>
          <h4 className="text-sm font-medium mb-3">Click to Edit Language Assignment</h4>
          <div className="p-4 bg-gray-50 rounded-lg border min-h-20">
            <div className="flex flex-wrap gap-1">
              {tokens.map((token, index) => {
                const colorClass = LANGUAGE_COLORS[token.lang] || LANGUAGE_COLORS.unknown
                const isSwitchPoint = switchPoints.includes(index)
                const isNextSwitchPoint = switchPoints.includes(index + 1)
                
                return (
                  <React.Fragment key={index}>
                    {/* Switch point toggle button */}
                    {index > 0 && (
                      <button
                        onClick={() => toggleSwitchPoint(index)}
                        className={`mx-1 w-3 h-6 rounded border-2 transition-colors ${
                          isSwitchPoint
                            ? 'bg-yellow-400 border-yellow-500 hover:bg-yellow-500'
                            : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                        }`}
                        title={isSwitchPoint ? 'Remove switch point' : 'Add switch point'}
                      />
                    )}
                    
                    {/* Token */}
                    <div className="relative group">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium border cursor-pointer transition-all ${colorClass} ${
                          token.isModified ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                        } hover:opacity-75`}
                        title={`${token.lang.toUpperCase()}: ${Math.round(token.confidence * 100)}% confidence${
                          token.isModified ? ' (Modified)' : ''
                        }`}
                      >
                        {token.word}
                        {token.isModified && <span className="ml-1 text-blue-600">*</span>}
                      </div>
                      
                      {/* Language selector dropdown - appears on hover */}
                      <div className="absolute top-full left-0 mt-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Select
                          value={token.lang}
                          onValueChange={(value) => updateTokenLanguage(index, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_LANGUAGES.map(lang => (
                              <SelectItem key={lang.code} value={lang.code} className="text-xs">
                                {lang.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="unknown" className="text-xs">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="text-muted-foreground">Legend:</span>
            <Badge className="bg-yellow-400 text-yellow-800">Switch Point</Badge>
            <Badge className="bg-blue-100 text-blue-800 ring-2 ring-blue-400 ring-opacity-50">Modified</Badge>
            <Badge className="bg-gray-100 text-gray-600">Click to edit</Badge>
          </div>
        </div>

        {/* Summary of Changes */}
        {hasChanges && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Summary of Changes</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Switch points: {switchPoints.length} (originally {analysisResult.analysis.switchPoints.length})</div>
              <div>Modified tokens: {tokens.filter(t => t.isModified).length}</div>
              <div>Languages detected: {[...new Set(tokens.map(t => t.lang))].filter(l => l !== 'unknown').length}</div>
            </div>
          </div>
        )}

        {/* User Feedback */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Feedback (Optional)
          </label>
          <Textarea
            value={userFeedback}
            onChange={(e) => setUserFeedback(e.target.value)}
            placeholder="Tell us about any issues you noticed or suggestions for improvement..."
            className="min-h-16"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {userFeedback.length}/500 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={resetToOriginal}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Corrections
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}