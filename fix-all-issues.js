const { PrismaClient } = require('@prisma/client');

async function fixAllIssues() {
  console.log('🔧 Fixing all article creation issues...');
  
  // Use the working DIRECT_URL
  process.env.DATABASE_URL = "postgresql://postgres.lszccbdufyaohdihzult:gyP8HpDNfSTGnbvW@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require";
  
  const prisma = new PrismaClient();
  
  try {
    console.log('1. 📡 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    
    console.log('2. 👤 Checking for admin user...');
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('📝 Creating admin user...');
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@galatide.com',
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created:', adminUser.email);
    } else {
      console.log('✅ Admin user exists:', adminUser.email);
    }
    
    console.log('3. 🏷️  Checking default language...');
    let englishLang = await prisma.language.findFirst({
      where: { code: 'en' }
    });
    
    if (!englishLang) {
      console.log('📝 Creating English language...');
      englishLang = await prisma.language.create({
        data: {
          code: 'en',
          name: 'English',
          nativeName: 'English',
          isDefault: true
        }
      });
      console.log('✅ English language created');
    } else {
      console.log('✅ English language exists');
    }
    
    console.log('4. 📝 Testing article creation...');
    const testArticle = await prisma.article.create({
      data: {
        title: 'Test Article - ' + new Date().toISOString(),
        slug: 'test-article-' + Date.now(),
        content: '<p>This is a test article to verify the system works.</p>',
        excerpt: 'Test article excerpt',
        status: 'DRAFT',
        author: {
          connect: { id: adminUser.id }
        },
        originalLanguage: {
          connect: { id: englishLang.id }
        }
      }
    });
    
    console.log('✅ Test article created successfully:', testArticle.id);
    
    // Clean up test article
    await prisma.article.delete({
      where: { id: testArticle.id }
    });
    console.log('🧹 Test article cleaned up');
    
    console.log('\n🎉 ALL ISSUES FIXED SUCCESSFULLY!');
    console.log('📋 Summary:');
    console.log('  ✅ Database connection working');
    console.log('  ✅ Admin user available');
    console.log('  ✅ Default language set');
    console.log('  ✅ Article creation working');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    
    if (error.code === 'P2002') {
      console.log('💡 Unique constraint error - data might already exist');
    } else if (error.message.includes('connect')) {
      console.log('💡 Connection error - check your DATABASE_URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixAllIssues();
