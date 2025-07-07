"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Plus, X, Send, HelpCircle, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { submitExample, fetchAvailableLanguages } from "@/lib/api"
import { EnhancedSubmissionModal } from "@/components/enhanced-submission-modal"
import { ClientOnly } from "@/components/client-only"
import type { SubmissionData } from "@/types"

export default function SubmitPage() {
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState("")
  const [example, setExample] = useState("")
  const [context, setContext] = useState("")
  const [age, setAge] = useState("")
  const [region, setRegion] = useState("")
  const [platform, setPlatform] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true)
  const { toast } = useToast()

  const fallbackLanguages = [
    "English",
    "Spanish", 
    "Hindi",
    "Mandarin",
    "French",
    "Arabic",
    "Portuguese",
    "Russian",
    "Japanese",
    "German",
    "Korean",
    "Italian",
    "Dutch",
    "Swedish",
    "Norwegian",
    "Tagalog",
    "Urdu",
    "Bengali"
  ]

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await fetchAvailableLanguages()
        setAvailableLanguages(languages.length > 0 ? languages : fallbackLanguages)
      } catch (error) {
        console.error("Failed to fetch languages:", error)
        setAvailableLanguages(fallbackLanguages)
        toast({
          title: "Using default languages",
          description: "Couldn't load languages from server, using defaults.",
          variant: "default",
        })
      } finally {
        setIsLoadingLanguages(false)
      }
    }
    
    loadLanguages()
  }, [])

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage])
      setNewLanguage("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submissionData: SubmissionData = {
        text: example,
        languages,
        context: context || undefined,
        age: age || undefined,
        region: region || undefined,
        platform: platform || undefined,
      }

      const result = await submitExample(submissionData)

      if (result.success) {
        toast({
          title: "Example submitted successfully!",
          description: "Thank you for contributing to the SwitchBoard corpus.",
        })

        setExample("")
        setLanguages([])
        setContext("")
        setAge("")
        setRegion("")
        setPlatform("")
      } else {
        throw new Error(result.error || "Submission failed")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Submit a Code-switching Example</h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Share real-world examples of code-switching to help build our comprehensive corpus. Your contribution helps
            advance multilingual research.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-teal-600" />
                  Example Submission
                </CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help researchers understand the context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="example" className="text-base font-medium">
                      Code-switching Example *
                    </Label>
                    <Textarea
                      id="example"
                      placeholder="e.g., 'I'm going to the store, lekin pehle I need to finish this work.'"
                      value={example}
                      onChange={(e) => setExample(e.target.value)}
                      className="min-h-[100px] resize-none"
                      required
                    />
                    <p className="text-sm text-neutral-500">
                      Enter the exact text as it was spoken or written, including any mixed languages.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      Languages Used *
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-neutral-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select all languages present in your example</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>

                    <div className="flex gap-2">
                      <Select value={newLanguage} onValueChange={setNewLanguage} disabled={isLoadingLanguages}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={isLoadingLanguages ? "Loading languages..." : "Select a language"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLanguages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={addLanguage}
                        disabled={!newLanguage || languages.includes(newLanguage)}
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {languages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                            {lang}
                            <button
                              type="button"
                              onClick={() => removeLanguage(lang)}
                              className="ml-1 hover:bg-neutral-300 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context" className="text-base font-medium">
                      Context (Optional)
                    </Label>
                    <Textarea
                      id="context"
                      placeholder="Describe the situation, setting, or conversation where this code-switching occurred..."
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium">
                        Age Range (Optional)
                      </Label>
                      <Select value={age} onValueChange={setAge}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-18">Under 18</SelectItem>
                          <SelectItem value="18-25">18-25</SelectItem>
                          <SelectItem value="26-35">26-35</SelectItem>
                          <SelectItem value="36-45">36-45</SelectItem>
                          <SelectItem value="46-55">46-55</SelectItem>
                          <SelectItem value="over-55">Over 55</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-sm font-medium">
                        Region (Optional)
                      </Label>
                      <Input
                        id="region"
                        placeholder="e.g., California, Mumbai"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-sm font-medium">
                        Platform (Optional)
                      </Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conversation">Face-to-face</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="messaging">Text/Messaging</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <ClientOnly fallback={
                      <Button
                        type="button"
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        disabled={true}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Loading Enhanced Analysis...
                      </Button>
                    }>
                      <EnhancedSubmissionModal
                        trigger={
                          <Button
                            type="button"
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            disabled={!example || languages.length < 2}
                          >
                            <Zap className="mr-2 h-4 w-4" />
                            Enhanced Analysis & Submit
                          </Button>
                        }
                        initialData={{
                          text: example,
                          languages: languages,
                          context: context,
                          age: age,
                          region: region,
                          platform: platform
                        }}
                        onSubmissionComplete={() => {
                          // Reset form after successful enhanced submission
                          setExample("")
                          setLanguages([])
                          setContext("")
                          setAge("")
                          setRegion("")
                          setPlatform("")
                          toast({
                            title: "Enhanced submission complete!",
                            description: "Your example was analyzed and submitted successfully.",
                          })
                        }}
                      />
                    </ClientOnly>
                    
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      disabled={!example || languages.length < 2 || isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Quick Submit (Basic)"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-neutral-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-teal-600" />
                  Enhanced Analysis (NEW!)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-teal-900">Real-time AI Analysis</h4>
                  <p className="text-sm text-teal-700">
                    Get instant language detection, switch-point analysis, and confidence scoring with our enhanced NLP system.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-teal-900">Interactive Corrections</h4>
                  <p className="text-sm text-teal-700">
                    Review and adjust language boundaries to help improve our system for everyone.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-teal-900">Research-Grade Quality</h4>
                  <p className="text-sm text-teal-700">
                    Your submissions include detailed linguistic analysis that advances multilingual research.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle className="text-lg">Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-neutral-900">What is Code-switching?</h4>
                  <p className="text-sm text-neutral-600">
                    The practice of alternating between languages or language varieties within a single conversation or
                    sentence.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-neutral-900">Good Examples:</h4>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• Natural, spontaneous language mixing</li>
                    <li>• Real conversations or communications</li>
                    <li>• Clear language boundaries</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-neutral-900">Please Avoid:</h4>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• Artificial or forced examples</li>
                    <li>• Single borrowed words</li>
                    <li>• Offensive or inappropriate content</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 bg-teal-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h4 className="font-medium text-teal-900">Thank You!</h4>
                  <p className="text-sm text-teal-700">
                    Your contributions help researchers better understand multilingual communication patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
