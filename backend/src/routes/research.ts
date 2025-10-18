import express, { Response } from 'express'
import { z } from 'zod'
import { researchApplicationService } from '../services/researchApplicationService.js'
import { ApplicationStatus, UserTier, UserPayload, researchApplicationSchema } from '../types/index.js'
import { authenticateToken, requireAdmin, requireOwnershipOrAdmin } from '../middleware/auth.js'

const router = express.Router()

interface AuthenticatedRequest extends express.Request {
  user: UserPayload
}

router.post('/applications', authenticateToken, async (req: express.Request, res: Response) => {
  try {
    const user = (req as any).user as UserPayload
    const validatedData = researchApplicationSchema.parse(req.body)

    const application = await researchApplicationService.createApplication({
      userId: user.id,
      ...validatedData
    })

    res.status(201).json({
      success: true,
      data: application,
      message: 'Research application submitted successfully',
      error: null
    })
  } catch (error) {
    console.error('Application creation error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation error',
        error: error.errors
      })
    }

    res.status(400).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to create application',
      error: 'Bad request'
    })
  }
})

router.get('/applications/my', authenticateToken, async (req: express.Request, res: Response) => {
  try {
    const user = (req as any).user as UserPayload
    const applications = await researchApplicationService.getApplicationsByUserId(user.id)

    res.json({
      success: true,
      data: applications,
      message: 'Applications retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Get user applications error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve applications',
      error: 'Internal server error'
    })
  }
})

router.get('/applications/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const applications = await researchApplicationService.getAllApplications('PENDING')

    res.json({
      success: true,
      data: applications,
      message: 'Pending applications retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Get pending applications error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve pending applications',
      error: 'Internal server error'
    })
  }
})

router.get('/applications/:id', authenticateToken, async (req: express.Request, res: Response) => {
  try {
    const user = (req as any).user as UserPayload
    const { id } = req.params
    const application = await researchApplicationService.getApplicationById(id)

    if (!application) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Application not found',
        error: 'Not found'
      })
    }

    if (application.user_id !== user.id && user.tier !== UserTier.ADMIN) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Access denied',
        error: 'Forbidden'
      })
    }

    res.json({
      success: true,
      data: application,
      message: 'Application retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Get application error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve application',
      error: 'Internal server error'
    })
  }
})

const reviewApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  reviewNotes: z.string().max(1000, 'Review notes too long').optional()
})

router.put('/applications/:id/review', authenticateToken, requireAdmin, async (req: express.Request, res: Response) => {
  try {
    const user = (req as any).user as UserPayload
    const { id } = req.params
    const { status, reviewNotes } = reviewApplicationSchema.parse(req.body)

    if (status === ApplicationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cannot set status back to pending',
        error: 'Invalid status'
      })
    }

    const application = await researchApplicationService.updateApplicationStatus(
      id,
      {
        status,
        reviewNotes,
        reviewedBy: user.id
      }
    )

    res.json({
      success: true,
      data: application,
      message: `Application ${status.toLowerCase()} successfully`,
      error: null
    })
  } catch (error) {
    console.error('Review application error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation error',
        error: error.errors
      })
    }

    res.status(400).json({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to review application',
      error: 'Bad request'
    })
  }
})

router.get('/applications/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await researchApplicationService.getApplicationStats()

    res.json({
      success: true,
      data: stats,
      message: 'Application statistics retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Get application stats error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve application statistics',
      error: 'Internal server error'
    })
  }
})

router.get('/tools', authenticateToken, async (req, res) => {
  try {
    const tools = researchApplicationService.getAvailableResearchTools()

    res.json({
      success: true,
      data: tools,
      message: 'Research tools retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Get research tools error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to retrieve research tools',
      error: 'Internal server error'
    })
  }
})

export default router