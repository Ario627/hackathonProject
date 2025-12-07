import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
    verifyRefreshToken,
    generateToken,
    setAuthCookies,
    revokeRefreshToken
} from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
    successResponse,
    errorResponse,
    internalErrorResponse
} from "@/lib/api-response";
import { access } from "fs";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const refreshToken = (await cookieStore).get('refreshToken')?.value;

        if(!refreshToken) {
            return errorResponse('Refresh token tidak ditemukan', 401);
        }

        //Verify refresh token
        const payload = await verifyRefreshToken(refreshToken)

        if (!payload) {
            return errorResponse('Refresh token tidak valid', 401);
        }

        // Revoke old refresh token
        await revokeRefreshToken(refreshToken)

        //Generate new tokens
        const tokens = await generateToken(payload.userId, payload.email)

        //Generate new cookies
        await setAuthCookies(tokens.accessToken, tokens.refreshToken)

        return  successResponse(
            {accessToken: tokens.accessToken},
            'Token berhasil di-refresh'
        )
    } catch (error) {
        console.error('Refresh Token Error:', error);
        return internalErrorResponse();
    }
}