const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create languages
  const languages = [
    { code: "en", name: "English", nativeName: "English", isRTL: false },
    { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
    { code: "zh", name: "Chinese", nativeName: "中文", isRTL: false },
    { code: "ru", name: "Russian", nativeName: "Русский", isRTL: false },
    { code: "de", name: "German", nativeName: "Deutsch", isRTL: false },
    { code: "fr", name: "French", nativeName: "Français", isRTL: false },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang
    });
  }

  console.log('✅ Languages created');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@astroqua.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@astroqua.com',
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created');

  // Create tags
  const tags = [
    { name: 'Deep Sea', slug: 'deep-sea' },
    { name: 'Marine Biology', slug: 'marine-biology' },
    { name: 'Ocean Exploration', slug: 'ocean-exploration' },
    { name: 'Bioluminescence', slug: 'bioluminescence' },
    { name: 'Research', slug: 'research' }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    });
  }

  console.log('✅ Tags created');

  // Get English language
  const englishLang = await prisma.language.findFirst({ where: { code: 'en' } });

  // Create sample article
  const sampleArticle = await prisma.article.upsert({
    where: { 
      slug_originalLanguageId: {
        slug: 'welcome-to-astroqua-ocean',
        originalLanguageId: englishLang.id
      }
    },
    update: {},
    create: {
      title: 'Welcome to Astroqua Ocean',
      slug: 'welcome-to-astroqua-ocean',
      excerpt: 'Dive into the mysteries of the deep sea with our comprehensive exploration platform.',
      content: `
        <h1>Welcome to Astroqua Ocean</h1>
        <p>Welcome to your ocean exploration platform! This is your first article.</p>
        <p>Astroqua Ocean is designed to help you explore and document the mysteries of our planet's oceans.</p>
        <h2>Features</h2>
        <ul>
          <li>Multi-language support</li>
          <li>Rich content editing</li>
          <li>Article translations</li>
          <li>Admin dashboard</li>
        </ul>
        <p>Start by creating your first article in the admin panel!</p>
      `,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminUser.id,
      originalLanguageId: englishLang.id
    }
  });

  console.log('✅ Sample article created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
