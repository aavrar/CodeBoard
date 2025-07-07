"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  GraduationCap, 
  Users, 
  Crown,
  Edit3,
  Save,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    bio: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setFormData({
        name: user.name || '',
        displayName: user.displayName || '',
        bio: user.bio || ''
      })
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implement profile update API call
      // const response = await api.put('/user/profile', formData)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err: any) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        displayName: user.displayName || '',
        bio: user.bio || ''
      })
    }
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'RESEARCHER':
        return {
          icon: <GraduationCap className="h-4 w-4" />,
          label: 'Researcher',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          description: 'Access to advanced research tools and analytics'
        }
      case 'ADMIN':
        return {
          icon: <Crown className="h-4 w-4" />,
          label: 'Administrator',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          description: 'Full platform access and management capabilities'
        }
      default:
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'Community Member',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Access to basic platform features'
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const tierInfo = getTierInfo(user.tier)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
            <p className="text-neutral-600">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-teal-600" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-neutral-900 bg-neutral-50 p-3 rounded-md">
                      {user.name || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-neutral-900 bg-neutral-50 p-3 rounded-md">
                      {user.displayName || user.name || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-neutral-900 bg-neutral-50 p-3 rounded-md min-h-[100px]">
                      {user.bio || 'No bio provided yet.'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Details Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-teal-600" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{user.email}</p>
                    <p className="text-xs text-neutral-500">Email address</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-neutral-500">Member since</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Settings className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{user.authProvider}</p>
                    <p className="text-xs text-neutral-500">Authentication method</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Account Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-3">
                  <Badge variant="outline" className={tierInfo.color}>
                    {tierInfo.icon}
                    <span className="ml-1">{tierInfo.label}</span>
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600">{tierInfo.description}</p>
                
                {user.tier === 'COMMUNITY' && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" asChild>
                      <a href="/auth/apply-researcher">
                        Apply for Researcher Access
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                {user.tier === 'RESEARCHER' && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/research">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Research Dashboard
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}