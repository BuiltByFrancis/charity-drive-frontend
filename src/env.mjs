import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'test', 'production']),
        ALCHEMY_API_KEY: z.string(),
        VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
        VERCEL_PROJECT_PRODUCTION_URL: z
            .string()
            .default('localhost:3000')
            .transform(str =>
                process.env.NODE_ENV === 'production' ? `https://${str}` : `http://${str}`
            ),
    },
    client: {
        NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']).default('development'),
        NEXT_PUBLIC_VERCEL_URL: z
            .string()
            .default('localhost:3000')
            .transform(str =>
                process.env.NODE_ENV === 'production' ? `https://${str}` : `http://${str}`
            ),
        NEXT_PUBLIC_PROJECT_ID: z.string(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
        NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
        NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    },
});

export { env };
