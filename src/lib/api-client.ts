interface ApiClientConfig {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string>
}

interface ApiError {
  status: number
  message: string
  errors?: { field: string; message: string }[]
  retry?: boolean
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private isRefreshing: boolean = false
  private refreshSubscribers: ((token: string) => void)[] = []
  
  constructor(config: ApiClientConfig = {}) {
    this. baseUrl = config. baseUrl || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config. defaultHeaders,
    }
  }
  
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }
  
  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token))
    this.refreshSubscribers = []
  }
  
  private async handleResponse<T>(response: Response, retryFn?: () => Promise<T>): Promise<T> {
    const data = await response.json()
    
    if (!response.ok) {
      // Handle 401 - try refresh token
      if (response.status === 401 && retryFn) {
        if (! this.isRefreshing) {
          this.isRefreshing = true
          
          try {
            const refreshed = await this.refreshToken()
            this.isRefreshing = false
            
            if (refreshed) {
              this.onTokenRefreshed('refreshed')
              return retryFn()
            }
          } catch {
            this.isRefreshing = false
          }
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login? expired=true'
          }
        }
        
        // Wait for token refresh
        return new Promise((resolve) => {
          this.subscribeTokenRefresh(async () => {
            resolve(await retryFn())
          })
        })
      }
      
      const error: ApiError = {
        status: response.status,
        message: data. error || 'Terjadi kesalahan',
        errors: data.errors,
      }
      
      throw error
    }
    
    return data
  }
  
  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      return response.ok
    } catch {
      return false
    }
  }
  
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ... fetchConfig } = config
    
    let url = `${this.baseUrl}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }
    
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(url, {
        ...fetchConfig,
        method: 'GET',
        headers: { ...this. defaultHeaders, ...fetchConfig.headers },
        credentials: 'include',
      })
      return this.handleResponse<T>(response, makeRequest)
    }
    
    return makeRequest()
  }
  
  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...config,
        method: 'POST',
        headers: { ...this.defaultHeaders, ... config.headers },
        credentials: 'include',
        body: data ? JSON. stringify(data) : undefined,
      })
      return this. handleResponse<T>(response, makeRequest)
    }
    
    return makeRequest()
  }
  
  async put<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ... config,
        method: 'PUT',
        headers: { ...this.defaultHeaders, ...config.headers },
        credentials: 'include',
        body: data ?  JSON.stringify(data) : undefined,
      })
      return this.handleResponse<T>(response, makeRequest)
    }
    
    return makeRequest()
  }
  
  async patch<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ... config,
        method: 'PATCH',
        headers: { ...this.defaultHeaders, ...config. headers },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      })
      return this.handleResponse<T>(response, makeRequest)
    }
    
    return makeRequest()
  }
  
  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const makeRequest = async (): Promise<T> => {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...config,
        method: 'DELETE',
        headers: { ...this. defaultHeaders, ...config.headers },
        credentials: 'include',
      })
      return this.handleResponse<T>(response, makeRequest)
    }
    
    return makeRequest()
  }
}

// Export singleton instance
export const api = new ApiClient()

// Type-safe API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { user: User; accessToken: string }; message: string }>(
      '/api/auth/login',
      { email, password }
    ),
  
  register: (email: string, password: string, nama: string, confirmPassword: string) =>
    api.post<{ success: boolean; data: { user: User; accessToken: string }; message: string }>(
      '/api/auth/register',
      { email, password, nama, confirmPassword }
    ),
  
  logout: () => api.post<{ success: boolean }>('/api/auth/logout'),
  
  refresh: () => api.post<{ success: boolean; data: { accessToken: string } }>('/api/auth/refresh'),
  
  me: () => api. get<{ success: boolean; data: { user: User } }>('/api/auth/me'),
}

export const businessApi = {
  list: (page = 1, limit = 20) =>
    api.get<{ success: boolean; data: { businesses: Business[]; pagination: Pagination } }>(
      '/api/business',
      { params: { page: String(page), limit: String(limit) } }
    ),
  
  get: (id: string) =>
    api.get<{ success: boolean; data: Business }>(`/api/business/${id}`),
  
  create: (data: CreateBusinessInput) =>
    api.post<{ success: boolean; data: Business; message: string }>('/api/business', data),
  
  update: (id: string, data: UpdateBusinessInput) =>
    api.put<{ success: boolean; data: Business; message: string }>(`/api/business/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/business/${id}`),
}

export const chatApi = {
  send: (message: string, businessId?: string) =>
    api.post<{ success: boolean; data: { message: string } }>('/api/chat', { message, businessId }),
  
  history: (page = 1, limit = 50) =>
    api.get<{ success: boolean; data: { messages: ChatMessage[]; pagination: Pagination } }>(
      '/api/chat',
      { params: { page: String(page), limit: String(limit) } }
    ),
  
  clear: () => api. delete<{ success: boolean; message: string }>('/api/chat'),
}

export const analyticsApi = {
  get: (businessId: string) =>
    api. get<{ success: boolean; data: AnalyticsResponse }>('/api/analytics', {
      params: { businessId },
    }),
}

// Types
interface User {
  id: string
  email: string
  nama: string
}

interface Business {
  id: string
  user_id: string
  nama_usaha: string
  jenis_usaha: string
  deskripsi?: string
  modal_awal?: number
  pendapatan_bulanan?: number
  pengeluaran_bulanan?: number
  jumlah_karyawan?: number
  lokasi?: string
  tantangan?: string[]
  created_at: string
  updated_at: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface CreateBusinessInput {
  namaUsaha: string
  jenisUsaha: string
  deskripsi?: string
  modalAwal?: number
  pendapatanBulanan?: number
  pengeluaranBulanan?: number
  jumlahKaryawan?: number
  lokasi?: string
  tantangan?: string[]
}

interface UpdateBusinessInput extends Partial<CreateBusinessInput> {}

interface AnalyticsResponse {
  analytics: {
    profit_margin: number
    burn_rate: number
    runway_months: number
    growth_potential: string
  }
  insights: string
  business: {
    nama: string
    jenis: string
  }
}