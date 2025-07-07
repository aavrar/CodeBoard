import { Router } from 'express';
import { z } from 'zod';
import { VotingService } from '../services/votingService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Validation schemas
const voteSchema = z.object({
  exampleId: z.string().min(1), // Changed from .uuid() to .min(1) to support CUIDs
  voteType: z.enum(['accurate', 'inaccurate', 'helpful', 'unhelpful']),
  confidence: z.number().min(1).max(5).optional(),
  comment: z.string().max(500).optional()
});

const manualTagSchema = z.object({
  exampleId: z.string().min(1), // Changed from .uuid() to .min(1) to support CUIDs
  switchPoints: z.array(z.number().min(0)),
  segments: z.array(z.object({
    text: z.string(),
    language: z.string(),
    startIndex: z.number().min(0),
    endIndex: z.number().min(0),
    confidence: z.number().min(0).max(1),
    userTagged: z.boolean().optional()
  })),
  notes: z.string().max(1000).optional(),
  confidenceScore: z.number().min(0).max(1).optional()
});

/**
 * Submit or update a vote for an example
 * POST /api/voting/examples/:id/vote
 */
router.post('/examples/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id: exampleId } = req.params;
    const userId = req.user!.id;
    
    // Validate request body
    const validatedData = voteSchema.parse({
      exampleId,
      ...req.body
    });
    
    const result = await VotingService.submitVote({
      exampleId: validatedData.exampleId,
      userId,
      voteType: validatedData.voteType,
      confidence: validatedData.confidence,
      comment: validatedData.comment
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Update verification status after vote
    await VotingService.updateVerificationStatus(exampleId);

    res.json({
      success: true,
      data: result.data,
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Remove a vote
 * DELETE /api/voting/examples/:id/vote/:voteType
 */
router.delete('/examples/:id/vote/:voteType', authenticateToken, async (req, res) => {
  try {
    const { id: exampleId, voteType } = req.params;
    const userId = req.user!.id;
    
    // Validate vote type
    if (!['accurate', 'inaccurate', 'helpful', 'unhelpful'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote type'
      });
    }
    
    const result = await VotingService.removeVote(exampleId, userId, voteType);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Update verification status after vote removal
    await VotingService.updateVerificationStatus(exampleId);

    res.json({
      success: true,
      message: 'Vote removed successfully'
    });
  } catch (error) {
    console.error('Vote removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get vote statistics for an example
 * GET /api/voting/examples/:id/stats
 */
router.get('/examples/:id/stats', async (req, res) => {
  try {
    const { id: exampleId } = req.params;
    const userId = req.user?.id; // Optional - depends on auth
    
    const result = await VotingService.getVoteStats(exampleId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Vote stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Submit manual tags for an example
 * POST /api/voting/examples/:id/tags
 */
router.post('/examples/:id/tags', authenticateToken, async (req, res) => {
  try {
    const { id: exampleId } = req.params;
    const userId = req.user!.id;
    
    // Validate request body
    const validatedData = manualTagSchema.parse({
      exampleId,
      ...req.body
    });
    
    const result = await VotingService.submitManualTag({
      exampleId: validatedData.exampleId,
      userId,
      switchPoints: validatedData.switchPoints,
      segments: validatedData.segments,
      notes: validatedData.notes,
      confidenceScore: validatedData.confidenceScore
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Update verification status after manual tagging
    await VotingService.updateVerificationStatus(exampleId);

    res.json({
      success: true,
      data: result.data,
      message: 'Manual tags submitted successfully'
    });
  } catch (error) {
    console.error('Manual tag submission error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get manual tags for an example
 * GET /api/voting/examples/:id/tags
 */
router.get('/examples/:id/tags', async (req, res) => {
  try {
    const { id: exampleId } = req.params;
    
    const result = await VotingService.getManualTags(exampleId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Manual tags fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get user's contributions and stats
 * GET /api/voting/users/:id/contributions
 */
router.get('/users/:id/contributions', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.params;
    const requestingUserId = req.user!.id;
    
    // Users can only view their own contributions unless they're admin
    if (userId !== requestingUserId && req.user!.tier !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const result = await VotingService.getUserContributions(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('User contributions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get community leaderboard
 * GET /api/voting/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit cannot exceed 50'
      });
    }
    
    const result = await VotingService.getLeaderboard(limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;