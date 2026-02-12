/**
 * Database Setup Script for Astroqua Ocean
 * This script sets up SQLite database for development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting up Astroqua Ocean database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envExamplePath = path.join(__dirname, 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Copied env.example to .env');
  } else {
    fs.writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n');
    console.log('✅ Created basic .env file');
  }
}

// Check if DATABASE_URL exists in .env
let envContent = fs.readFileSync(envPath, 'utf-8');
if (!envContent.includes('DATABASE_URL')) {
  console.log('📝 Adding DATABASE_URL to .env...');
  envContent += '\nDATABASE_URL="file:./dev.db"\n';
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added DATABASE_URL to .env');
} else if (!envContent.includes('DATABASE_URL="file:./dev.db"')) {
  console.log('📝 Updating DATABASE_URL in .env...');
  envContent = envContent.replace(/DATABASE_URL=.*/g, 'DATABASE_URL="file:./dev.db"');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated DATABASE_URL in .env');
}

try {
  console.log('\n🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  console.log('\n🔄 Creating database and running migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');

  console.log('\n🔄 Seeding database with initial data...');
  try {
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ Database seeded with sample data');
  } catch (seedError) {
    console.log('⚠️  Seeding failed, but database is ready');
  }

  console.log('\n🎉 Database setup completed successfully!');
  console.log('🚀 You can now run: npm run dev');
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\n🔧 Manual setup instructions:');
  console.log('1. Run: npx prisma generate');
  console.log('2. Run: npx prisma migrate dev --name init');
  console.log('3. Run: npm run seed (optional)');
}
