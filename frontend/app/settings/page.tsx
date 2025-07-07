"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Eye, 
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  GraduationCap,
  Users,
  Crown
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dataProcessingOptIn: true,
    analyticsOptIn: true,
    publicProfile: false,
    researchDataSharing: true,
  })
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user) {
      // TODO: Load user settings from API
      loadUserSettings()
    }
  }, [user, isAuthenticated, isLoading, router])

  const loadUserSettings = async () => {
    try {
      // TODO: Implement actual API call
      // const response = await api.get('/user/settings')
      // setSettings(response.data.settings)
    } catch (err) {
      setError('Failed to load settings')
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implement actual API call
      // const response = await api.put('/user/settings', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Settings saved successfully!')
    } catch (err: any) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      setSuccess('Data export initiated. You will receive an email when ready.')
    } catch (err) {
      setError('Failed to initiate data export')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (confirmed) {
      try {
        // TODO: Implement account deletion
        setError('Account deletion is not yet implemented. Please contact support.')
      } catch (err) {
        setError('Failed to delete account')
      }
    }
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
              <p className="text-neutral-600">Loading settings...</p>
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
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-teal-600" />
              Settings
            </h1>
            <p className="text-neutral-600">Manage your account preferences and privacy settings</p>
          </div>
          <Badge variant="outline" className={tierInfo.color}>
            {tierInfo.icon}
            <span className="ml-1">{tierInfo.label}</span>
          </Badge>
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

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-teal-600" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user.email} disabled className="bg-neutral-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Tier</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Badge variant="outline" className={tierInfo.color}>
                        {tierInfo.icon}
                        <span className="ml-1">{tierInfo.label}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <Input 
                      value={new Date(user.createdAt).toLocaleDateString()} 
                      disabled 
                      className="bg-neutral-50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Authentication Method</Label>
                    <Input value={user.authProvider} disabled className="bg-neutral-50" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-neutral-600">{tierInfo.description}</p>
                  {user.tier === 'COMMUNITY' && (
                    <div className="mt-3">
                      <Button asChild size="sm" variant="outline">
                        <a href="/auth/apply-researcher">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Apply for Researcher Access
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-teal-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how you receive updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-neutral-600">
                      Receive updates about your submissions and account
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Research Updates</Label>
                    <p className="text-sm text-neutral-600">
                      Get notified about new research features and tools
                    </p>
                  </div>
                  <Switch
                    checked={settings.analyticsOptIn}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, analyticsOptIn: checked }))
                    }
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-teal-600" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-neutral-600">
                      Allow others to see your profile and contributions
                    </p>
                  </div>
                  <Switch
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, publicProfile: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Research Data Sharing</Label>
                    <p className="text-sm text-neutral-600">
                      Allow your submissions to be used in aggregated research
                    </p>
                  </div>
                  <Switch
                    checked={settings.researchDataSharing}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, researchDataSharing: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Analytics</Label>
                    <p className="text-sm text-neutral-600">
                      Help improve the platform by sharing usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.dataProcessingOptIn}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, dataProcessingOptIn: checked }))
                    }
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-teal-600" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export or delete your account data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-neutral-900">Export Your Data</h3>
                      <p className="text-sm text-neutral-600">
                        Download a copy of all your data including submissions and preferences
                      </p>
                    </div>
                    <Download className="h-5 w-5 text-teal-600" />
                  </div>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Request Data Export
                  </Button>
                </div>

                <div className="border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-red-900">Delete Account</h3>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    This action cannot be undone. All your submissions, preferences, and account data will be permanently deleted.
                  </p>
                  <Button 
                    onClick={handleDeleteAccount} 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}