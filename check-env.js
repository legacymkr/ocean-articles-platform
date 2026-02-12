console.log('Loading .env.local...');
const localResult = require('dotenv').config({ path: '.env.local' });
console.log('Local env result:', localResult.error ? localResult.error.message : 'Success');

console.log('Loading .env...');
const envResult = require('dotenv').config({ path: '.env' });
console.log('Env result:', envResult.error ? envResult.error.message : 'Success');

console.log('=== ENVIRONMENT VARIABLES ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DIRECT_URL:', process.env.DIRECT_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

console.log('\n=== ALL ENV VARS CONTAINING "DATABASE" ===');
Object.keys(process.env)
  .filter(key => key.includes('DATABASE'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });
