import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, generateToken, setAuthCookies } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { sanitizeObject } from "@/lib/sanitize";
import {
    successResponse,
    validationErrorResponse,
    errorResponse,
    internalErrorResponse
} from "@/lib/api-response";
import { access } from "fs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const sanitizedBody = sanitizeObject(body);

        //Validate input
        const validation = registerSchema.safeParse(sanitizedBody);
        if(!validation.success) {
            return validationErrorResponse(validation.error);
        }

        const {email, password, nama} = validation.data;

        //Check email
        const {data: existingUser} = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        
        if(existingUser) {
            return errorResponse('Email sudah terdaftar', 400);
        }

        //Hash passwd
        const passwordHash = await hashPassword(password)

        const {data: user, error} = await (supabaseAdmin
            .from('users') as any)
            .insert([{
                email,
                password_hash: passwordHash,
                nama,
            }])
            .select('id, email, nama')
            .single() as { data: { id: string; email: string; nama: string } | null; error: any }
        
        if(error) throw error

        const tokens = await generateToken(user!.id, user!.email)
        await setAuthCookies(tokens.accessToken, tokens.refreshToken)

        return successResponse(
            {
                user: {
                    id: user!.id,
                    email: user!.email,
                    nama: user!.nama,
                },
                accessToken: tokens.accessToken,
            },
            'Registrasi berhasil',
            201
        )
    } catch (error) {
        console.error('Register error:', error)
        return internalErrorResponse()
    }
}