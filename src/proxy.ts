import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from './lib/auth'
import { rateLimit, getClientIdentifier, RateLimiterType } from './lib/rate-limit'

// Routes that require authentication
const protectedRoutes = [
  '/api/chat',
  '/api/business',
  '/api/analytics',
]

// Routes with specific rate limits
const rateLimitConfig: Record<string, RateLimiterType> = {
  '/api/auth/login': 'auth',
  '/api/auth/register': 'auth',
  '/api/chat': 'chat',
}

// Public routes (no auth needed)
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip non-API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // Get client IP for rate limiting
  const clientIp = getClientIdentifier(request)
  
  // Determine rate limit type
  const rateLimitType = rateLimitConfig[pathname] || 'default'
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(clientIp, rateLimitType)
  
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Terlalu banyak permintaan. Coba lagi nanti.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult. limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset. toString(),
          'Retry-After': Math.ceil((rateLimitResult. reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes. some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname === route)
  
  if (isProtectedRoute && !isPublicRoute) {
    // Get token from header or cookie
    const authHeader = request.headers.get('Authorization')
    let token: string | undefined
    
    if (authHeader?. startsWith('Bearer ')) {
      token = authHeader.slice(7)
    } else {
      token = request.cookies. get('access_token')?. value
    }
    
    if (! token) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Silakan login terlebih dahulu',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Verify token
    const payload = await verifyAccessToken(token)
    
    if (!payload) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Sesi telah berakhir.  Silakan login kembali.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Add user info to headers for downstream use
    const response = NextResponse.next()
    response. headers.set('X-User-Id', payload.userId)
    response.headers.set('X-User-Email', payload.email)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult. remaining.toString())
    response.headers. set('X-RateLimit-Reset', rateLimitResult. reset.toString())
    
    return response
  }
  
  // Add CORS headers for API routes
  const response = NextResponse. next()
  
  // Add security headers
  response. headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult. remaining.toString())
  response.headers. set('X-RateLimit-Reset', rateLimitResult. reset.toString())
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}