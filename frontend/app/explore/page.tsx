"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Search, Download, Copy, MapPin, Clock, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CodeSwitchingExample, SearchFilters } from "@/types"

export default function ExplorePage() {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")

  // Data state
  const [examples, setExamples] = useState<CodeSwitchingExample[]>([])
  const [filteredExamples, setFilteredExamples] = useState<CodeSwitchingExample[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Available options - TODO: Replace with backend API calls
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([])

  const { toast } = useToast()

  // MOCK DATA - Replace with API call when backend is ready
  const mockExamples: CodeSwitchingExample[] = [
    {
      id: "1",
      text: "I'm going to the store, lekin pehle I need to finish this work.",
      languages: ["English", "Hindi"],
      context: "Casual conversation with family member",
      region: "Delhi, India",
      platform: "Face-to-face",
      age: "26-35",
      timestamp: "2024-01-15",
      isVerified: true,
    },
    {
      id: "2",
      text: "¿Puedes help me with this assignment? Es muy difficult.",
      languages: ["Spanish", "English"],
      context: "Student asking for help",
      region: "Los Angeles, CA",
      platform: "Text/Messaging",
      age: "18-25",
      timestamp: "2024-01-14",
      isVerified: true,
    },
    {
      id: "3",
      text: "Je vais au marché, but first I need to call mom.",
      languages: ["French", "English"],
      context: "Planning daily activities",
      region: "Montreal, Canada",
      platform: "Social Media",
      age: "26-35",
      timestamp: "2024-01-13",
      isVerified: true,
    },
    {
      id: "4",
      text: "Aaj ka weather is really nice, perfect for a walk.",
      languages: ["Hindi", "English"],
      context: "Commenting on weather",
      region: "Mumbai, India",
      platform: "Social Media",
      age: "18-25",
      timestamp: "2024-01-12",
      isVerified: true,
    },
    {
      id: "5",
      text: "我今天很忙, but I can meet you later for dinner.",
      languages: ["Mandarin", "English"],
      context: "Making plans with friend",
      region: "San Francisco, CA",
      platform: "Text/Messaging",
      age: "26-35",
      timestamp: "2024-01-11",
      isVerified: true,
    },
    {
      id: "6",
      text: "Das ist sehr gut, I really like this approach.",
      languages: ["German", "English"],
      context: "Work meeting discussion",
      region: "Berlin, Germany",
      platform: "Face-to-face",
      age: "36-45",
      timestamp: "2024-01-10",
      isVerified: true,
    },
  ]

  // Load initial data and filter options
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API calls when backend is ready
      // const [examplesData, languages, regions, platforms] = await Promise.all([
      //   fetchExamples(),
      //   fetchAvailableLanguages(),
      //   fetchAvailableRegions(),
      //   fetchAvailablePlatforms()
      // ])

      // MOCK DATA - Remove when backend is ready
      const examplesData = mockExamples
      const languages = Array.from(new Set(mockExamples.flatMap((ex) => ex.languages)))
      const regions = Array.from(new Set(mockExamples.map((ex) => ex.region).filter(Boolean)))
      const platforms = Array.from(new Set(mockExamples.map((ex) => ex.platform).filter(Boolean)))

      setExamples(examplesData)
      setFilteredExamples(examplesData)
      setAvailableLanguages(languages)
      setAvailableRegions(regions)
      setAvailablePlatforms(platforms)
    } catch (error) {
      toast({
        title: "Failed to load examples",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      // Prepare search filters
      const filters: SearchFilters = {
        searchTerm: searchTerm || undefined,
        languages: selectedLanguage !== "all" ? [selectedLanguage] : undefined,
        region: selectedRegion !== "all" ? selectedRegion : undefined,
        platform: selectedPlatform !== "all" ? selectedPlatform : undefined,
      }

      // TODO: Replace with actual API call when backend is ready
      // const results = await fetchExamples(filters)

      // MOCK FILTERING - Remove when backend is ready
      let filtered = examples

      if (searchTerm) {
        filtered = filtered.filter(
          (ex) =>
            ex.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ex.context && ex.context.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }

      if (selectedLanguage !== "all") {
        filtered = filtered.filter((ex) => ex.languages.includes(selectedLanguage))
      }

      if (selectedRegion !== "all") {
        filtered = filtered.filter((ex) => ex.region === selectedRegion)
      }

      if (selectedPlatform !== "all") {
        filtered = filtered.filter((ex) => ex.platform === selectedPlatform)
      }

      setFilteredExamples(filtered)
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Example text has been copied.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadData = () => {
    try {
      // TODO: In production, this should call a backend endpoint for proper data export
      // with authentication and rate limiting
      const dataStr = JSON.stringify(filteredExamples, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `switchboard-examples-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading ${filteredExamples.length} examples.`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Explore Code-switching Corpus</h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Search and filter through thousands of real-world code-switching examples contributed by our global
            community.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-teal-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-5 gap-4 mb-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search examples or context..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {/* TODO: Replace with availableLanguages from API */}
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {/* TODO: Replace with availableRegions from API */}
                  {availableRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {/* TODO: Replace with availablePlatforms from API */}
                  {availablePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? "Searching..." : "Search"}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadData} disabled={filteredExamples.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Results
                </Button>
                <span className="text-sm text-neutral-500 flex items-center">
                  {filteredExamples.length} examples found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Search className="h-16 w-16 mx-auto animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-neutral-900 mb-2">Loading examples...</h3>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredExamples.map((example) => (
              <Card key={example.id} className="border-neutral-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                      {example.languages.map((lang, index) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className={index === 0 ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800"}
                        >
                          {lang}
                        </Badge>
                      ))}
                      {/* TODO: Add verification badge based on backend verification status */}
                      {example.isVerified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(example.text)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-neutral-900 font-medium leading-relaxed">"{example.text}"</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    {example.context && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MessageSquare className="h-4 w-4" />
                        <span>{example.context}</span>
                      </div>
                    )}

                    {example.region && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <MapPin className="h-4 w-4" />
                        <span>{example.region}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-neutral-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {example.platform && `${example.platform} • `}
                        {example.age && `${example.age} • `}
                        {new Date(example.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredExamples.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-neutral-900 mb-2">No examples found</h3>
            <p className="text-neutral-600">Try adjusting your search terms or filters to find more examples.</p>
          </div>
        )}
      </div>
    </div>
  )
}
