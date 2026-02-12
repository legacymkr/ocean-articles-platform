import { PrismaClient, Role, ArticleStatus, MediaType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌊 Starting Astroqua database seed...");

  // Create languages
  const languages = await Promise.all([
    prisma.language.upsert({
      where: { code: "en" },
      update: {},
      create: {
        code: "en",
        name: "English",
        nativeName: "English",
        isRTL: false,
        isActive: true,
      },
    }),
    prisma.language.upsert({
      where: { code: "ar" },
      update: {},
      create: {
        code: "ar",
        name: "Arabic",
        nativeName: "العربية",
        isRTL: true,
        isActive: true,
      },
    }),
    prisma.language.upsert({
      where: { code: "zh" },
      update: {},
      create: {
        code: "zh",
        name: "Chinese",
        nativeName: "中文",
        isRTL: false,
        isActive: true,
      },
    }),
    prisma.language.upsert({
      where: { code: "ru" },
      update: {},
      create: {
        code: "ru",
        name: "Russian",
        nativeName: "Русский",
        isRTL: false,
        isActive: true,
      },
    }),
    prisma.language.upsert({
      where: { code: "de" },
      update: {},
      create: {
        code: "de",
        name: "German",
        nativeName: "Deutsch",
        isRTL: false,
        isActive: true,
      },
    }),
    prisma.language.upsert({
      where: { code: "fr" },
      update: {},
      create: {
        code: "fr",
        name: "French",
        nativeName: "Français",
        isRTL: false,
        isActive: true,
      },
    }),
    prisma.language.upsert({
      where: { code: "hi" },
      update: {},
      create: {
        code: "hi",
        name: "Hindi",
        nativeName: "हिन्दी",
        isRTL: false,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${languages.length} languages`);

  // Create admin user
  const hashedPassword = await hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@astroqua.com" },
    update: {},
    create: {
      email: "admin@astroqua.com",
      name: "Astroqua Admin",
      role: Role.ADMIN,
    },
  });

  console.log("✅ Created admin user");

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "deep-sea" },
      update: {},
      create: {
        name: "Deep Sea",
        slug: "deep-sea",
        color: "#3CA8C1",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "space-exploration" },
      update: {},
      create: {
        name: "Space Exploration",
        slug: "space-exploration",
        color: "#8B5CF6",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "mystery" },
      update: {},
      create: {
        name: "Mystery",
        slug: "mystery",
        color: "#F59E0B",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "research" },
      update: {},
      create: {
        name: "Research",
        slug: "research",
        color: "#10B981",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "technology" },
      update: {},
      create: {
        name: "Technology",
        slug: "technology",
        color: "#EF4444",
      },
    }),
    prisma.tag.upsert({
      where: { slug: "oceanography" },
      update: {},
      create: {
        name: "Oceanography",
        slug: "oceanography",
        color: "#06B6D4",
      },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create sample articles
  const englishLanguage = languages.find((lang) => lang.code === "en")!;

  const sampleArticles = [
    {
      title: "The Abyssal Station Discovery",
      slug: "abyssal-station-discovery",
      excerpt:
        "Deep beneath the waves, a mysterious structure has been discovered that challenges everything we know about ocean exploration.",
      content: `
        <h2>The Discovery</h2>
        <p>In the depths of the Mariana Trench, researchers have uncovered what appears to be an ancient structure that defies explanation. The discovery was made during a routine deep-sea exploration mission using advanced submersible technology.</p>
        
        <h2>Initial Findings</h2>
        <p>The structure, dubbed "The Abyssal Station," shows signs of advanced engineering that predates known human civilization. Its geometric patterns and materials are unlike anything found in the natural world.</p>
        
        <h2>Implications</h2>
        <p>This discovery raises profound questions about the history of our planet and the possibility of advanced civilizations that existed long before recorded history.</p>
      `,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2024-01-15"),
      metaTitle: "The Abyssal Station Discovery - Astroqua",
      metaDescription:
        "Deep beneath the waves, a mysterious structure has been discovered that challenges everything we know about ocean exploration.",
      keywords: "deep sea, mystery, discovery, ocean, exploration, ancient civilization",
    },
    {
      title: "Bioluminescent Mysteries of the Deep",
      slug: "bioluminescent-mysteries-deep",
      excerpt:
        "Exploring the fascinating world of bioluminescent creatures and their role in the deep ocean ecosystem.",
      content: `
        <h2>What is Bioluminescence?</h2>
        <p>Bioluminescence is the production and emission of light by living organisms. In the deep ocean, where sunlight cannot penetrate, bioluminescence serves as a crucial form of communication and survival.</p>
        
        <h2>Deep Sea Creatures</h2>
        <p>From anglerfish to jellyfish, many deep-sea creatures have evolved sophisticated bioluminescent systems. These adaptations help them hunt, avoid predators, and find mates in the eternal darkness.</p>
        
        <h2>Scientific Significance</h2>
        <p>Studying bioluminescence in deep-sea creatures provides insights into evolution, biochemistry, and the potential for medical applications in human health.</p>
      `,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2024-01-10"),
      metaTitle: "Bioluminescent Mysteries of the Deep - Astroqua",
      metaDescription:
        "Exploring the fascinating world of bioluminescent creatures and their role in the deep ocean ecosystem.",
      keywords: "bioluminescence, deep sea, marine biology, ocean, creatures, ecosystem",
    },
    {
      title: "The Cosmic Connection: Space and Ocean",
      slug: "cosmic-connection-space-ocean",
      excerpt:
        "How space exploration technology is revolutionizing our understanding of the deep ocean and vice versa.",
      content: `
        <h2>Shared Technologies</h2>
        <p>The technologies used to explore space and the deep ocean share remarkable similarities. Both environments are hostile to human life and require advanced robotics and life support systems.</p>
        
        <h2>Mutual Discoveries</h2>
        <p>Research in one field often leads to breakthroughs in the other. Space technology has enabled deeper ocean exploration, while ocean research has informed space mission design.</p>
        
        <h2>Future Implications</h2>
        <p>As we continue to explore both frontiers, the connection between space and ocean research will become increasingly important for understanding our place in the universe.</p>
      `,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date("2024-01-05"),
      metaTitle: "The Cosmic Connection: Space and Ocean - Astroqua",
      metaDescription:
        "How space exploration technology is revolutionizing our understanding of the deep ocean and vice versa.",
      keywords: "space, ocean, technology, exploration, research, connection",
    },
  ];

  for (const articleData of sampleArticles) {
    const article = await prisma.article.create({
      data: {
        ...articleData,
        authorId: adminUser.id,
        originalLanguageId: englishLanguage.id,
      },
    });

    // Add tags to articles
    const articleTags = tags.slice(0, Math.floor(Math.random() * 3) + 2); // Random 2-4 tags
    for (const tag of articleTags) {
      await prisma.articleTag.create({
        data: {
          articleId: article.id,
          tagId: tag.id,
        },
      });
    }
  }

  console.log(`✅ Created ${sampleArticles.length} sample articles`);

  // Create sample media assets
  const mediaAssets = await Promise.all([
    prisma.mediaAsset.create({
      data: {
        url: "/images/abyssal-station.jpg",
        type: MediaType.IMAGE,
        width: 1920,
        height: 1080,
        altText: "Mysterious abyssal station discovered in the deep ocean",
        createdById: adminUser.id,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        url: "/images/bioluminescent-creatures.jpg",
        type: MediaType.IMAGE,
        width: 1920,
        height: 1080,
        altText: "Bioluminescent creatures in the deep ocean",
        createdById: adminUser.id,
      },
    }),
    prisma.mediaAsset.create({
      data: {
        url: "/images/space-ocean-connection.jpg",
        type: MediaType.IMAGE,
        width: 1920,
        height: 1080,
        altText: "Connection between space and ocean exploration",
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${mediaAssets.length} media assets`);

  console.log("🌊 Astroqua database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
