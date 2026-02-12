import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Intentionally throw to surface misconfiguration early in dev
  throw new Error("DATABASE_URL is not set. Please add it to your .env file.");
}

declare global {
  // Using var to augment Node's global in dev HMR
  var pgPool: Pool | undefined;
}

export const pgPool: Pool = global.pgPool ?? new Pool({ connectionString: databaseUrl });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pgPool;
}

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}
