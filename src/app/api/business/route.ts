import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { createBusinessSchema, paginationSchema } from '@/lib/validation'
import { sanitizeObject } from '@/lib/sanitize'
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const { searchParams } = new URL(request.url)
    
    const paginationValidation = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    if (!paginationValidation.success) {
      return validationErrorResponse(paginationValidation.error)
    }
    
    const { page, limit } = paginationValidation.data
    const offset = (page - 1) * limit
    
    const { data, count } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return successResponse({
      businesses: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get Business Error:', error)
    return internalErrorResponse()
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const body = await request. json()
    const sanitizedBody = sanitizeObject(body)
    
    const validation = createBusinessSchema.safeParse(sanitizedBody)
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const {
      namaUsaha,
      jenisUsaha,
      deskripsi,
      modalAwal,
      pendapatanBulanan,
      pengeluaranBulanan,
      jumlahKaryawan,
      lokasi,
      tantangan,
    } = validation. data
    
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert({
        user_id: user. userId,
        nama_usaha: namaUsaha,
        jenis_usaha: jenisUsaha,
        deskripsi,
        modal_awal: modalAwal,
        pendapatan_bulanan: pendapatanBulanan,
        pengeluaran_bulanan: pengeluaranBulanan,
        jumlah_karyawan: jumlahKaryawan,
        lokasi,
        tantangan,
      } as any)
      .select()
      .single()
    
    if (error) throw error
    
    return successResponse(data, 'Bisnis berhasil ditambahkan! ', 201)
  } catch (error) {
    console.error('Create Business Error:', error)
    return internalErrorResponse()
  }
}