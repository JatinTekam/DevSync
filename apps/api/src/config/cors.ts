import type {CorsOptions} from "cors"


export const corsOptions: CorsOptions={
    origin: process.env.WEB_ORIGIN!,
    credentials: true,
}