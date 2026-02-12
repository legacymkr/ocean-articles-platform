#!/usr/bin/env node

/**
 * Check deployment environment variables
 * This script validates that all required environment variables are set for deployment
 */

// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const optionalEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET',
  'RESEND_NEWSLETTER_AUDIENCE_ID',
  'NODE_ENV',
  'NEXT_PUBLIC_GA_ID'
];

console.log('🔍 Checking deployment environment variables...\n');

let hasErrors = false;

// Check required variables
console.log('📋 Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    hasErrors = true;
  } else if (varName === 'DATABASE_URL') {
    // Special check for DATABASE_URL format
    if (value.startsWith('postgresql://') || value.startsWith('postgres://')) {
      console.log(`✅ ${varName}: Valid PostgreSQL URL`);
    } else {
      console.log(`❌ ${varName}: Invalid format (${value.substring(0, 20)}...)`);
      hasErrors = true;
    }
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Not set`);
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ DEPLOYMENT CHECK FAILED');
  console.log('Please set the missing environment variables before deploying.');
  process.exit(1);
} else {
  console.log('✅ DEPLOYMENT CHECK PASSED');
  console.log('All required environment variables are set correctly.');
  process.exit(0);
}
