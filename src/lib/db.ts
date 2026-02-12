import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Function to create Prisma client safely
function createPrismaClient(): PrismaClient | null {
  // Don't create Prisma client during build time
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL not available, skipping Prisma client creation");
    return null;
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

// Create Prisma client with build-time safety
export const db = globalForPrisma.prisma ?? createPrismaClient();

// Export as prisma for compatibility with existing code
export const prisma = db;

// Only cache in development
if (process.env.NODE_ENV !== "production" && db) {
  globalForPrisma.prisma = db;
}

// Database availability check
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

// Safe database client that handles build-time scenarios
export function getSafeDb(): PrismaClient | null {
  if (!isDatabaseAvailable() || !db) {
    console.warn("⚠️ Database not available, returning null client");
    return null;
  }
  return db;
}

// Enhanced connection management for serverless with retry logic
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectDB(retryCount = 0): Promise<boolean> {
  if (isConnected) {
    return true;
  }

  // Skip database connection during build time or if db is null
  if (!db || !process.env.DATABASE_URL) {
    console.log("⚠️ Skipping database connection - client not available");
    return false;
  }

  try {
    // Test connection with a simple query and timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), 10000); // 10 second timeout
    });

    const queryPromise = db.$queryRaw`SELECT 1`;
    
    await Promise.race([queryPromise, timeoutPromise]);
    
    isConnected = true;
    connectionAttempts = 0;
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    connectionAttempts++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Database connection failed (attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${errorMessage}`);
    
    if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
      console.log(`⏳ Retrying connection in ${RETRY_DELAY_MS}ms...`);
      await delay(RETRY_DELAY_MS);
      return connectDB(retryCount + 1);
    }
    
    isConnected = false;
    console.error("🚫 Database connection failed after all retry attempts");
    return false;
  }
}

export async function disconnectDB() {
  if (isConnected && db) {
    await db.$disconnect();
    isConnected = false;
    console.log("Database disconnected");
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDB();
});

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
