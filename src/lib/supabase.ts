import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config";
import { th } from "zod/locales";

// Database types 
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          nama: string
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          nama_usaha: string
          jenis_usaha: string
          deskripsi: string | null
          modal_awal: number | null
          pendapatan_bulanan: number | null
          pengeluaran_bulanan: number | null
          jumlah_karyawan: number | null
          lokasi: string | null
          tantangan: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          role: 'user' | 'assistant' | 'system'
          content: string
          tokens_used: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      refresh_tokens: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['refresh_tokens']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['refresh_tokens']['Insert']>
      }
      login_attempts: {
        Row: {
          id: string
          email: string
          attempts: number
          locked_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['login_attempts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['login_attempts']['Insert']>
      }
      analytics_snapshots: {
        Row: {
          id: string
          business_id: string
          user_id: string
          analytics_data: Record<string, unknown>
          ai_insights: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analytics_snapshots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['analytics_snapshots']['Insert']>
      }
      api_usage: {
        Row: {
          id: string
          user_id: string | null
          endpoint: string
          method: string
          tokens_used: number
          response_time_ms: number | null
          status_code: number | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['api_usage']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['api_usage']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_data: Record<string, unknown> | null
          new_data: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

//Singleton pattern supabase clients
let supabaseInstance: SupabaseClient<Database> | null = null
let supabaseAdminInstance: SupabaseClient<Database> | null = null

//Client-side 
export function getSupabase(): SupabaseClient<Database> {
    if(!supabaseInstance) {
        supabaseInstance = createClient<Database>(
            config.supabase.url,
            config.supabase.anonKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                },
            }
        )
    }
    return supabaseInstance
}

//Server-side admin privileges
export function getSupabaseAdmin(): SupabaseClient<Database> {
    if(!supabaseAdminInstance) {
        supabaseAdminInstance = createClient<Database>(
            config.supabase.url,
            config.supabase.serviceKey,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                },
            }
        )
    }
    return supabaseAdminInstance
}

//export
export const supabase = getSupabase()
export const supabaseAdmin = getSupabaseAdmin()

//helper
export function handleSupabaseError(error: any): never {
    if(error && typeof error === 'object' && 'message' in error) {
        const err = error as {message: string, code?: string}

        //handle spesific
        if(err.code === '23505') {
            throw new Error('Data sudah ada')
        }
        if(err.code === '23503') {
            throw new Error('Data terkait tidak ditemukan')
        }
        if(err.code === 'PGRST116') {
            throw new Error('Data tidak ditemukan')
        }
        throw new Error(err.message)
    }
    throw new Error('Terjadi kesalahan pada database')
}