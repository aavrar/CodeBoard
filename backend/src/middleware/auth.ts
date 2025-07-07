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