import { NextResponse } from "next/server";
import { setCsrfCookie } from "@/lib/csrf";
import { success } from "zod";

export async function GET() {
    try {
        const token = await setCsrfCookie();

        return NextResponse.json({
            success: true,
            data: {csrfToken: token}
        })
    } catch (error) {
        console.error('CSRF Token Error:', error);
        return NextResponse.json({
            success: false, message: 'Gagal mendapatkan CSRF token',
            status: 500
        })
    }
}