import { LRUCache } from "lru-cache";
import { config } from "../config";
import { en } from "zod/locales";

interface RateLimiterEntry {
    count: number
    resetTime: number
}

const rateLImiterCache = new LRUCache<string, RateLimiterEntry>({
    max: 10000,
    ttl: config.rateLimit.windowMS,
})

export type RateLimiterType = 'default' | 'auth' | 'chat';

export interface RateLimitResult {
    success: boolean
    remaining: number
    reset: number
    limit: number
}

export function rateLimit(
    identifier: string,
    type: RateLimiterType = 'default'
): RateLimitResult {
    const now = Date.now()
    const limit = config.rateLimit.maxRequest[type]
    const key = `${type}:${identifier}`

    const entry = rateLImiterCache.get(key)

    if (!entry || now > entry.resetTime) {
        rateLImiterCache.set(key, {
            count: 1,
            resetTime: now + config.rateLimit.windowMS,
        })
        return {
            success: true,
            remaining: limit - 1,
            reset: now + config.rateLimit.windowMS,
            limit,
        }
    } 

    entry.count ++
    rateLImiterCache.set(key, entry)

    const remaining = Math.max(0, limit - entry.count)

    return {
        success: entry.count <= limit,
        remaining,
        reset: entry.resetTime,
        limit,
    }
}

export function getClientIdentifier(request: Request): string {
    const forward = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfIp = request.headers.get('cf-connecting-ip')

    if (forward) {
        return forward.split(',')[0].trim()
    }
    if (realIp) {
        return realIp
    }
    if (cfIp) {
        return cfIp
    }
    return 'unknown'
}   