import { db, connectDB } from './db';
import { Prisma } from '@prisma/client';

/**
 * Wrapper for database operations that handles prepared statement errors
 * and connection issues in serverless environments
 */
export class DatabaseWrapper {
  private static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T | null> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Ensure connection is established
        await connectDB();
        
        // Execute the operation
        const result = await operation();
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a prepared statement error
        const isPreparedStatementError = 
          error?.code === 'P2024' || 
          error?.message?.includes('prepared statement') ||
          error?.message?.includes('does not exist');
        
        // Check if it's a connection error
        const isConnectionError = 
          error?.code === 'P1001' ||
          error?.message?.includes('connection') ||
          error?.message?.includes('timeout');
        
        console.warn(`Database operation attempt ${attempt} failed:`, {
          error: error?.message,
          code: error?.code,
          isPreparedStatementError,
          isConnectionError
        });
        
        // If it's a prepared statement error or connection error, retry
        if ((isPreparedStatementError || isConnectionError) && attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Force disconnect and reconnect for prepared statement errors
          if (isPreparedStatementError && db) {
            try {
              await db.$disconnect();
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (disconnectError) {
              console.warn('Error during disconnect:', disconnectError);
            }
          }
          
          continue;
        }
        
        // If it's not a retryable error, break
        break;
      }
    }
    
    console.error(`Database operation failed after ${maxRetries} attempts:`, lastError);
    return null;
  }
  
  /**
   * Execute a Prisma query with automatic retry logic
   */
  static async query<T>(operation: () => Promise<T>): Promise<T | null> {
    return this.executeWithRetry(operation);
  }
  
  /**
   * Execute multiple Prisma queries in parallel with retry logic
   */
  static async queryAll<T extends readonly unknown[]>(
    operations: readonly [...{ [K in keyof T]: () => Promise<T[K]> }]
  ): Promise<{ [K in keyof T]: T[K] | null }> {
    const results = await Promise.all(
      operations.map(op => this.executeWithRetry(op))
    );
    return results as { [K in keyof T]: T[K] | null };
  }
  
  /**
   * Check if database is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      if (!db) {
        return false;
      }
      await db.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.warn('Database availability check failed:', error);
      return false;
    }
  }
}
