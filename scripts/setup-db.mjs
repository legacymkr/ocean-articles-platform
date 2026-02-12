#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("🌊 Astroqua Database Setup");
console.log("==========================\n");

// Check if .env exists
try {
  const envContent = readFileSync(".env", "utf8");
  console.log("✅ .env file found");
} catch (error) {
  console.log("❌ .env file not found. Creating one...");

  const envContent = `DATABASE_URL="postgresql://username:password@localhost:5432/astroqua?schema=public"
RESEND_API_KEY="your_resend_api_key_here"
UPLOADTHING_SECRET="your_uploadthing_secret_here"
UPLOADTHING_APP_ID="your_uploadthing_app_id_here"
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"`;

  writeFileSync(".env", envContent);
  console.log("✅ .env file created");
}

console.log("\n📋 Database Setup Instructions:");
console.log("===============================");
console.log("1. Install PostgreSQL on your system");
console.log('2. Create a database named "astroqua"');
console.log("3. Update the DATABASE_URL in .env with your actual credentials");
console.log("4. Run: npm run prisma:migrate");
console.log("5. Run: npm run prisma:seed");
console.log("\nExample DATABASE_URL:");
console.log('DATABASE_URL="postgresql://postgres:password@localhost:5432/astroqua?schema=public"');
console.log("\nFor development, you can also use:");
console.log(
  "- Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres",
);
console.log("- Then: docker exec -it postgres createdb astroqua");
console.log("\n🌊 Happy coding!");
