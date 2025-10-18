import express from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabase, tables, handleSupabaseError, User } from '../utils/supabase.js'
import { oauthService } from '../services/oauthService'
import { AuthProvider, UserTier, OAuthCallbackData, RegisterData, UserPayload } from '../types/index'
import { asyncHandler } from '../middleware/errorHandler.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

router.get('/google', (req, res) => {
  try {
    const authUrl = oauthService.generateGoogleAuthUrl()
    res.redirect(authUrl)
  } catch (error) {
    console.error('Google OAuth URL generation error:', error)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/auth/error?error=oauth_not_configured&provider=google`)
  }
})

router.get('/github', (req, res) => {
  try {
    const authUrl = oauthService.generateGitHubAuthUrl()
    res.redirect(authUrl)
  } catch (error) {
    console.error('GitHub OAuth URL generation error:', error)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/auth/error?error=oauth_not_configured&provider=github`)
  }
})

router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_denied`)
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=missing_code`)
    }

    const { tokens, profile } = await oauthService.exchangeGoogleCode(code as string)

    if (!profile.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=no_email`)
    }

    const tier = oauthService.detectUserTier(profile.email)

    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from(tables.users)
      .select('*')
      .eq('email', profile.email)
      .single()

    let user: User

    if (existingUser && !findError) {
      // Update existing user
      const updateData: any = {
        auth_provider: AuthProvider.GOOGLE,
        provider_user_id: profile.id,
        email_verified: profile.verified_email || false,
        last_login_at: new Date().toISOString()
      }
      
      // Upgrade to researcher if eligible
      if (tier === UserTier.RESEARCHER && existingUser.tier === UserTier.COMMUNITY) {
        updateData.tier = UserTier.RESEARCHER
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from(tables.users)
        .update(updateData)
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        handleSupabaseError(updateError, 'user update')
      }
      user = updatedUser
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from(tables.users)
        .insert({
          email: profile.email,
          name: profile.name,
          display_name: profile.name,
          profile_image: profile.picture,
          tier,
          auth_provider: AuthProvider.GOOGLE,
          provider_user_id: profile.id,
          email_verified: profile.verified_email || false,
          is_active: true,
          preferred_tools: [],
          last_login_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        handleSupabaseError(createError, 'user creation')
      }
      user = newUser
    }

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      tier: user.tier as UserTier,
      authProvider: user.auth_provider as AuthProvider
    }

    const token = generateToken(userPayload)

    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&tier=${user.tier}`)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=server_error`)
  }
})

router.get('/github/callback', async (req, res) => {
  try {
    const { code, error } = req.query

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_denied`)
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=missing_code`)
    }

    const { tokens, profile } = await oauthService.exchangeGitHubCode(code as string)

    if (!profile.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=no_email`)
    }

    const tier = oauthService.detectUserTier(profile.email)

    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from(tables.users)
      .select('*')
      .eq('email', profile.email)
      .single()

    let user: User

    if (existingUser && !findError) {
      // Update existing user
      const updateData: any = {
        auth_provider: AuthProvider.GITHUB,
        provider_user_id: profile.id,
        email_verified: true,
        last_login_at: new Date().toISOString()
      }
      
      // Upgrade to researcher if eligible
      if (tier === UserTier.RESEARCHER && existingUser.tier === UserTier.COMMUNITY) {
        updateData.tier = UserTier.RESEARCHER
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from(tables.users)
        .update(updateData)
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        handleSupabaseError(updateError, 'user update')
      }
      user = updatedUser
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from(tables.users)
        .insert({
          email: profile.email,
          name: profile.name,
          display_name: profile.name,
          profile_image: profile.picture,
          tier,
          auth_provider: AuthProvider.GITHUB,
          provider_user_id: profile.id,
          email_verified: true,
          is_active: true,
          preferred_tools: [],
          last_login_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        handleSupabaseError(createError, 'user creation')
      }
      user = newUser
    }

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      tier: user.tier as UserTier,
      authProvider: user.auth_provider as AuthProvider
    }

    const token = generateToken(userPayload)

    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}&tier=${user.tier}`)
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=server_error`)
  }
})

router.post('/register', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const validatedData = req.body as RegisterData

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from(tables.users)
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser && !checkError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'User already exists',
        error: 'Email already registered'
      })
    }

    const tier = oauthService.detectUserTier(validatedData.email)
    
    const userData: any = {
      email: validatedData.email,
      name: validatedData.name,
      display_name: validatedData.displayName || validatedData.name,
      bio: validatedData.bio,
      tier,
      auth_provider: validatedData.authProvider || AuthProvider.EMAIL,
      email_verified: false,
      is_active: true,
      preferred_tools: []
    }

    if (validatedData.password && validatedData.authProvider === AuthProvider.EMAIL) {
      userData.password_hash = await bcrypt.hash(validatedData.password, 12)
    }

    const { data: user, error: createError } = await supabase
      .from(tables.users)
      .insert(userData)
      .select()
      .single()

    if (createError) {
      handleSupabaseError(createError, 'user creation')
    }

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      tier: user.tier as UserTier,
      authProvider: user.auth_provider as AuthProvider
    }

    const token = generateToken(userPayload)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          authProvider: user.authProvider
        },
        token
      },
      message: 'User registered successfully',
      error: null
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: 'Registration failed',
      error: 'Internal server error'
    })
  }
}))

router.get('/user', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    console.log('[OAuth User] Request received')
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[OAuth User] No valid auth header:', authHeader)
      return res.status(401).json({
        success: false,
        data: null,
        message: 'No valid token provided',
        error: 'Unauthorized'
      })
    }

    const token = authHeader.substring(7)
    console.log('[OAuth User] Attempting to verify token:', token.substring(0, 20) + '...')
    console.log('[OAuth User] JWT_SECRET defined:', !!JWT_SECRET)
    
    let decoded: UserPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as UserPayload
      console.log('[OAuth User] Token decoded successfully for user:', decoded.id)
    } catch (jwtError) {
      console.error('[OAuth User] JWT verification failed:', jwtError)
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid or expired token',
        error: 'JWT verification failed'
      })
    }

    const { data: user, error: findError } = await supabase
      .from(tables.users)
      .select(`
        id,
        email,
        name,
        display_name,
        bio,
        profile_image,
        tier,
        auth_provider,
        email_verified,
        created_at,
        preferred_tools
      `)
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single()

    if (findError) {
      console.error('[OAuth User] Database error:', findError)
      handleSupabaseError(findError, 'user lookup')
    }

    if (!user) {
      console.log('[OAuth User] User not found for ID:', decoded.id)
      return res.status(404).json({
        success: false,
        data: null,
        message: 'User not found',
        error: 'User does not exist'
      })
    }

    console.log('[OAuth User] User found successfully:', user.email)
    
    // Map database fields to frontend expected format
    const mappedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.display_name,
      bio: user.bio,
      profileImage: user.profile_image,
      tier: user.tier,
      authProvider: user.auth_provider,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      preferredTools: user.preferred_tools
    }
    
    res.json({
      success: true,
      data: mappedUser,
      message: 'User retrieved successfully',
      error: null
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid token',
      error: 'Unauthorized'
    })
  }
}))


export default router