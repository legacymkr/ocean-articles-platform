import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Create a .env with DATABASE_URL.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  const client = await pool.connect();
  await client.query("SELECT 1");
  client.release();
  console.log("✅ Database connection OK");
  process.exit(0);
} catch (err) {
  console.error("❌ Database connection failed:\n", err);
  process.exit(1);
}
