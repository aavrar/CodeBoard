import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Users, BookOpen, Target, Heart, Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">About CodeBoard</h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Understanding the beautiful complexity of multilingual communication through community-driven research and
            open collaboration.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-teal-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-700 leading-relaxed">
              CodeBoard is dedicated to building the world's most comprehensive, community-driven corpus of
              code-switching examples. We believe that understanding how multilingual speakers naturally mix languages
              is crucial for advancing linguistic research, improving language technologies, and celebrating the
              richness of multilingual communication.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              By collecting real-world examples from diverse communities worldwide, we aim to provide researchers,
              educators, and technologists with the data they need to better understand and support multilingual
              speakers.
            </p>
          </CardContent>
        </Card>

        {/* What is Code-switching */}
        <Card className="mb-8 border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lightbulb className="h-6 w-6 text-teal-600" />
              What is Code-switching?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-700 leading-relaxed">
              Code-switching is the practice of alternating between two or more languages or language varieties within a
              single conversation, sentence, or even word. It's a natural phenomenon that occurs when multilingual
              speakers communicate, reflecting their linguistic competence and cultural identity.
            </p>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h4 className="font-medium text-neutral-900 mb-2">Examples:</h4>
              <ul className="space-y-2 text-neutral-700">
                <li>
                  • <strong>English-Spanish:</strong> "I'm going to the store, pero first necesito dinero."
                </li>
                <li>
                  • <strong>Hindi-English:</strong> "Aaj ka weather is really nice, perfect for a walk."
                </li>
                <li>
                  • <strong>French-English:</strong> "Je vais au marché, but I'll be back soon."
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Why It Matters */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-neutral-200">
            <CardHeader>
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Linguistic Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Helps researchers understand patterns, triggers, and social factors that influence code-switching
                behavior across different communities.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader>
              <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Technology Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Enables the development of better NLP models, translation systems, and language technologies that
                understand multilingual communication.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardHeader>
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle>Cultural Preservation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Documents and celebrates the linguistic practices of multilingual communities, preserving cultural and
                linguistic diversity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-8 border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-teal-600" />
              How CodeBoard Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900">Community Contributions</h4>
                <p className="text-neutral-700">
                  Multilingual speakers from around the world contribute real examples of code-switching from their
                  daily conversations, social media posts, and communications.
                </p>

                <h4 className="font-medium text-neutral-900">Quality Assurance</h4>
                <p className="text-neutral-700">
                  All submissions are reviewed for authenticity and appropriateness while maintaining contributor
                  privacy and anonymity.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900">Open Access</h4>
                <p className="text-neutral-700">
                  The corpus is freely available to researchers, educators, and developers worldwide, promoting open
                  science and collaboration.
                </p>

                <h4 className="font-medium text-neutral-900">Continuous Growth</h4>
                <p className="text-neutral-700">
                  The platform continuously evolves with new examples, languages, and analytical tools based on
                  community needs and feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team & Contact */}
        <Card className="mb-8 border-neutral-200">
          <CardHeader>
            <CardTitle className="text-2xl">Get Involved</CardTitle>
            <CardDescription>Join our global community of contributors and researchers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">For Contributors</h4>
                <p className="text-neutral-700 mb-4">
                  Share your multilingual experiences and help build this valuable resource.
                </p>
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/submit">
                    Start Contributing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div>
                <h4 className="font-medium text-neutral-900 mb-2">For Researchers</h4>
                <p className="text-neutral-700 mb-4">
                  Access our comprehensive dataset for your linguistic research projects.
                </p>
                <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                  <Link href="/explore">
                    Explore Data
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-neutral-200 bg-teal-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-teal-900">Questions or Suggestions?</h3>
              <p className="text-teal-700">
                We'd love to hear from you! Reach out to our team for collaborations, questions, or feedback about the
                platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="bg-white border-teal-600 text-teal-600 hover:bg-teal-50">
                  Contact Us
                </Button>
                <Button variant="outline" className="bg-white border-teal-600 text-teal-600 hover:bg-teal-50">
                  Join Our Newsletter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
