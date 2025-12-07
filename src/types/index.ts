// =====================
// USER TYPES
// =====================
export interface User {
  id: string
  email: string
  nama: string
  is_active?: boolean
  is_verified?: boolean
  created_at: string
  updated_at?: string
  last_login?: string
}

export interface AuthUser {
  userId: string
  email: string
  nama: string
}

export interface TokenPayload {
  userId: string
  email: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
  iss?: string
}

// =====================
// BUSINESS TYPES
// =====================
export interface Business {
  id: string
  user_id: string
  nama_usaha: string
  jenis_usaha: string
  deskripsi?: string | null
  modal_awal?: number | null
  pendapatan_bulanan?: number | null
  pengeluaran_bulanan?: number | null
  jumlah_karyawan?: number | null
  lokasi?: string | null
  tantangan?: string[] | null
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface CreateBusinessInput {
  namaUsaha: string
  jenisUsaha: string
  deskripsi?: string | null
  modalAwal?: number | null
  pendapatanBulanan?: number | null
  pengeluaranBulanan?: number | null
  jumlahKaryawan?: number | null
  lokasi?: string | null
  tantangan?: string[] | null
}

export interface UpdateBusinessInput extends Partial<CreateBusinessInput> {}

// =====================
// CHAT TYPES
// =====================
export interface ChatMessage {
  id: string
  user_id: string
  business_id?: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used?: number
  created_at: string
  isStreaming?: boolean // Frontend only
}

export interface ChatMessageInput {
  message: string
  businessId?: string | null
}

// =====================
// ANALYTICS TYPES
// =====================
export interface AnalyticsData {
  pendapatan_bulanan: number
  pengeluaran_bulanan: number
  profit_bulanan: number
  profit_margin: number
  burn_rate: number
  runway_months: number
  growth_potential: string
  modal_awal: number
  roi: number
}

export interface AnalyticsResponse {
  analytics: AnalyticsData
  insights: string
  business: {
    id: string
    nama: string
    jenis: string
  }
  generatedAt: string
}

export interface AnalyticsSnapshot {
  id: string
  business_id: string
  user_id: string
  analytics_data: AnalyticsData
  ai_insights: string
  created_at: string
}

// =====================
// API RESPONSE TYPES
// =====================
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: FieldError[]
}

export interface FieldError {
  field: string
  message: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

// =====================
// AUTH TYPES
// =====================
export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  nama: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

// =====================
// API USAGE TYPES
// =====================
export interface ApiUsage {
  id: string
  user_id: string
  endpoint: string
  method: string
  tokens_used: number
  response_time_ms: number
  status_code: number
  ip_address: string
  user_agent: string
  created_at: string
}

// =====================
// AUDIT LOG TYPES
// =====================
export interface AuditLog {
  id: string
  user_id?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity_type: string
  entity_id?: string
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// =====================
// RATE LIMIT TYPES
// =====================
export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  limit: number
}

export type RateLimitType = 'default' | 'auth' | 'chat'

// =====================
// ERROR TYPES
// =====================
export interface ApiError {
  status: number
  message: string
  errors?: FieldError[]
  retry?: boolean
}

// =====================
// UTILITY TYPES
// =====================
export type Nullable<T> = T | null
export type Optional<T> = T | undefined

// Make all properties optional and nullable
export type PartialNullable<T> = {
  [P in keyof T]?: T[P] | null
}