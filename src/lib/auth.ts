import { SignJWT, jwtVerify, JWTPayload } from "jose";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { config } from "../config";
import { supabaseAdmin, type Database } from "./supabase";
import { cookies } from "next/headers";

export interface TokenPayload extends JWTPayload {
    userId: string
    email: string
    type: 'access' | 'refresh'
}

export interface AuthUser {
    userId: string
    email: string
    nama: string
}

const encodeSecret = (secreat: string) => new TextEncoder().encode(secreat);
const admin = supabaseAdmin as SupabaseClient<Database>;

export async function generateAccessToken(userId: string, email: string): Promise<string> {
    return new SignJWT({ userId, email, type: 'access'})
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(config.jwt.accessTokenExpiresIn)
        .setIssuer(config.appName)
        .sign(encodeSecret(config.jwt.accessSecret))
}

export async function generateRefreshToken(userId: string, email: string): Promise<string> {
    return new SignJWT({ userId, email, type: 'refresh'})
        .setProtectedHeader({alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(config.jwt.refreshExpiresIn)
        .setIssuer(config.appName)
        .sign(encodeSecret(config.jwt.refreshSecret))
}

export async function generateToken(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
        generateAccessToken(userId, email),
        generateRefreshToken(userId, email),
    ])


    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    const refreshTokenRow = {
        user_id: userId,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    } satisfies Database['public']['Tables']['refresh_tokens']['Insert']

    await (admin.from('refresh_tokens') as any)
        .upsert(refreshTokenRow, { onConflict: 'user_id' })
    return {accessToken, refreshToken}
}
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
        const {payload} = await jwtVerify(token, encodeSecret(config.jwt.accessSecret), {issuer: config.appName})
        if (payload.type !== 'access') return null
        return payload as TokenPayload
    } catch {
        return null
    }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
        const {payload} = await jwtVerify(token, encodeSecret(config.jwt.refreshSecret), {issuer: config.appName})
        if (payload.type !== 'refresh') return null
        return payload as TokenPayload
    } catch {
        return null
    }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
    const authHeader = request.headers.get('Authorization')
    let token: string | null = null

    if(authHeader?.startsWith('Bearer')) {
        token = authHeader.slice(7)
    } else {
        token = request.cookies.get('access_token')?.value || null
    }

    if (!token) return null

    const payload = await verifyAccessToken(token)
    if(!payload) return null

    const { data: user, error } = await (admin
        .from('users')
        .select('id, email, nama')
        .eq('id', payload.userId)
        .single()) as { data: { id: string; email: string; nama: string } | null; error: any }

    if (error || !user) return null

    return {
        userId: user.id,
        email: user.email,
        nama: user.nama,
    }
}

//Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds)
}

//Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

//Set auth cookies
export async function setAuthCookies(accessToken: string, refreshToken: string){
    const cookieStrore =  await cookies();

    cookieStrore.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,  // 15 minutes
        path:  '/'
    })
    cookieStrore.set('refresh_token', refreshToken,  {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
    }) 
}

// Clear auth cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
}

// Revoke refresh token
export async function revokeRefreshToken(userId: string) {
  await (admin.from('refresh_tokens') as any)
    .delete()
    .eq('user_id', userId)
}

// Check login attempts (brute force protection)
export async function checkLoginAttempts(email: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const { data } = await (admin.from('login_attempts') as any)
    .select('attempts, locked_until')
    .eq('email', email.toLowerCase())
    .single() as { data: { attempts: number; locked_until: string | null } | null }
  
  if (!data) {
    return { allowed: true, remainingAttempts: config.security.maxLoginAttempts }
  }
  
  // Check if locked
  if (data.locked_until && new Date(data.locked_until) > new Date()) {
    return { allowed: false, remainingAttempts: 0 }
  }
  
  const remainingAttempts = config.security.maxLoginAttempts - data.attempts
  return { allowed: remainingAttempts > 0, remainingAttempts }
}

// Record failed login attempt
export async function recordFailedLogin(email: string) {
  const { data } = await (admin.from('login_attempts') as any)
    .select('attempts')
    .eq('email', email.toLowerCase())
    .single() as { data: { attempts: number } | null }
  
  const attempts = (data?.attempts || 0) + 1
  const lockedUntil = attempts >= config.security.maxLoginAttempts
    ? new Date(Date.now() + config.security.lockoutDuration).toISOString()
    : null
  
  await (admin.from('login_attempts') as any)
    .upsert({
      email: email.toLowerCase(),
      attempts,
      locked_until: lockedUntil,
      updated_at: new Date().toISOString(),
    })
}

// Clear login attempts on successful login
export async function clearLoginAttempts(email: string) {
  await (admin.from('login_attempts') as any)
    .delete()
    .eq('email', email.toLowerCase())
}