"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  Users, 
  GraduationCap, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Shield,
  Settings,
  Database,
  Activity,
  UserCheck,
  UserX,
  Search
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'

interface ResearchApplication {
  id: string
  userId: string
  user: {
    name: string
    email: string
    displayName?: string
  }
  requestedTools: string[]
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  adminNotes?: string
}

interface AdminStats {
  totalUsers: number
  communityUsers: number
  researcherUsers: number
  adminUsers: number
  pendingApplications: number
  totalExamples: number
  verifiedExamples: number
  systemHealth: 'healthy' | 'warning' | 'error'
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [applications, setApplications] = useState<ResearchApplication[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingApplications, setLoadingApplications] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user && user.tier !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    if (user && user.tier === 'ADMIN') {
      loadApplications()
      loadStats()
    }
  }, [user, isAuthenticated, isLoading, router])

  const loadApplications = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await api.get('/admin/applications', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setApplications(response.data.data)
      } else {
        setError(response.data.message || 'Failed to load applications')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications')
    } finally {
      setLoadingApplications(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await api.get('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setStats(response.data.data)
      } else {
        setError(response.data.message || 'Failed to load statistics')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load statistics')
    } finally {
      setLoadingStats(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await api.post(`/admin/applications/${applicationId}/${action}`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (response.data.success) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                status: action === 'approve' ? 'APPROVED' : 'REJECTED',
                reviewedAt: new Date().toISOString(),
                adminNotes: notes
              }
            : app
        ))
        
        setSuccess(`Application ${action}d successfully`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.data.message || `Failed to ${action} application`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} application`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.tier !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
              <Crown className="h-8 w-8 mr-3 text-purple-600" />
              Admin Dashboard
            </h1>
            <p className="text-neutral-600">Platform management and oversight tools</p>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            <Crown className="h-4 w-4 mr-1" />
            Administrator
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

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Users</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Researchers</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.researcherUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Pending Applications</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.pendingApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Examples</p>
                    <p className="text-2xl font-bold text-neutral-900">{stats.totalExamples.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Research Access Applications</CardTitle>
                <CardDescription>
                  Review and manage researcher access requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingApplications ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                      <p className="text-neutral-600">Loading applications...</p>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-600">No applications found</p>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-neutral-900">
                              {application.user.displayName || application.user.name}
                            </h3>
                            <p className="text-sm text-neutral-600">{application.user.email}</p>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-neutral-700 mb-1">Requested Tools:</p>
                          <div className="flex flex-wrap gap-1">
                            {application.requestedTools.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-neutral-700 mb-1">Reason:</p>
                          <p className="text-sm text-neutral-600">{application.reason}</p>
                        </div>

                        <div className="text-xs text-neutral-500">
                          Applied: {new Date(application.createdAt).toLocaleDateString()}
                          {application.reviewedAt && (
                            <span> • Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}</span>
                          )}
                        </div>

                        {application.adminNotes && (
                          <div className="bg-neutral-50 p-2 rounded">
                            <p className="text-sm font-medium text-neutral-700">Admin Notes:</p>
                            <p className="text-sm text-neutral-600">{application.adminNotes}</p>
                          </div>
                        )}

                        {application.status === 'PENDING' && (
                          <div className="flex space-x-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'approve', 'Application approved - access granted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationAction(application.id, 'reject', 'Application does not meet criteria')}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">User management features coming soon</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    This will include user search, tier management, and account moderation
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  Platform usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">Advanced analytics dashboard coming soon</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    This will include usage metrics, performance monitoring, and system health
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Platform configuration and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">System settings panel coming soon</p>
                  <p className="text-sm text-neutral-500 mt-2">
                    This will include rate limits, feature flags, and system configuration
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}