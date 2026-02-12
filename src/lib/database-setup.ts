/**
 * Database Setup Utilities for Galatide
 * Handles initial database population and migrations
 */

import { db } from "@/lib/db";

// Default languages to populate
export const DEFAULT_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", isRTL: false },
  { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true },
  { code: "zh", name: "Chinese", nativeName: "中文", isRTL: false },
  { code: "ru", name: "Russian", nativeName: "Русский", isRTL: false },
  { code: "de", name: "German", nativeName: "Deutsch", isRTL: false },
  { code: "fr", name: "French", nativeName: "Français", isRTL: false },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false },
  { code: "es", name: "Spanish", nativeName: "Español", isRTL: false },
];

// Default tags to populate
export const DEFAULT_TAGS = [
  { name: "Deep Sea", slug: "deep-sea", color: "#0EA5E9" },
  { name: "Research", slug: "research", color: "#8B5CF6" },
  { name: "Mystery", slug: "mystery", color: "#EF4444" },
  { name: "Bioluminescence", slug: "bioluminescence", color: "#10B981" },
  { name: "Marine Biology", slug: "marine-biology", color: "#F59E0B" },
  { name: "Space", slug: "space", color: "#6366F1" },
  { name: "Ocean", slug: "ocean", color: "#06B6D4" },
  { name: "Philosophy", slug: "philosophy", color: "#84CC16" },
  { name: "Technology", slug: "technology", color: "#F97316" },
  { name: "Discovery", slug: "discovery", color: "#EC4899" },
];

