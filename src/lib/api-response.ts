import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { RateLimitResult } from "./rate-limit";

export interface ApiResponse<T = unknown> {
    success: boolean
    message?: string
    data?: T
    error?: ZodError
    errors?: {field: string, message:string}[]
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

export function errorResponse(
    error: string,
    status: number = 400,
    errors?: {field: string, message:string}[]
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            message: error,
            errors,
        },
        { status }
    )
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
    const errors= error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
    }))

    return NextResponse.json(
        {
            success: false,
            message: 'Validasi gagal',
            error,
            errors,
        },
        {
            status: 422,
        }
    )
}

// Rate limit exceeded response
export function rateLimitResponse(result: RateLimitResult): NextResponse<ApiResponse> {
  const response = NextResponse.json(
    {
      success: false,
      message: 'Terlalu banyak permintaan.  Coba lagi nanti.',
    },
    { status: 429 }
  )
  
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())
  response.headers.set('Retry-After', Math.ceil((result.reset - Date.now()) / 1000). toString())
  
  return response
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Silakan login terlebih dahulu'): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

// Forbidden response
export function forbiddenResponse(message: string = 'Anda tidak memiliki akses'): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

// Not found response
export function notFoundResponse(message: string = 'Data tidak ditemukan'): NextResponse<ApiResponse> {
  return errorResponse(message, 404)
}

// Internal error response (don't expose details)
export function internalErrorResponse(): NextResponse<ApiResponse> {
  return errorResponse('Terjadi kesalahan internal.  Silakan coba lagi. ', 500)
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers. set('X-RateLimit-Limit', result.limit. toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset. toString())
  return response
}