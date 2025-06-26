import { Router } from 'express'

export const authRoutes = Router()

// Placeholder route - will implement properly later
authRoutes.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Auth routes ready' },
    message: 'Auth system placeholder',
    error: null
  })
})