export class DatabaseSetup {
  /**
   * Initialize database with default data
   */
  static async initializeDatabase(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    if (!db) {
      return {
        success: false,
        message: "Database connection not available",
      };
    }

    try {
      // Check if already initialized
      const existingLanguages = await db!.language.count();
      if (existingLanguages > 0) {
        return {
          success: true,
          message: "Database already initialized",
          data: { languages: existingLanguages },
        };
      }

      // Create languages
      const languages = await Promise.all(
        DEFAULT_LANGUAGES.map((lang) =>
          db!.language.create({
            data: lang,
          })
        )
      );

      // Create tags
      const tags = await Promise.all(
        DEFAULT_TAGS.map((tag) =>
          db!.tag.create({
            data: tag,
          })
        )
      );

      // Create default admin user if none exists
      const existingUsers = await db!.user.count();
      let adminUser = null;
      
      if (existingUsers === 0) {
        adminUser = await db!.user.create({
          data: {
            name: "Admin User",
            email: "admin@astroqua.com",
            role: "ADMIN",
          },
        });
      }

      return {
        success: true,
        message: "Database initialized successfully",
        data: {
          languages: languages.length,
          tags: tags.length,
          adminUser: adminUser ? "Created" : "Already exists",
        },
      };
    } catch (error) {
      console.error("Database initialization error:", error);
      return {
        success: false,
        message: `Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Seed database with sample articles
   */
  static async seedSampleData(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    if (!db) {
      return {
        success: false,
        message: "Database connection not available",
      };
    }

    try {
      // Get required data
      const englishLang = await db!.language.findFirst({ where: { code: "en" } });
      const adminUser = await db!.user.findFirst({ where: { role: "ADMIN" } });
      const sampleTags = await db!.tag.findMany({ take: 3 });

      if (!englishLang || !adminUser) {
        return {
          success: false,
          message: "Required data not found. Please initialize database first.",
        };
      }

      // Check if sample articles already exist
      const existingArticles = await db!.article.count();
      if (existingArticles > 0) {
        return {
          success: true,
          message: "Sample articles already exist",
          data: { articles: existingArticles },
        };
      }

      // Sample articles
      const sampleArticles = [
        {
          title: "The Abyssal Station Discovery",
          slug: "abyssal-station-discovery",
          excerpt: "A research facility at the bottom of the Mariana Trench discovers something that shouldn't exist...",
          content: `
            <h2>The Discovery</h2>
            <p>Dr. Elena Vasquez reports strange readings from the deepest point on Earth. The Mariana Trench has always been a place of mystery, but what we found there challenges everything we thought we knew about the deep ocean.</p>
            
            <h3>Initial Findings</h3>
            <p>Our research vessel, the <em>Abyssal Explorer</em>, detected unusual electromagnetic signatures at a depth of 10,984 meters. The readings were unlike anything we've seen before - rhythmic, almost musical in nature.</p>
            
            <blockquote>
              <p>"It was like listening to the ocean's heartbeat," said Dr. Vasquez. "But this wasn't natural. This was something else entirely."</p>
            </blockquote>
          `,
          coverUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
          type: "VARIOUS" as const,
          status: "PUBLISHED" as const,
          metaTitle: "The Abyssal Station Discovery - Galatide",
          metaDescription: "Discover the mysterious findings from the deepest point on Earth",
          keywords: "deep sea, research, discovery, ocean mystery",
        },
        {
          title: "Bioluminescent Mysteries of the Deep",
          slug: "bioluminescent-mysteries",
          excerpt: "Exploring the fascinating world of deep-sea bioluminescence and the creatures that create their own light...",
          content: `
            <h2>The Living Light Show</h2>
            <p>In the eternal darkness of the deep ocean, where sunlight never reaches, life has evolved one of nature's most spectacular adaptations: bioluminescence.</p>
            
            <h3>How Bioluminescence Works</h3>
            <p>Bioluminescence is a chemical reaction that produces light. In marine organisms, it typically involves a molecule called luciferin and an enzyme called luciferase.</p>
          `,
          coverUrl: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&h=600&fit=crop",
          type: "CLUSTER" as const,
          status: "PUBLISHED" as const,
          metaTitle: "Bioluminescent Mysteries - Ocean Light Show",
          metaDescription: "Explore the fascinating world of deep-sea bioluminescence",
          keywords: "bioluminescence, marine biology, deep sea creatures",
        },
      ];

      // Create sample articles
      const createdArticles = await Promise.all(
        sampleArticles.map((article) =>
          db!.article.create({
            data: {
              ...article,
              authorId: adminUser.id,
              originalLanguageId: englishLang.id,
              publishedAt: new Date(),
              tags: {
                create: sampleTags.slice(0, 2).map((tag) => ({
                  tagId: tag.id,
                })),
              },
            },
            include: {
              author: true,
              originalLanguage: true,
              tags: {
                include: { tag: true },
              },
            },
          })
        )
      );

      return {
        success: true,
        message: "Sample data seeded successfully",
        data: {
          articles: createdArticles.length,
        },
      };
    } catch (error) {
      console.error("Sample data seeding error:", error);
      return {
        success: false,
        message: `Failed to seed sample data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Reset database (caution: deletes all data)
   */
  static async resetDatabase(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!db) {
      return {
        success: false,
        message: "Database connection not available",
      };
    }

    try {
      // Delete in proper order to respect foreign key constraints
      await db!.articleTranslation.deleteMany();
      await db!.articleTag.deleteMany();
      await db!.article.deleteMany();
      await db!.tag.deleteMany();
      await db!.user.deleteMany();
      await db!.language.deleteMany();

      return {
        success: true,
        message: "Database reset successfully",
      };
    } catch (error) {
      console.error("Database reset error:", error);
      return {
        success: false,
        message: `Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get database status
   */
  static async getDatabaseStatus(): Promise<{
    success: boolean;
    data?: {
      languages: number;
      tags: number;
      users: number;
      articles: number;
      translations: number;
    };
    message?: string;
  }> {
    if (!db) {
      return {
        success: false,
        message: "Database connection not available",
      };
    }

    try {
      const [languages, tags, users, articles, translations] = await Promise.all([
        db.language.count(),
        db.tag.count(),
        db.user.count(),
        db.article.count(),
        db.articleTranslation.count(),
      ]);

      return {
        success: true,
        data: {
          languages,
          tags,
          users,
          articles,
          translations,
        },
      };
    } catch (error) {
      console.error("Database status error:", error);
      return {
        success: false,
        message: `Failed to get database status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
