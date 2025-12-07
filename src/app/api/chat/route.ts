import { NextRequest } from "next/server";
import {openai} from '@/lib/openai'
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import { chatMessageSchema, uuidSchema, paginationSchema } from "@/lib/validation";
import { sanitizeObject, sanitizeString } from "@/lib/sanitize";
import { config } from "@/config";
import { SYSTEM_PROMPT } from "@/lib/promts";
import {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    internalErrorResponse
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if(!user) {
            return unauthorizedResponse();
        }

        const body = await request.json()
        const sanitizedBody = sanitizeObject(body)

        //Validate input
        const validation = chatMessageSchema.safeParse(sanitizedBody)
        if(!validation.success) {
            return validationErrorResponse(validation.error)
        }

        const {message, businessId} = validation.data

        let businessContext = ''
        if(businessId) {
            const {data: business} =  await (supabaseAdmin
                .from('businesses') as any)
                .select('*')
                .eq('id', businessId)
                .eq('user_id', user.userId)
                .single() as { data: { nama_usaha: string; jenis_usaha: string; deskripsi?: string; modal_awal?: number; pendapatan_bulanan?: number; pengeluaran_bulanan?: number; jumlah_karyawan?: number; lokasi?: string; tantangan?: string[] } | null }
            
            if(!business) {
                return notFoundResponse('Bisnis tidak ditemukan atau bukan milik Anda')
            }

            businessContext = `
            - Nama Usaha: ${sanitizeString(business.nama_usaha)}
            - Jenis: ${sanitizeString(business.jenis_usaha)}
            - Deskripsi: ${business.deskripsi ? sanitizeString(business.deskripsi) : 'Tidak ada'}
            - Modal Awal: Rp ${business.modal_awal?.toLocaleString('id-ID') || 'Tidak diketahui'}
            - Pendapatan Bulanan: Rp ${business.pendapatan_bulanan?.toLocaleString('id-ID') || 'Tidak diketahui'}
            - Pengeluaran Bulanan: Rp ${business.pengeluaran_bulanan?.toLocaleString('id-ID') || 'Tidak diketahui'}
            - Jumlah Karyawan: ${business.jumlah_karyawan || 'Tidak diketahui'}
            - Lokasi: ${business.lokasi ? sanitizeString(business.lokasi) : 'Tidak diketahui'}
            - Tantangan: ${business.tantangan?.map(sanitizeString).join(', ') || 'Tidak disebutkan'}
            `
        }

        const {data: messages} = await (supabaseAdmin
            .from('chat_messages') as any)
            .select('role, content')
            .eq('user_id', user.userId)
            .order('created_at', {ascending: true})
            .limit(10) as { data: { role: 'user' | 'assistant' | 'system'; content: string }[] | null }

        const chatHistory = (messages || []).map((m) => ({
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: m.content
        }))

        const completion = await openai.chat.completions.create({
            model: config.openai.model,
            messages: [
                {role: 'system', content: SYSTEM_PROMPT + (businessContext ? `\n\nKONTEKS BISNIS USER:\n${businessContext}` : '')},
                ...chatHistory,
                {role: 'user', content: sanitizeString(message)}
            ]
        })

        const assistantReply = completion.choices[0].message?.content?.trim() ||'Maaf, aku tidak bisa menjawab saat ini.'

        await (supabaseAdmin.from('chat_messages') as any).insert([
        {
            user_id: user.userId,
            role: 'user',
            content: sanitizeString(message),
        },
        {
            user_id: user.userId,
            role: 'assistant',
            content: assistantReply,
        },
    ])
        return successResponse({
            success: true,
            message: assistantReply
        })
    } catch (error) {
        console.error('Chat Error:', error)
        return internalErrorResponse()
    }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const { searchParams } = new URL(request.url)
    
    // Validate pagination
    const paginationValidation = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    if (!paginationValidation.success) {
      return validationErrorResponse(paginationValidation. error)
    }
    
    const { page, limit } = paginationValidation.data
    const offset = (page - 1) * limit
    
    // Get messages
    const { data: messages, count } = await supabaseAdmin
      . from('chat_messages')
      .select('*', { count: 'exact' })
      .eq('user_id', user.userId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
    
    return successResponse({
      messages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get Chat History Error:', error)
    return internalErrorResponse()
  }
}

// DELETE chat history
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('user_id', user.userId)
    
    return successResponse(null, 'Riwayat chat berhasil dihapus')
  } catch (error) {
    console.error('Delete Chat History Error:', error)
    return internalErrorResponse()
  }
}