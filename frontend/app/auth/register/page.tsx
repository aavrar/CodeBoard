"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Globe, Github, Mail, Eye, EyeOff, GraduationCap, Users, Crown } from 'lucide-react'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    displayName: '',
    bio: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detectedTier, setDetectedTier] = useState<'COMMUNITY' | 'RESEARCHER' | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'email') {
      const emailDomain = value.toLowerCase().split('@')[1]
      if (emailDomain && isEducationalDomain(emailDomain)) {
        setDetectedTier('RESEARCHER')
      } else {
        setDetectedTier('COMMUNITY')
      }
    }
  }

  const isEducationalDomain = (domain: string): boolean => {
    const eduDomains = ['.edu', '.ac.uk', '.edu.au', '.ac.nz', '.edu.sg', '.ac.za']
    return eduDomains.some(suffix => domain.endsWith(suffix))
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/oauth/register', {
        ...formData,
        authProvider: 'EMAIL'
      })

      if (response.data.success) {
        const { token } = response.data.data
        localStorage.setItem('authToken', token)
        
        if (detectedTier === 'RESEARCHER') {
          router.push('/auth/onboarding/researcher')
        } else {
          router.push('/auth/onboarding/community')
        }
      } else {
        setError(response.data.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthRegister = (provider: 'google' | 'github') => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    window.location.href = `${apiUrl}/oauth/${provider}`
  }

  const getTierInfo = (tier: 'COMMUNITY' | 'RESEARCHER' | null) => {
    switch (tier) {
      case 'RESEARCHER':
        return {
          icon: <GraduationCap className="h-4 w-4" />,
          label: 'Researcher Access',
          description: 'You\'ll get access to advanced research tools',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        }
      case 'COMMUNITY':
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'Community Member',
          description: 'You can apply for researcher access later',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      default:
        return null
    }
  }

  const tierInfo = getTierInfo(detectedTier)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">CodeBoard</span>
          </Link>
          <h2 className="text-3xl font-bold text-neutral-900">Join CodeBoard</h2>
          <p className="mt-2 text-neutral-600">Create your account to start contributing</p>
        </div>

        <Card className="border-neutral-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-neutral-900">Create account</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred registration method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-neutral-300 hover:bg-neutral-50"
                onClick={() => handleOAuthRegister('google')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">Or register with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailRegister} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500"
                />
                {tierInfo && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className={tierInfo.color}>
                      {tierInfo.icon}
                      <span className="ml-1">{tierInfo.label}</span>
                    </Badge>
                    <span className="text-xs text-neutral-500">{tierInfo.description}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-neutral-700">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-neutral-700">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Public name"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-700">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    minLength={8}
                    className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-neutral-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-neutral-700">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your interest in code-switching..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  maxLength={500}
                  className="border-neutral-300 focus:border-teal-500 focus:ring-teal-500 min-h-[80px]"
                />
                <p className="text-xs text-neutral-500">{formData.bio.length}/500 characters</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-neutral-600">Already have an account? </span>
              <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-neutral-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-teal-600 hover:text-teal-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-teal-600 hover:text-teal-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}