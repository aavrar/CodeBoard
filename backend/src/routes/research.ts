import express, { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { researchApplicationService } from '../services/researchApplicationService'
import { ApplicationStatus, UserTier, UserPayload, researchApplicationSchema } from '../types/index'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET!

interface AuthenticatedRequest extends Request {
  user: UserPayload
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'No valid token provided',
      error: 'Unauthorized'
    })
  }

  try {
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid token',
      error: 'Unauthorized'
    })
  }
}

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user.tier !== UserTier.ADMIN) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Admin access required',
      error: 'Forbidden'
    })
  }
  next()
}

router.post('/applications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = researchApplicationSchema.parse(req.body)

    const application = await researchApplicationService.createApplication(
      req.user.id,
      validatedData
    )

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

router.get('/applications/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applications = await researchApplicationService.getUserApplications(req.user.id)

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
    const applications = await researchApplicationService.getPendingApplications()

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

router.get('/applications/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    if (application.userId !== req.user.id && req.user.tier !== UserTier.ADMIN) {
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

router.put('/applications/:id/review', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    const application = await researchApplicationService.reviewApplication(
      id,
      req.user.id,
      status,
      reviewNotes
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