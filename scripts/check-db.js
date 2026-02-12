/**
 * Database Configuration Checker
 * Helps diagnose database connection issues
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking database configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
const databaseUrl = process.env.DATABASE_URL;
console.log(`DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Not set'}`);

if (databaseUrl) {
  const isValidFormat = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('file:');
  console.log(`URL Format: ${isValidFormat ? '✅ Valid' : '❌ Invalid'}`);
  
  if (!isValidFormat) {
    console.log('   Expected format: postgresql://username:password@host:port/database or file:./database.db');
  }
} else {
  console.log('   Please set DATABASE_URL in your .env file');
}

// Check .env file
console.log('\n📄 Environment File:');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasDbUrl = envContent.includes('DATABASE_URL');
  console.log(`DATABASE_URL in .env: ${hasDbUrl ? '✅ Found' : '❌ Not found'}`);
} else {
  console.log('❌ .env file not found');
  console.log('   Create a .env file based on env.example');
}

// Test database connection
console.log('\n🔌 Database Connection Test:');
if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('file:'))) {
  const prisma = new PrismaClient();
  
  prisma.$connect()
    .then(async () => {
      console.log('✅ Database connection successful');
      
      // Test a simple query
      try {
        const userCount = await prisma.user.count();
        console.log(`📊 Users in database: ${userCount}`);
        
        const languageCount = await prisma.language.count();
        console.log(`🌍 Languages in database: ${languageCount}`);
        
        const articleCount = await prisma.article.count();
        console.log(`📰 Articles in database: ${articleCount}`);
      } catch (queryError) {
        console.log('❌ Database query failed:', queryError.message);
        console.log('   This might indicate the database schema needs to be migrated');
        console.log('   Run: npx prisma migrate dev --name init');
      }
    })
    .catch((error) => {
      console.log('❌ Database connection failed:', error.message);
      console.log('\n🔧 Possible solutions:');
      console.log('   1. Check your DATABASE_URL is correct');
      console.log('   2. Ensure your database server is running');
      console.log('   3. Verify network connectivity to the database');
      console.log('   4. Check database credentials');
    })
    .finally(() => {
      prisma.$disconnect();
    });
} else {
  console.log('❌ Cannot test connection - DATABASE_URL not properly configured');
}

console.log('\n📚 Quick Setup Guide:');
console.log('1. Copy env.example to .env');
console.log('2. Set DATABASE_URL to your PostgreSQL connection string');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma migrate dev --name init');
console.log('5. Run: npm run seed (optional - for sample data)');
