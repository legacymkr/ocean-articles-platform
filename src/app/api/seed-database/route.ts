import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET() {
  return await seedDatabase();
}

export async function POST() {
  return await seedDatabase();
}

async function seedDatabase() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    console.log("🌱 Starting database seeding...");

    // 1. Create default languages
    const languages = await db.language.createMany({
      data: [
        {
          code: "en",
          name: "English",
          nativeName: "English",
          isRTL: false,
          isActive: true,
        },
        {
          code: "ar", 
          name: "Arabic",
          nativeName: "العربية",
          isRTL: true,
          isActive: true,
        },
        {
          code: "zh",
          name: "Chinese",
          nativeName: "中文",
          isRTL: false,
          isActive: true,
        },
        {
          code: "ru",
          name: "Russian", 
          nativeName: "Русский",
          isRTL: false,
          isActive: true,
        },
        {
          code: "de",
          name: "German",
          nativeName: "Deutsch", 
          isRTL: false,
          isActive: true,
        },
        {
          code: "fr",
          name: "French",
          nativeName: "Français",
          isRTL: false, 
          isActive: true,
        },
        {
          code: "hi",
          name: "Hindi",
          nativeName: "हिन्दी",
          isRTL: false,
          isActive: true,
        }
      ],
      skipDuplicates: true
    });

    console.log("✅ Languages created");

    // 2. Create admin user
    const adminUser = await db.user.upsert({
      where: { email: "admin@galatide.com" },
      update: {},
      create: {
        name: "Admin User",
        email: "admin@galatide.com", 
        role: "ADMIN"
      }
    });

    console.log("✅ Admin user created");

    // 3. Create default tags
    const tags = await db.tag.createMany({
      data: [
        {
          name: "Exploration",
          slug: "exploration",
          color: "#3B82F6"
        },
        {
          name: "Deep Sea",
          slug: "deep-sea",
          color: "#1E40AF"
        },
        {
          name: "Marine Life",
          slug: "marine-life",
          color: "#059669"
        },
        {
          name: "Research",
          slug: "research", 
          color: "#7C2D12"
        },
        {
          name: "Conservation",
          slug: "conservation",
          color: "#15803D"
        },
        {
          name: "Technology",
          slug: "technology",
          color: "#9333EA"
        },
        {
          name: "Bioluminescence",
          slug: "bioluminescence",
          color: "#0891B2"
        }
      ],
      skipDuplicates: true
    });

    console.log("✅ Tags created");

    // Get the first English language ID and admin user ID
    const englishLang = await db.language.findFirst({ where: { code: "en" } });
    if (!englishLang) throw new Error("English language not found");

    // 4. Create a welcome article
    const welcomeArticle = await db.article.upsert({
      where: { 
        slug_originalLanguageId: {
          slug: "welcome-to-galatide-ocean",
          originalLanguageId: englishLang.id
        }
      },
      update: {},
      create: {
        title: "Welcome to Galatide Ocean",
        slug: "welcome-to-galatide-ocean", 
        excerpt: "Dive deep into the mysteries of our oceans and discover the wonders that lie beneath the surface.",
        content: `<h2>Welcome to the Deep</h2>
<p>Galatide Ocean is your gateway to exploring the mysteries of our planet's vast oceans. From bioluminescent creatures to deep-sea exploration, we bring you the latest discoveries and research from the world beneath the waves.</p>

<h3>What You'll Find Here</h3>
<ul>
<li><strong>Scientific Research:</strong> Latest oceanographic studies and findings</li>
<li><strong>Marine Life:</strong> Fascinating creatures and their adaptations</li>
<li><strong>Exploration:</strong> Deep-sea missions and underwater archaeology</li>
<li><strong>Conservation:</strong> Ocean protection and sustainability efforts</li>
</ul>

<p>Join us as we explore the final frontier on Earth - our magnificent oceans.</p>`,
        coverUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
        status: "PUBLISHED", 
        publishedAt: new Date(),
        estimatedReadingMinutes: 3,
        metaTitle: "Welcome to Galatide Ocean - Explore Ocean Mysteries",
        metaDescription: "Discover the wonders of our oceans with Galatide Ocean. Explore marine life, deep-sea research, and underwater mysteries.",
        keywords: "ocean, marine biology, deep sea, exploration, galatide",
        authorId: adminUser.id,
        originalLanguageId: englishLang.id
      }
    });

    console.log("✅ Welcome article created");

    // Get the tags we want to link
    const explorationTag = await db.tag.findFirst({ where: { slug: "exploration" } });
    const researchTag = await db.tag.findFirst({ where: { slug: "research" } });

    // 5. Link article to tags
    if (explorationTag && researchTag) {
      await db.articleTag.createMany({
        data: [
          {
            articleId: welcomeArticle.id,
            tagId: explorationTag.id
          },
          {
            articleId: welcomeArticle.id,
            tagId: researchTag.id
          }
        ],
        skipDuplicates: true
      });
    }

    console.log("✅ Article tags linked");

    // 6. Get counts for verification
    const counts = {
      languages: await db.language.count(),
      users: await db.user.count(),
      tags: await db.tag.count(), 
      articles: await db.article.count(),
      articleTags: await db.articleTag.count()
    };

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      counts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()  
    }, { status: 500 });
  }
}
