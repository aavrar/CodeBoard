import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler.js'
import { UserPayload } from '../types/index.js'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    throw new AppError('Access token required', 401)
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new AppError('JWT configuration error', 500)
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as UserPayload
    req.user = decoded
    next()
  } catch (error) {
    throw new AppError('Invalid or expired token', 401)
  }
}

// Role-based access control middleware
export const requireTier = (requiredTier: 'COMMUNITY' | 'RESEARCHER' | 'ADMIN') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }

    const tierHierarchy = {
      'COMMUNITY': 1,
      'RESEARCHER': 2,
      'ADMIN': 3
    }

    const userTierLevel = tierHierarchy[req.user.tier as keyof typeof tierHierarchy]
    const requiredTierLevel = tierHierarchy[requiredTier]

    if (userTierLevel < requiredTierLevel) {
      throw new AppError(`${requiredTier} access required`, 403)
    }

    next()
  }
}

// Convenience middleware for specific tiers
export const requireResearcher = requireTier('RESEARCHER')
export const requireAdmin = requireTier('ADMIN')

// Check if user owns resource or is admin
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401)
    }

    // Admin can access anything
    if (req.user.tier === 'ADMIN') {
      return next()
    }

    // Check ownership
    const resourceUserId = req.params[userIdField] || req.body[userIdField]
    
    if (req.user.id !== resourceUserId) {
      throw new AppError('Access denied: insufficient permissions', 403)
    }

    next()
  }
}