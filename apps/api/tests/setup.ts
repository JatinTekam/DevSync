process.env.WEB_ORIGIN = "http://localhost:5173";
import { randomBytes } from "node:crypto";
//process.env.DATABASE_URL = "postgresql://postgres:12345@localhost:5432/devsync"
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("base64");
}

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL must point to an isolated test database");
}
process.env.DATABASE_URL = testDatabaseUrl;
