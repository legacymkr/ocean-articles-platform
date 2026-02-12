// Test Supabase connection directly
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lszccbdufyaohdihzult.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzemNjYmR1Znlhb2hkaWh6dWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTUxMzgsImV4cCI6MjA3NTk3MTEzOH0.1RL_7yHN-Gf7t-h0ZWIpFRqBl1wFoJ5T_-TXIPoZ534';

async function testSupabase() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📋 Found migrations table');
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
  }
}

testSupabase();
