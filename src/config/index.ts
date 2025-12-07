import bcrypt from "bcryptjs";
import { refresh } from "next/cache";


export const config = {
    //APP
    appName: 'UMKM Consultant AI',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    //JWT
    jwt: {
        accessSecret: process.env.JWT_ACCESS_TOKEN!,
        refreshSecret: process.env.JWT_REFRESH_TOKEN!,
        accessTokenExpiresIn: '15m',
        refreshExpiresIn: '7d',
    },

    //RATE LIMITING
    rateLimit: {
        windowMS: 60 * 1000,
        maxRequest: {
            default: 60,
            auth: 5,
            chat: 25,
        },
    },

    //SECURITY
    security: {
        bcryptRounds: 13,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
    },

    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },

    //AI {OPENAI}
    openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
    },
} as const;

//VALIDATE REQUIRE ENV VARS
const requireEndVars = [
    'JWT_ACCESS_TOKEN',
    'JWT_REFRESH_TOKEN',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
] as const

export function validateEnvVars() {
    const missing = requireEndVars.filter((key) => !process.env[key]);
    if(missing.length > 0) {
        throw new Error('Missing required env vars: ' + missing.join(', '));
    }
}

//Run validation at startup

validateEnvVars();
