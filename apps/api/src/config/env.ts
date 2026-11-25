import {z} from "zod"

const envSchema=z.object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    WEB_ORIGIN: z.string().url(),
    DATABASE_URL: z.string().url().refine((value)=>
        value.startsWith("postgresql://") || value.startsWith("postgres://"),  { message: "DATABASE_URL must use the PostgreSQL URL scheme" }
    )
})

export const env=envSchema.parse(process.env);