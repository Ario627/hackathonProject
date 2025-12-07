import { NextRequest } from "next/server";
import { clearAuthCookies, revokeRefreshToken, getAuthUser } from "@/lib/auth";
import { successResponse, internalErrorResponse } from "@/lib/api-response";

export async function POST(request:NextRequest) {
    try{
        const users = await getAuthUser(request);

        if(users) {
            await revokeRefreshToken(users.userId);
        }

        await clearAuthCookies()

        return successResponse(null, 'Logout berhasil');
    } catch(error) {
        console.error('Logout Error:', error);
        return internalErrorResponse();
    } 
}