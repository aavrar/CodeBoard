import express from 'express'
import { supabase, tables, handleSupabaseError } from '../utils/supabase.js'
import { UserPayload } from '../types/index.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

interface AuthenticatedRequest extends express.Request {
  user: UserPayload
}

// GET /api/admin/stats - Get admin dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get user counts by tier
    const { data: users, error: usersError } = await supabase
      .from(tables.users)
      .select('tier')

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    // Get total examples
    const { count: totalExamples, error: examplesError } = await supabase
      .from(tables.examples)
      .select('*', { count: 'exact', head: true })

    if (examplesError) {
      console.error('Error fetching examples count:', examplesError)
    }

    // Get verified examples
    const { count: verifiedExamples, error: verifiedError } = await supabase
      .from(tables.examples)
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    if (verifiedError) {
      console.error('Error fetching verified examples:', verifiedError)
    }

    // Get pending applications
    const { count: pendingApplications, error: applicationsError } = await supabase
      .from(tables.researchApplications)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError)
    }

    // Calculate tier distribution
    const usersByTier = (users || []).reduce((acc: Record<string, number>, user: any) => {
      const tier = user.tier || 'COMMUNITY'
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    }, {})

    const stats = {
      totalUsers: users?.length || 0,
      communityUsers: usersByTier['COMMUNITY'] || 0,
      researcherUsers: usersByTier['RESEARCHER'] || 0,
      adminUsers: usersByTier['ADMIN'] || 0,
      pendingApplications: pendingApplications || 0,
      totalExamples: totalExamples || 0,
      verifiedExamples: verifiedExamples || 0,
      systemHealth: 'healthy' as const
    }

    res.json({
      success: true,
      data: stats,
      message: 'Admin statistics retrieved successfully',
      error: null
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve admin statistics',
      error: 'Server error'
    })
  }
})

// GET /api/admin/applications - Get research applications
router.get('/applications', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data: applications, error } = await supabase
      .from(tables.researchApplications)
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error, 'research applications fetch')
    }

    // Transform the data to match frontend expectations
    const transformedApplications = (applications || []).map((app: any) => ({
      id: app.id,
      userId: app.user_id,
      user: {
        name: app.users?.name || 'Unknown',
        email: app.users?.email || 'Unknown',
        displayName: app.users?.display_name
      },
      requestedTools: app.requested_tools || [],
      reason: app.reason || '',
      status: app.status,
      createdAt: app.created_at,
      reviewedAt: app.reviewed_at,
      adminNotes: app.admin_notes
    }))

    res.json({
      success: true,
      data: transformedApplications,
      message: 'Applications retrieved successfully',
      error: null
    })

  } catch (error) {
    console.error('Admin applications error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve applications',
      error: 'Server error'
    })
  }
})

// POST /api/admin/applications/:id/approve - Approve research application
router.post('/applications/:id/approve', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { notes } = req.body
    const authReq = req as AuthenticatedRequest

    // Update application status
    const { data: application, error: updateError } = await supabase
      .from(tables.researchApplications)
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || 'Application approved',
        reviewed_by: authReq.user.id
      })
      .eq('id', id)
      .select('user_id')
      .single()

    if (updateError) {
      handleSupabaseError(updateError, 'application approval')
    }

    // Update user tier to RESEARCHER
    const { error: userUpdateError } = await supabase
      .from(tables.users)
      .update({ tier: 'RESEARCHER' })
      .eq('id', application.user_id)

    if (userUpdateError) {
      handleSupabaseError(userUpdateError, 'user tier update')
    }

    res.json({
      success: true,
      data: { applicationId: id, status: 'APPROVED' },
      message: 'Application approved successfully',
      error: null
    })

  } catch (error) {
    console.error('Application approval error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to approve application',
      error: 'Server error'
    })
  }
})

// POST /api/admin/applications/:id/reject - Reject research application
router.post('/applications/:id/reject', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { notes } = req.body
    const authReq = req as AuthenticatedRequest

    // Update application status
    const { error: updateError } = await supabase
      .from(tables.researchApplications)
      .update({
        status: 'REJECTED',
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || 'Application rejected',
        reviewed_by: authReq.user.id
      })
      .eq('id', id)

    if (updateError) {
      handleSupabaseError(updateError, 'application rejection')
    }

    res.json({
      success: true,
      data: { applicationId: id, status: 'REJECTED' },
      message: 'Application rejected successfully',
      error: null
    })

  } catch (error) {
    console.error('Application rejection error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to reject application',
      error: 'Server error'
    })
  }
})

// GET /api/admin/users - Get users for management (paginated)
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = req.query.search as string
    const tier = req.query.tier as string

    let query = supabase
      .from(tables.users)
      .select('id, email, name, display_name, tier, created_at, last_login_at, is_active')

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    if (tier && tier !== 'ALL') {
      query = query.eq('tier', tier)
    }

    // Apply pagination
    const { data: users, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error, 'users fetch')
    }

    res.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      message: 'Users retrieved successfully',
      error: null
    })

  } catch (error) {
    console.error('Admin users error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve users',
      error: 'Server error'
    })
  }
})

export default router