import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Users, BarChart3, BookOpen, ArrowRight, Languages, Database } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  // TODO: These statistics should come from a backend API endpoint
  // Example: const stats = await fetchHomePageStats()

  // MOCK DATA - Replace with API call when backend is ready
  const stats = {
    contributors: "1+",
    examples: "15+",
    languagePairs: "25+",
    countries: "50+",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                  Welcome to <span className="text-teal-600">CodeBoard</span>
                </h1>
                <p className="text-xl text-neutral-600 leading-relaxed">
                  A community-driven platform for collecting, analyzing, and understanding code-switching patterns in
                  multilingual communication.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/submit">
                    Contribute Examples
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                  <Link href="/explore">Explore Data</Link>
                </Button>
              </div>

              {/* Statistics - TODO: Replace with real-time data from backend */}
              <div className="flex items-center space-x-8 text-sm text-neutral-500">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{stats.contributors} Contributors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>{stats.examples} Examples</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4" />
                  <span>{stats.languagePairs} Language Pairs</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-neutral-200">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <Globe className="h-32 w-32 text-teal-600" />
                    <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-2">
                      <Languages className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-900">Real-world Code-switching</h3>
                  {/* TODO: This example could be fetched from a "featured example" API endpoint */}
                  <p className="text-neutral-600">
                    {'"I\'m going to the store, lekin pehle I need to finish this work."'}
                  </p>
                  <div className="flex justify-center space-x-2 mt-4">
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                      English
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                      Hindi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">Why CodeBoard?</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Understanding code-switching helps us better comprehend multilingual communication and build more
              inclusive language technologies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-neutral-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-neutral-900">Community-Driven</CardTitle>
                <CardDescription>
                  Built by and for multilingual speakers who understand the nuances of code-switching.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-neutral-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-neutral-900">Rich Analytics</CardTitle>
                <CardDescription>
                  Explore patterns, frequencies, and linguistic insights from real-world data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-neutral-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-neutral-900">Research-Ready</CardTitle>
                <CardDescription>
                  Structured data perfect for linguistic research and NLP model training.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section - TODO: Replace with real-time statistics from backend */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-teal-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">{stats.examples}</div>
              <div className="text-teal-100">Code-switching Examples</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">{stats.languagePairs}</div>
              <div className="text-teal-100">Language Pairs</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">{stats.contributors}</div>
              <div className="text-teal-100">Active Contributors</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">{stats.countries}</div>
              <div className="text-teal-100">Countries Represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">Ready to Contribute?</h2>
          <p className="text-xl text-neutral-600 mb-8">
            Help us build the world's most comprehensive code-switching corpus. Every example you share helps advance
            multilingual research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
              <Link href="/submit">
                Submit Your First Example
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-neutral-300">
              <Link href="/about">Learn More About the Project</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
