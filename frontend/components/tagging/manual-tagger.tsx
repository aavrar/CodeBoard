"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, 
  Undo, 
  Redo, 
  RefreshCw, 
  Target, 
  Languages, 
  Eye,
  EyeOff,
  Info 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useLanguages } from '@/hooks/use-reference-data'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SwitchPoint {
  position: number
  fromLanguage: string
  toLanguage: string
  confidence: number
  userAdded?: boolean
}

interface TaggedSegment {
  text: string
  language: string
  startIndex: number
  endIndex: number
  confidence: number
  userTagged?: boolean
}

interface ManualTaggerProps {
  text: string
  initialLanguages?: string[]
  initialSwitchPoints?: number[]
  onSave?: (data: {
    switchPoints: SwitchPoint[]
    segments: TaggedSegment[]
    notes?: string
  }) => void
  disabled?: boolean
  showPreview?: boolean
}

export function ManualTagger({
  text,
  initialLanguages = [],
  initialSwitchPoints = [],
  onSave,
  disabled = false,
  showPreview = true
}: ManualTaggerProps) {
  const { toast } = useToast()
  const { languageOptions, loading: languagesLoading } = useLanguages()
  
  // State management
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages)
  const [switchPoints, setSwitchPoints] = useState<SwitchPoint[]>([])
  const [segments, setSegments] = useState<TaggedSegment[]>([])
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<{ switchPoints: SwitchPoint[], segments: TaggedSegment[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showVisualization, setShowVisualization] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)

  // Initialize from props
  React.useEffect(() => {
    if (text && selectedLanguages.length >= 2) {
      initializeSwitchPoints()
    }
  }, [text, selectedLanguages])

  const initializeSwitchPoints = useCallback(() => {
    if (initialSwitchPoints.length > 0) {
      const points: SwitchPoint[] = initialSwitchPoints.map((pos, index) => ({
        position: pos,
        fromLanguage: selectedLanguages[0] || 'Unknown',
        toLanguage: selectedLanguages[1] || 'Unknown',
        confidence: 0.8,
        userAdded: false
      }))
      setSwitchPoints(points)
      generateSegments(points)
    } else {
      // Auto-detect potential switch points based on common patterns
      autoDetectSwitchPoints()
    }
  }, [initialSwitchPoints, selectedLanguages, text])

  const autoDetectSwitchPoints = useCallback(() => {
    if (!text || selectedLanguages.length < 2) return

    const words = text.split(/\s+/)
    const potentialPoints: SwitchPoint[] = []
    let currentPos = 0

    // Simple heuristic: look for capitalization changes, punctuation, common transition words
    words.forEach((word, index) => {
      const wordStart = text.indexOf(word, currentPos)
      
      // Check for potential switch indicators
      const isCapitalized = /^[A-Z]/.test(word)
      const hasPunctuation = /[.,!?;:]/.test(word)
      const isTransitionWord = /^(and|but|so|then|or|porque|pero|y|o)$/i.test(word)
      
      if (index > 0 && (isCapitalized || isTransitionWord)) {
        potentialPoints.push({
          position: wordStart,
          fromLanguage: selectedLanguages[0],
          toLanguage: selectedLanguages[1],
          confidence: 0.6,
          userAdded: false
        })
      }
      
      currentPos = wordStart + word.length
    })

    setSwitchPoints(potentialPoints)
    generateSegments(potentialPoints)
    
    if (potentialPoints.length > 0) {
      toast({
        title: "Auto-detection complete",
        description: `Found ${potentialPoints.length} potential switch points. Click to refine.`,
      })
    }
  }, [text, selectedLanguages, toast])

  const generateSegments = useCallback((points: SwitchPoint[]) => {
    if (!text) return

    const sortedPoints = [...points].sort((a, b) => a.position - b.position)
    const newSegments: TaggedSegment[] = []
    
    let currentPos = 0
    let currentLanguage = selectedLanguages[0] || 'Unknown'

    sortedPoints.forEach((point, index) => {
      if (point.position > currentPos) {
        // Add segment before switch point
        newSegments.push({
          text: text.substring(currentPos, point.position).trim(),
          language: currentLanguage,
          startIndex: currentPos,
          endIndex: point.position,
          confidence: point.confidence,
          userTagged: point.userAdded
        })
      }
      
      currentLanguage = point.toLanguage
      currentPos = point.position
    })

    // Add final segment
    if (currentPos < text.length) {
      newSegments.push({
        text: text.substring(currentPos).trim(),
        language: currentLanguage,
        startIndex: currentPos,
        endIndex: text.length,
        confidence: 0.8,
        userTagged: false
      })
    }

    // Filter out empty segments
    const validSegments = newSegments.filter(seg => seg.text.length > 0)
    setSegments(validSegments)
  }, [text, selectedLanguages])

  const addSwitchPoint = useCallback((position: number) => {
    if (disabled) return

    const newPoint: SwitchPoint = {
      position,
      fromLanguage: selectedLanguages[0] || 'Unknown',
      toLanguage: selectedLanguages[1] || 'Unknown',
      confidence: 1.0,
      userAdded: true
    }

    const newSwitchPoints = [...switchPoints, newPoint]
    setSwitchPoints(newSwitchPoints)
    generateSegments(newSwitchPoints)
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { switchPoints, segments }])
    setHistoryIndex(prev => prev + 1)

    toast({
      title: "Switch point added",
      description: "Click on the segment to change its language.",
    })
  }, [disabled, selectedLanguages, switchPoints, segments, historyIndex])

  const removeSwitchPoint = useCallback((pointIndex: number) => {
    if (disabled) return

    const newSwitchPoints = switchPoints.filter((_, index) => index !== pointIndex)
    setSwitchPoints(newSwitchPoints)
    generateSegments(newSwitchPoints)
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { switchPoints, segments }])
    setHistoryIndex(prev => prev + 1)
  }, [disabled, switchPoints, segments, historyIndex])

  const updateSegmentLanguage = useCallback((segmentIndex: number, newLanguage: string) => {
    if (disabled) return

    const newSegments = [...segments]
    newSegments[segmentIndex] = {
      ...newSegments[segmentIndex],
      language: newLanguage,
      userTagged: true,
      confidence: 1.0
    }
    setSegments(newSegments)
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { switchPoints, segments }])
    setHistoryIndex(prev => prev + 1)
  }, [disabled, segments, switchPoints, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setSwitchPoints(previousState.switchPoints)
      setSegments(previousState.segments)
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setSwitchPoints(nextState.switchPoints)
      setSegments(nextState.segments)
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        switchPoints,
        segments,
        notes: notes.trim() || undefined
      })
      
      toast({
        title: "Tags saved successfully",
        description: "Your manual tagging has been saved.",
      })
    }
  }, [onSave, switchPoints, segments, notes, toast])

  const resetTagging = useCallback(() => {
    setSwitchPoints([])
    setSegments([])
    setNotes('')
    setHistory([])
    setHistoryIndex(-1)
    setSelectedSegment(null)
    autoDetectSwitchPoints()
  }, [autoDetectSwitchPoints])

  // Render clickable text with switch point indicators
  const renderInteractiveText = useMemo(() => {
    if (!text) return null

    const chars = text.split('')
    return (
      <div className="relative p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[120px]">
        <div className="text-sm text-gray-600 mb-2">
          Click between words to add switch points
        </div>
        <div className="text-lg leading-relaxed cursor-text select-none">
          {chars.map((char, index) => {
            const isSwitchPoint = switchPoints.some(point => point.position === index)
            const isWordBoundary = char === ' ' && index > 0 && index < chars.length - 1
            
            return (
              <span key={index} className="relative">
                {char}
                {isWordBoundary && (
                  <button
                    onClick={() => addSwitchPoint(index + 1)}
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10"
                    title="Add switch point here"
                  />
                )}
                {isSwitchPoint && (
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-red-500 rounded-full z-10" />
                )}
              </span>
            )
          })}
        </div>
      </div>
    )
  }, [text, switchPoints, addSwitchPoint])

  // Render segmented view
  const renderSegmentedView = useMemo(() => {
    if (!showVisualization || segments.length === 0) return null

    const getLanguageColor = (language: string, index: number) => {
      const colors = [
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-green-100 text-green-800 border-green-200',
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-orange-100 text-orange-800 border-orange-200',
        'bg-pink-100 text-pink-800 border-pink-200',
      ]
      const colorIndex = selectedLanguages.indexOf(language)
      return colorIndex >= 0 ? colors[colorIndex] || colors[0] : 'bg-gray-100 text-gray-800 border-gray-200'
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Segmented View</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVisualization(!showVisualization)}
          >
            {showVisualization ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-1">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`p-2 rounded border cursor-pointer transition-all ${
                selectedSegment === index ? 'ring-2 ring-blue-500' : ''
              } ${getLanguageColor(segment.language, index)}`}
              onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">{segment.text}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {segment.language}
                  </Badge>
                  {segment.userTagged && (
                    <Target className="h-3 w-3 text-blue-500" title="User tagged" />
                  )}
                </div>
              </div>
              
              {selectedSegment === index && (
                <div className="mt-2 pt-2 border-t border-current/20">
                  <SearchableSelect
                    options={languageOptions}
                    value={[segment.language]}
                    onValueChange={(langs) => updateSegmentLanguage(index, langs[0])}
                    placeholder="Select language..."
                    multiple={false}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }, [
    showVisualization, 
    segments, 
    selectedLanguages, 
    selectedSegment, 
    languageOptions, 
    updateSegmentLanguage
  ])

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Manual Language Tagging
          </CardTitle>
          <CardDescription>
            Tag language boundaries and assign languages to text segments. Click between words to add switch points.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              Languages Present
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select all languages present in this text</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <SearchableSelect
              options={languageOptions}
              value={selectedLanguages}
              onValueChange={setSelectedLanguages}
              placeholder={languagesLoading ? "Loading languages..." : "Select languages..."}
              multiple={true}
              maxSelections={5}
              disabled={disabled || languagesLoading}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={autoDetectSwitchPoints}
              disabled={disabled || selectedLanguages.length < 2}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto-detect
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={disabled || historyIndex <= 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={disabled || historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetTagging}
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <div className="flex-1" />
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Languages className="h-4 w-4" />
              {switchPoints.length} switch points
            </div>
          </div>

          {/* Interactive Text Area */}
          {selectedLanguages.length >= 2 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Interactive Text</Label>
              {renderInteractiveText}
            </div>
          )}

          {/* Segmented View */}
          {segments.length > 0 && renderSegmentedView}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about your tagging decisions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={disabled}
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={disabled || segments.length === 0}
              className="min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Tags
            </Button>
          </div>

          {/* Summary */}
          {segments.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Summary:</strong> {segments.length} segments tagged across {selectedLanguages.length} languages
                {switchPoints.filter(p => p.userAdded).length > 0 && (
                  <span className="ml-2">
                    ({switchPoints.filter(p => p.userAdded).length} user-added switch points)
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}