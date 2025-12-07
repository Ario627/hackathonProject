// src/lib/sanitize.ts

// --- Sanitize String (basic & fast, tanpa jsdom) ---
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    // remove <script> tags completely for safety
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // remove inline event handlers: onclick="", onerror="", etc
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    // escape < and >
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // remove control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 10000)
}

// --- Sanitize HTML (DOMPurify replacement) ---
export function sanitizeHtml(dirty: string): string {
  return sanitizeString(dirty)
}

// --- Recursively sanitize object values ---
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      )
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

// --- Optional DB sanitization (Supabase already safe) ---
export function sanitizeForDb(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '')
}
