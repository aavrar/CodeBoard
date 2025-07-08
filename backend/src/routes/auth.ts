import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { supabase, tables, handleSupabaseError, User } from '../utils/supabase.js';
import { ApiResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';
export const authRoutes = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

authRoutes.post('/register', asyncHandler(async (req: Request, res: Response) => {
  console.log('[Auth Register] Registration attempt for:', req.body.email)
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from(tables.users)
    .select('id')
    .eq('email', validatedData.email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found (expected)
    console.error('[Auth Register] Database lookup error:', checkError)
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Database error during registration',
      error: 'Internal server error',
    });
  }

  if (existingUser) {
    console.log('[Auth Register] User already exists:', validatedData.email)
    return res.status(409).json({
      success: false,
      data: null,
      message: 'User with this email already exists',
      error: 'Conflict',
    });
  }

  console.log('[Auth Register] Creating new user for:', validatedData.email)
  const passwordHash = await bcrypt.hash(validatedData.password, 10);

  // Create new user
  const { data: user, error: createError } = await supabase
    .from(tables.users)
    .insert({
      email: validatedData.email,
      password_hash: passwordHash,
      name: validatedData.name,
      tier: 'COMMUNITY',
      auth_provider: 'EMAIL',
      email_verified: false,
      is_active: true,
      preferred_tools: []
    })
    .select()
    .single();

  if (createError) {
    console.error('[Auth Register] User creation failed:', createError)
    return res.status(500).json({
      success: false,
      data: null,
      message: 'Failed to create user account',
      error: 'Database error',
    });
  }

  console.log('[Auth Register] User created successfully:', user.id)

  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  const userPayload = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    tier: user.tier,
    authProvider: user.auth_provider
  };
  
  const signOptions: SignOptions = { expiresIn: jwtExpiresIn as any };
  const token = jwt.sign(userPayload, jwtSecret, signOptions);

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
  };

  const response: ApiResponse = {
    success: true,
    data: { user: mappedUser, token },
    message: 'User registered successfully',
    error: null,
  };

  res.status(201).json(response);
}));

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRoutes.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  // Find user by email
  const { data: user, error: findError } = await supabase
    .from(tables.users)
    .select('*')
    .eq('email', validatedData.email)
    .eq('is_active', true)
    .single();

  if (findError || !user) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  }

  const isPasswordValid = user.password_hash 
    ? await bcrypt.compare(validatedData.password, user.password_hash)
    : false;

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  }

  // Update last login time
  await supabase
    .from(tables.users)
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  const userPayload = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    tier: user.tier,
    authProvider: user.auth_provider
  };
  
  const signOptions: SignOptions = { expiresIn: jwtExpiresIn as any };
  const token = jwt.sign(userPayload, jwtSecret, signOptions);

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
  };

  const response: ApiResponse = {
    success: true,
    data: { user: mappedUser, token },
    message: 'User logged in successfully',
    error: null,
  };

  res.json(response);
}));

authRoutes.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { data: user, error: findError } = await supabase
    .from(tables.users)
    .select('*')
    .eq('id', (req as any).user!.id)
    .eq('is_active', true)
    .single();

  if (findError || !user) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'User not found',
      error: 'Not Found',
    });
  }

  const response: ApiResponse = {
    success: true,
    data: user,
    message: 'User retrieved successfully',
    error: null,
  };

  res.json(response);
}));