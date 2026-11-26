process.env.WEB_ORIGIN = "http://localhost:5173"
import { randomBytes } from "node:crypto";
//process.env.DATABASE_URL = "postgresql://postgres:12345@localhost:5432/devsync"
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testJwtAccessSecret=process.env.JWT_ACCESS_SECRET;

if (!testJwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET must needed");
}

if(!testDatabaseUrl){
    throw new Error("TEST_DATABASE_URL must point to an isolated test database");
}
process.env.DATABASE_URL=testDatabaseUrl;
 process.env.JWT_ACCESS_SECRET = randomBytes(32).toString("base64");