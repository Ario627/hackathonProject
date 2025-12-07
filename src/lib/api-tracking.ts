import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase'
import { getClientIdentifier } from './rate-limit'

interface TrackingData {
  userId?: string
  endpoint: string
  method: string
  tokensUsed?: number
  responseTimeMs: number
  statusCode: number
  request: NextRequest
}

export async function trackApiUsage(data: TrackingData): Promise<void> {
  try {
    const ipAddress = getClientIdentifier(data.request)
    const userAgent = data.request.headers.get('user-agent') || ''
    
    await (supabaseAdmin.from('api_usage') as any).insert({
      user_id: data.userId || null,
      endpoint: data.endpoint,
      method: data.method,
      tokens_used: data.tokensUsed || 0,
      response_time_ms: data.responseTimeMs,
      status_code: data.statusCode,
      ip_address: ipAddress,
      user_agent: userAgent.slice(0, 500), // Limit length
    })
  } catch (error) {
    // Don't throw - tracking failure shouldn't break the request
    console.error('API Tracking Error:', error)
  }
}

// Helper to measure response time
export function createTimer(): { end: () => number } {
  const start = performance.now()
  return {
    end: () => Math.round(performance.now() - start),
  }
}