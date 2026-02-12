import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// Manually load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// If DATABASE_URL is not set or is the default SQLite URL, override it
if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("file:") ||
  process.env.DATABASE_URL.includes("dev.db")
) {
  process.env.DATABASE_URL =
    "postgresql://postgres:PpQO1dLiFvm3zOEO@db.tzskqtxojborphkzlgpx.supabase.co:5432/postgres";
  console.log("✅ DATABASE_URL set to Supabase");
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
