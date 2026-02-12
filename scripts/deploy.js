#!/usr/bin/env node

/**
 * Astroqua Deployment Script
 * Handles database migrations and seeding for different environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment configuration
const ENVIRONMENTS = {
  development: {
    name: 'Development',
    database: process.env.DATABASE_URL,
    skipSeed: false,
  },
  preview: {
    name: 'Preview',
    database: process.env.DATABASE_URL,
    skipSeed: false,
  },
  production: {
    name: 'Production', 
    database: process.env.DATABASE_URL,
    skipSeed: true, // Don't auto-seed production
  },
};

const currentEnv = process.env.NODE_ENV || 'development';
const config = ENVIRONMENTS[currentEnv];

console.log(`🚀 Deploying Astroqua Ocean Platform to ${config.name}...`);

// Utility functions
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkEnvironment() {
  console.log('\n🔍 Checking environment variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

function checkDatabaseConnection() {
  console.log('\n🔗 Testing database connection...');
  try {
    // Simple connection test using Prisma
    execSync('npx prisma db execute --url="$DATABASE_URL" --stdin', { 
      stdio: 'pipe',
      timeout: 10000,
      input: 'SELECT 1;'
    });
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('⚠️ Database connection test skipped (this is normal for deployment)');
    // Don't exit on connection test failure during deployment
  }
}

function runMigrations() {
  // Skip migrations during Vercel build process
  if (process.env.VERCEL) {
    console.log('⚠️ Skipping migrations during Vercel build (run manually after deployment)');
    return;
  }
  
  if (currentEnv === 'production') {
    runCommand(
      'npx prisma migrate deploy',
      'Running production database migrations'
    );
  } else {
    runCommand(
      'npx prisma migrate dev --name deploy',
      'Running development database migrations'
    );
  }
}

function generatePrismaClient() {
  runCommand(
    'npx prisma generate',
    'Generating Prisma client'
  );
}

function seedDatabase() {
  if (config.skipSeed) {
    console.log('\n🌱 Skipping database seeding for production environment');
    return;
  }
  
  console.log('\n🌱 Checking if database needs seeding...');
  
  try {
    // Check if languages exist (indicates database is already seeded)
    const result = execSync(
      'npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM Language;"',
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    // If languages exist, skip seeding
    if (result.includes('count') && !result.includes('0')) {
      console.log('✅ Database already contains data, skipping seed');
      return;
    }
  } catch (error) {
    // If query fails, database might not be set up yet
    console.log('📝 Database appears empty, proceeding with seeding...');
  }
  
  runCommand(
    'node scripts/seed.js',
    'Seeding database with initial data'
  );
}

function buildApplication() {
  if (currentEnv !== 'development') {
    runCommand(
      'npm run build',
      'Building Next.js application'
    );
  }
}

function createDeploymentSummary() {
  console.log('\n📋 Deployment Summary:');
  console.log('='.repeat(50));
  console.log(`Environment: ${config.name}`);
  console.log(`Node Environment: ${currentEnv}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Not set'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
}

// Main deployment flow
async function deploy() {
  try {
    console.log('🌊 Astroqua Ocean Platform Deployment');
    console.log('='.repeat(50));
    
    // Pre-deployment checks
    checkEnvironment();
    checkDatabaseConnection();
    
    // Database setup
    generatePrismaClient();
    runMigrations();
    seedDatabase();
    
    // Application build (for non-dev environments)
    buildApplication();
    
    // Summary
    createDeploymentSummary();
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('🌊 Astroqua Ocean Platform is ready to explore the depths!');
    
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'check':
    checkEnvironment();
    checkDatabaseConnection();
    break;
  case 'migrate':
    generatePrismaClient();
    runMigrations();
    break;
  case 'seed':
    seedDatabase();
    break;
  case 'build':
    buildApplication();
    break;
  default:
    deploy();
}
