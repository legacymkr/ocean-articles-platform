#!/usr/bin/env node

/**
 * Database Seeding Script for Astroqua Ocean Platform
 * Populates the database with initial data for languages, tags, users, and sample articles
 */

async function seed() {
  try {
    // Import database utilities
    const { DatabaseSetup } = await import('../src/lib/database-setup.ts');
    
    console.log('🌱 Starting database seeding...');
    console.log('='.repeat(50));
    
    // Initialize database with core data
    console.log('📝 Initializing core database structure...');
    const initResult = await DatabaseSetup.initializeDatabase();
    
    if (!initResult.success) {
      throw new Error(initResult.message);
    }
    
    console.log('✅ Core initialization completed');
    console.log(`   Languages: ${initResult.data.languages}`);
    console.log(`   Tags: ${initResult.data.tags}`);
    console.log(`   Admin User: ${initResult.data.adminUser}`);
    
    // Seed sample data if environment allows
    const shouldSeedSamples = process.env.SEED_SAMPLE_DATA !== 'false' && 
                             process.env.NODE_ENV !== 'production';
    
    if (shouldSeedSamples) {
      console.log('\n📚 Adding sample articles...');
      const sampleResult = await DatabaseSetup.seedSampleData();
      
      if (sampleResult.success) {
        console.log('✅ Sample data added successfully');
        console.log(`   Articles: ${sampleResult.data.articles}`);
      } else {
        console.log(`⚠️ Sample data seeding skipped: ${sampleResult.message}`);
      }
    } else {
      console.log('\n⏭️ Skipping sample data for production environment');
    }
    
    // Get final status
    const statusResult = await DatabaseSetup.getDatabaseStatus();
    
    if (statusResult.success) {
      console.log('\n📊 Final Database Status:');
      console.log('='.repeat(30));
      console.log(`Languages: ${statusResult.data.languages}`);
      console.log(`Tags: ${statusResult.data.tags}`);
      console.log(`Users: ${statusResult.data.users}`);
      console.log(`Articles: ${statusResult.data.articles}`);
      console.log(`Translations: ${statusResult.data.translations}`);
      console.log('='.repeat(30));
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🌊 Your Astroqua Ocean Platform is ready to dive deep!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle different execution contexts
if (require.main === module) {
  // Called directly from command line
  seed();
} else {
  // Exported for use in other scripts
  module.exports = { seed };
}
