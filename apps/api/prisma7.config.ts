import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

if (process.env.NODE_ENV === "development") {
  loadEnv({ path: ".env.development" });
} else if (process.env.NODE_ENV !== "production") {
  throw new Error(
    "Set NODE_ENV to 'development' or 'production' before running Prisma commands.",
  );
}else {
    loadEnv({ path: ".env.production" });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
