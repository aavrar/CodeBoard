import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiResponse } from '../types/index.js'

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500
  let message = 'Internal server error'
  
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  })

  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err instanceof ZodError) {
    statusCode = 400
    message = 'Invalid input data'
    const validationErrors = err.errors.map(error => 
      `${error.path.join('.')}: ${error.message}`
    ).join(', ')
    message = `Validation error: ${validationErrors}`
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid authentication token'
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Authentication token expired'
  } else if (err.message.includes('unique constraint')) {
    statusCode = 409
    message = 'Resource already exists'
  }

  const response: ApiResponse = {
    success: false,
    data: null,
    message: 'Request failed',
    error: message
  }

  res.status(statusCode).json(response)
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}