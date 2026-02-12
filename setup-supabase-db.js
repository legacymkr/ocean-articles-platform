const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...');
  
  // Try DIRECT_URL first (without pgbouncer)
  process.env.DATABASE_URL = "postgresql://postgres.lszccbdufyaohdihzult:gyP8HpDNfSTGnbvW@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require";
  
  const prisma = new PrismaClient();
  
  try {
    console.log('📡 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    
    console.log('🔍 Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log(`📋 Found ${tables.length} tables:`, tables.map(t => t.table_name));
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. You may need to run: npx prisma db push');
    } else {
      console.log('✅ Database appears to be set up correctly!');
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('💡 Try running: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
