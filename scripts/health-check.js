#!/usr/bin/env node

/**
 * Astroqua Project Health Check
 * Scans for common issues and provides fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Astroqua project health check...\n');

// Check for required files
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.ts',
  'prisma/schema.prisma',
  'src/lib/db.ts',
  'src/lib/utils.ts',
  'src/app/globals.css',
  'env.example',
];

const missingFiles = [];
const existingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
  } else {
    missingFiles.push(file);
  }
});

console.log('📁 File System Check:');
console.log(`✅ Found ${existingFiles.length} required files`);
if (missingFiles.length > 0) {
  console.log(`❌ Missing ${missingFiles.length} files:`);
  missingFiles.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('✅ All required files present');
}
console.log();

// Check package.json dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  console.log('📦 Package Dependencies:');
  console.log(`✅ ${Object.keys(packageJson.dependencies || {}).length} dependencies`);
  console.log(`✅ ${Object.keys(packageJson.devDependencies || {}).length} dev dependencies`);
  
  // Check for critical dependencies
  const criticalDeps = [
    'next',
    'react',
    'react-dom',
    '@prisma/client',
    'prisma',
    'tailwindcss',
    'typescript'
  ];
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const missingDeps = criticalDeps.filter(dep => !allDeps[dep]);
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing critical dependencies:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
  } else {
    console.log('✅ All critical dependencies present');
  }
  
} catch (error) {
  console.log('❌ Could not read package.json');
}
console.log();

// Check TypeScript configuration
console.log('🔧 TypeScript Configuration:');
if (fs.existsSync('tsconfig.json')) {
  console.log('✅ tsconfig.json found');
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    if (tsconfig.compilerOptions?.strict) {
      console.log('✅ Strict mode enabled');
    }
  } catch (error) {
    console.log('⚠️ Could not parse tsconfig.json');
  }
} else {
  console.log('❌ tsconfig.json missing');
}
console.log();

// Check environment variables
console.log('🌍 Environment Configuration:');
if (fs.existsSync('env.example')) {
  console.log('✅ env.example template found');
} else {
  console.log('❌ env.example template missing');
}

if (fs.existsSync('.env')) {
  console.log('✅ .env file found');
} else {
  console.log('⚠️ .env file not found (expected for development)');
}
console.log();

// Check Next.js configuration
console.log('⚡ Next.js Configuration:');
const nextConfigFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
const hasNextConfig = nextConfigFiles.some(file => fs.existsSync(file));

if (hasNextConfig) {
  console.log('✅ Next.js config found');
} else {
  console.log('⚠️ No Next.js config found');
}
console.log();

// Check API routes
console.log('🔌 API Routes Check:');
const apiPath = 'src/app/api';
if (fs.existsSync(apiPath)) {
  const apiRoutes = [];
  
  function scanApiRoutes(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanApiRoutes(itemPath, prefix + '/' + item);
      } else if (item === 'route.ts' || item === 'route.js') {
        apiRoutes.push(prefix || '/');
      }
    });
  }
  
  scanApiRoutes(apiPath);
  console.log(`✅ Found ${apiRoutes.length} API routes:`);
  apiRoutes.forEach(route => console.log(`   - /api${route}`));
} else {
  console.log('❌ API directory not found');
}
console.log();

// Check Prisma schema
console.log('🗄️ Database Configuration:');
if (fs.existsSync('prisma/schema.prisma')) {
  console.log('✅ Prisma schema found');
  
  try {
    const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
    const models = (schema.match(/model \w+/g) || []).length;
    console.log(`✅ Found ${models} database models`);
    
    if (schema.includes('generator client')) {
      console.log('✅ Prisma client generator configured');
    }
  } catch (error) {
    console.log('⚠️ Could not read Prisma schema');
  }
} else {
  console.log('❌ Prisma schema missing');
}
console.log();

// Final summary
console.log('🎯 Health Check Summary:');
let score = 0;
let total = 6;

if (missingFiles.length === 0) score++;
if (fs.existsSync('package.json')) score++;
if (fs.existsSync('tsconfig.json')) score++;
if (fs.existsSync('env.example')) score++;
if (hasNextConfig) score++;
if (fs.existsSync('prisma/schema.prisma')) score++;

const percentage = Math.round((score / total) * 100);
console.log(`Score: ${score}/${total} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🎉 Excellent! Project is in great shape.');
} else if (percentage >= 70) {
  console.log('👍 Good! Minor issues detected.');
} else if (percentage >= 50) {
  console.log('⚠️ Fair. Some important files are missing.');
} else {
  console.log('❌ Poor. Major configuration issues detected.');
}

console.log('\n🚀 Ready for development!');
