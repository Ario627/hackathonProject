import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { uuidSchema, updateBusinessSchema } from '@/lib/validation'
import { sanitizeObject } from '@/lib/sanitize'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from '@/lib/api-response'

// Helper to verify business ownership
async function verifyBusinessOwnership(businessId: string, userId: string) {
  const { data } = await (supabaseAdmin
    .from('businesses') as any)
    .select('id, user_id')
    .eq('id', businessId)
    .single() as { data: { id: string; user_id: string } | null }
  
  if (!data) return { exists: false, isOwner: false }
  return { exists: true, isOwner: data.user_id === userId }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const { id } = await params
    
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return validationErrorResponse(idValidation.error)
    }
    
    const { data, error } = await (supabaseAdmin
      .from('businesses') as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.userId)
      .single() as { data: any; error: any }
    
    if (error || !data) {
      return notFoundResponse('Bisnis tidak ditemukan')
    }
    
    return successResponse(data)
  } catch (error) {
    console.error('Get Single Business Error:', error)
    return internalErrorResponse()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const { id } = await params
    
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return validationErrorResponse(idValidation.error)
    }
    
    // Verify ownership
    const ownership = await verifyBusinessOwnership(id, user.userId)
    if (!ownership.exists) {
      return notFoundResponse('Bisnis tidak ditemukan')
    }
    if (!ownership.isOwner) {
      return forbiddenResponse('Anda tidak memiliki akses ke bisnis ini')
    }
    
    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)
    
    const validation = updateBusinessSchema.safeParse(sanitizedBody)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    
    const fieldMap: Record<string, string> = {
      namaUsaha: 'nama_usaha',
      jenisUsaha: 'jenis_usaha',
      deskripsi: 'deskripsi',
      modalAwal: 'modal_awal',
      pendapatanBulanan: 'pendapatan_bulanan',
      pengeluaranBulanan: 'pengeluaran_bulanan',
      jumlahKaryawan: 'jumlah_karyawan',
      lokasi: 'lokasi',
      tantangan: 'tantangan',
    }
    
    for (const [key, dbKey] of Object.entries(fieldMap)) {
      if (validation.data[key as keyof typeof validation.data] !== undefined) {
        updateData[dbKey] = validation.data[key as keyof typeof validation.data]
      }
    }
    
    const { data, error } = await (supabaseAdmin
      .from('businesses') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single() as { data: any; error: any }
    
    if (error) throw error
    
    return successResponse(data, 'Bisnis berhasil diupdate')
  } catch (error) {
    console.error('Update Business Error:', error)
    return internalErrorResponse()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const { id } = await params
    
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return validationErrorResponse(idValidation.error)
    }
    
    // Verify ownership
    const ownership = await verifyBusinessOwnership(id, user.userId)
    if (!ownership.exists) {
      return notFoundResponse('Bisnis tidak ditemukan')
    }
    if (!ownership.isOwner) {
      return forbiddenResponse('Anda tidak memiliki akses ke bisnis ini')
    }
    
    await (supabaseAdmin.from('businesses') as any).delete().eq('id', id)
    
    return successResponse(null, 'Bisnis berhasil dihapus')
  } catch (error) {
    console.error('Delete Business Error:', error)
    return internalErrorResponse()
  }
}