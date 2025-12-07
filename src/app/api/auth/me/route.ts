import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import {
    successResponse,
    unauthorizedResponse,
    internalErrorResponse
} from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (! user) {
      return unauthorizedResponse()
    }
    
    // Get fresh user data from database
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('id, email, nama, created_at, last_login')
      .eq('id', user.userId)
      .single<{ id: string; email: string; nama: string; created_at: string; last_login: string | null }>()
    
    if (error || !userData) {
      return unauthorizedResponse('User tidak ditemukan')
    }
    
    return successResponse({
      user: {
        id: userData.id,
        email: userData.email,
        nama: userData.nama,
        createdAt: userData. created_at,
        lastLogin: userData.last_login,
      },
    })
  } catch (error) {
    console.error('Get Me Error:', error)
    return internalErrorResponse()
  }
}