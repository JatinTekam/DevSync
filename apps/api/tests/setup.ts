process.env.WEB_ORIGIN = "http://localhost:5173"
//process.env.DATABASE_URL = "postgresql://postgres:12345@localhost:5432/devsync"
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if(!testDatabaseUrl){
    throw new Error("TEST_DATABASE_URL must point to an isolated test database");
}
process.env.DATABASE_URL=testDatabaseUrl;