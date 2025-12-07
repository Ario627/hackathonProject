import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import {
  verifyPassword,
  generateToken,
  setAuthCookies,
  checkLoginAttempts,
  recordFailedLogin,
  clearLoginAttempts,
} from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { sanitizeObject } from '@/lib/sanitize'
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  internalErrorResponse,
} from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)
    
    // Validate input
    const validation = loginSchema.safeParse(sanitizedBody)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { email, password } = validation.data
    
    // Check login attempts (brute force protection)
    const loginCheck = await checkLoginAttempts(email)
    if (! loginCheck.allowed) {
      return errorResponse(
        'Akun terkunci sementara karena terlalu banyak percobaan login.  Coba lagi dalam 15 menit.',
        429
      )
    }
    
    // Get user
    const { data: user } = await (supabaseAdmin
      .from('users') as any)
      .select('id, email, nama, password_hash')
      .eq('email', email)
      .single() as { data: { id: string; email: string; nama: string; password_hash: string } | null }
    
    if (!user) {
      await recordFailedLogin(email)
      return errorResponse(
        `Email atau password salah. ${loginCheck.remainingAttempts - 1} percobaan tersisa.`,
        401
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      await recordFailedLogin(email)
      return errorResponse(
        `Email atau password salah.  ${loginCheck.remainingAttempts - 1} percobaan tersisa.`,
        401
      )
    }
    
    // Clear failed login attempts
    await clearLoginAttempts(email)
    
    // Generate tokens
    const tokens = await generateToken(user.id, user.email)
    
    // Set cookies
    await setAuthCookies(tokens.accessToken, tokens.refreshToken)
    
    // Update last login
    await (supabaseAdmin
      .from('users') as any)
      .update({ last_login: new Date().toISOString() })
      .eq('id', user!.id)
    
    return successResponse(
      {
        user: {
          id: user!.id,
          email: user!.email,
          nama: user!.nama,
        },
        accessToken: tokens.accessToken,
      },
      'Login berhasil!'
    )
  } catch (error) {
    console. error('Login Error:', error)
    return internalErrorResponse()
  }
}