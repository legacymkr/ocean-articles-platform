/**
 * Article service with multi-language support
 */

import { db } from "@/lib/db";
import { DatabaseWrapper } from "@/lib/db-wrapper";
import { generateSlug, generateUniqueSlug } from "@/lib/slug";
import { ArticleStatus } from "@prisma/client";
import { EmailService } from "./email-service";

export interface CreateArticleData {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  status?: ArticleStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  authorId: string;
  languageId: string;
  tagIds?: string[];
}

export interface UpdateArticleData {
  title?: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  status?: ArticleStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  tagIds?: string[];
}

export interface CreateTranslationData {
  articleId: string;
  languageId: string;
  title?: string;
  excerpt?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  translatorId?: string;
}

export class ArticleService {
  private static computeReadTimeFromHtml(html: string | undefined): number | undefined {
    if (!html) return undefined;
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/&[^;]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return 0;
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  /**
   * Get translated tag names for a given language with fallback to original names
   */
  private static async getTranslatedTags(tagIds: string[], languageCode: string) {
    if (!db || !tagIds.length) return [];

    try {
      const tags = await db.tag.findMany({
        where: { id: { in: tagIds } },
        include: {
          translations: {
            where: { languageCode },
          },
        },
      });

      return tags.map(tag => ({
        id: tag.id,
        name: tag.translations[0]?.name || tag.name || 'Unnamed Tag', // Use translation or fallback to original
        color: tag.color || '#6366f1', // Default color if none set
        slug: tag.slug,
      })).filter(tag => tag.name && tag.name !== 'Unnamed Tag'); // Filter out tags without proper names
    } catch (error) {
      console.error("Error fetching translated tags:", error);
      return [];
    }
  }
  /**
   * Create a new article
   */
  static async createArticle(data: CreateArticleData) {
    if (!db) {
      throw new Error("Database not available");
    }

    // Prefer provided slug; otherwise generate from title
    const baseSlug = data.slug && data.slug.trim().length > 0 ? data.slug : generateSlug(data.title || "untitled");

    // Get existing slugs for this language
    const existingSlugs = await db.article.findMany({
      where: { originalLanguageId: data.languageId },
      select: { slug: true },
    });

    const uniqueSlug = await generateUniqueSlug(
      baseSlug,
      existingSlugs.map((a) => a.slug || "").filter(Boolean),
    );

    const article = await db.article.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        excerpt: data.excerpt,
        content: data.content,
        coverUrl: data.coverUrl,
        status: data.status ?? ArticleStatus.DRAFT,
        publishedAt: (data.status ?? ArticleStatus.DRAFT) === ArticleStatus.PUBLISHED ? new Date() : undefined,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        authorId: data.authorId,
        originalLanguageId: data.languageId,
        tags: data.tagIds
          ? {
              create: data.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        author: true,
        originalLanguage: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      ...article,
      readTime: ArticleService.computeReadTimeFromHtml(article.content || undefined),
    } as any;
  }

  /**
   * Get article by slug and language
   */
  static async getArticleBySlug(slug: string, languageCode: string) {
    if (!db) {
      throw new Error("Database not available");
    }

    // First, get the language
    const language = await db.language.findUnique({
      where: { code: languageCode },
    });

    if (!language) {
      throw new Error("Language not found");
    }

    // Try to find the article in the requested language
    let article = await db.article.findFirst({
      where: {
        slug,
        originalLanguageId: language.id,
        status: ArticleStatus.PUBLISHED,
      },
      include: {
        author: true,
        originalLanguage: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // If not found, try to find a translation
    if (!article) {
      const translation = await db.articleTranslation.findFirst({
        where: {
          slug,
          languageId: language.id,
          status: ArticleStatus.PUBLISHED,
        },
        include: {
          article: {
            include: {
              author: true,
              originalLanguage: true,
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
          language: true,
          translator: true,
        },
      });

      if (translation) {
        // Return the original article with translation data
        article = {
          ...translation.article,
          title: translation.title,
          excerpt: translation.excerpt,
          content: translation.content,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          keywords: translation.keywords,
        };
      }
    }

    if (!article) return null as any;

    // Get translated tags for this language
    const tagIds = (article as any).tags.map((at: any) => at.tag.id);
    const translatedTags = await this.getTranslatedTags(tagIds, languageCode);

    return {
      ...article,
      tags: translatedTags,
      readTime: ArticleService.computeReadTimeFromHtml((article as any).content),
    } as any;
  }

  /**
   * Get all published articles with pagination
   */
  static async getPublishedArticles(
    languageCode: string,
    page: number = 1,
    limit: number = 10,
    tagSlug?: string,
  ) {
    if (!db) {
      throw new Error("Database not available");
    }

    const language = await db.language.findUnique({
      where: { code: languageCode },
    });

    if (!language) {
      throw new Error("Language not found");
    }

    const skip = (page - 1) * limit;

    const where: {
      OR: Array<
        | {
            originalLanguageId: string;
            status: ArticleStatus;
          }
        | {
            translations: {
              some: {
                languageId: string;
                status: ArticleStatus;
              };
            };
          }
      >;
      tags?: {
        some: {
          tag: {
            slug: string;
          };
        };
      };
    } = {
      OR: [
        {
          originalLanguageId: language.id,
          status: ArticleStatus.PUBLISHED,
        },
        {
          translations: {
            some: {
              languageId: language.id,
              status: ArticleStatus.PUBLISHED,
            },
          },
        },
      ],
    };

    if (tagSlug) {
      where.tags = {
        some: {
          tag: {
            slug: tagSlug,
          },
        },
      };
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: true,
          originalLanguage: true,
          tags: {
            include: {
              tag: true,
            },
          },
          translations: {
            where: {
              languageId: language.id,
              status: ArticleStatus.PUBLISHED,
            },
            include: {
              language: true,
            },
          },
        },
      }),
      db.article.count({ where }),
    ]);

    // Process articles to use translation data if available
    const processedArticles = articles.map((article) => {
      const translation = article.translations[0];
      const base = translation
        ? {
            ...article,
            title: translation.title,
            excerpt: translation.excerpt,
            metaTitle: translation.metaTitle,
            metaDescription: translation.metaDescription,
            keywords: translation.keywords,
          }
        : article;
      return {
        ...base,
        readTime: ArticleService.computeReadTimeFromHtml((base as any).content),
      } as any;
    });

    return {
      articles: processedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a translation for an article
   */
  static async createTranslation(data: CreateTranslationData) {
    if (!db) {
      throw new Error("Database not available");
    }

    const slug = generateSlug(data.title || "untitled");

    // Get existing slugs for this language
    const existingSlugs = await db.articleTranslation.findMany({
      where: { languageId: data.languageId },
      select: { slug: true },
    });

    const uniqueSlug = await generateUniqueSlug(
      slug,
      existingSlugs.map((t) => t.slug || "").filter(Boolean),
    );

    const translation = await db.articleTranslation.create({
      data: {
        ...data,
        slug: uniqueSlug,
      },
      include: {
        article: true,
        language: true,
        translator: true,
      },
    });

    return translation;
  }

  /**
   * Update an article
   */
  static async updateArticle(articleId: string, data: UpdateArticleData) {
    if (!db) {
      throw new Error("Database not available");
    }

    // Extract tags and tagIds from data to handle separately
    const { tags, tagIds, ...restData } = data as any;
    
    const updateData: Partial<{
      title: string;
      excerpt: string;
      content: string;
      coverUrl: string;
      status: ArticleStatus;
      metaTitle: string;
      metaDescription: string;
      keywords: string;
      slug: string;
    }> = { ...restData };

    // If title is being updated, regenerate slug
    if (data.title) {
      const article = await db.article.findUnique({
        where: { id: articleId },
        select: { originalLanguageId: true },
      });

      if (article) {
        const slug = generateSlug(data.title || "untitled");

        // Get existing slugs for this language
        const existingSlugs = await db.article.findMany({
          where: {
            originalLanguageId: article.originalLanguageId,
            id: { not: articleId },
          },
          select: { slug: true },
        });

        const uniqueSlug = await generateUniqueSlug(
          slug,
          existingSlugs.map((a) => a.slug || "").filter(Boolean),
        );

        updateData.slug = uniqueSlug;
      }
    }

    // If status is being updated, manage publishedAt accordingly
    if (data.status) {
      if (data.status === ArticleStatus.PUBLISHED) {
        (updateData as any).publishedAt = new Date();
      } else if (data.status === ArticleStatus.DRAFT) {
        (updateData as any).publishedAt = null;
      }
    }

    // Handle tag updates
    if (data.tagIds !== undefined) {
      // Remove existing tags
      await db.articleTag.deleteMany({
        where: { articleId },
      });

      // Add new tags
      if (data.tagIds.length > 0) {
        await db.articleTag.createMany({
          data: data.tagIds.map((tagId) => ({
            articleId,
            tagId,
          })),
        });
      }
    }

    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: updateData,
      include: {
        author: true,
        originalLanguage: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return {
      ...updatedArticle,
      readTime: ArticleService.computeReadTimeFromHtml(updatedArticle.content || undefined),
    } as any;
  }

  /**
   * Delete an article
   */
  static async deleteArticle(articleId: string) {
    if (!db) {
      throw new Error("Database not available");
    }

    return await db.article.delete({
      where: { id: articleId },
    });
  }

  /**
   * Publish an article and send notifications
   */
  static async publishArticle(articleId: string) {
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      // Update article status to published
      const article = await db.article.update({
        where: { id: articleId },
        data: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        include: {
          author: true,
          originalLanguage: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Send email notifications
      const emailResult = await EmailService.notifyArticlePublished(articleId);

      // Trigger sitemap regeneration
      try {
        const { SitemapService } = await import('./sitemap-service');
        await SitemapService.regenerateSitemaps();
      } catch (sitemapError) {
        console.warn('Failed to regenerate sitemaps:', sitemapError);
        // Don't fail the publish if sitemap generation fails
      }

      return {
        success: true,
        article,
        emailResult,
      };
    } catch (error) {
      console.error("Error publishing article:", error);
      return { success: false, error: "Failed to publish article" };
    }
  }

  /**
   * Get article by ID
   */
  static async getArticleById(articleId: string, languageId?: string) {
    if (!db) {
      return null;
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        author: true,
        originalLanguage: true,
        tags: {
          include: {
            tag: true,
          },
        },
        translations: languageId
          ? {
              where: { languageId },
              include: {
                language: true,
              },
            }
          : {
              include: {
                language: true,
              },
            },
      },
    });

    if (!article) {
      return null;
    }

    // Get language code for tag translations
    let languageCode = "en";
    if (languageId) {
      const language = await db.language.findUnique({
        where: { id: languageId },
      });
      languageCode = language?.code || "en";
    }

    // Get translated tags for this language
    const tagIds = article.tags.map((at) => at.tag.id);
    const translatedTags = await this.getTranslatedTags(tagIds, languageCode);

    // If a specific language is requested and there's a translation, use it
    if (languageId && article.translations.length > 0) {
      const translation = article.translations[0];
      return {
        ...article,
        title: translation.title,
        excerpt: translation.excerpt,
        content: translation.content,
        metaTitle: translation.metaTitle,
        metaDescription: translation.metaDescription,
        keywords: translation.keywords,
        tags: translatedTags,
        readTime: ArticleService.computeReadTimeFromHtml(translation.content || undefined),
      } as any;
    }
    return {
      ...article,
      tags: translatedTags,
      readTime: ArticleService.computeReadTimeFromHtml(article.content || undefined),
    } as any;
  }

  /**
   * Get articles with filters (for admin dashboard)
   */
  static async getArticles({
    page = 1,
    limit = 10,
    status,
    languageId = "1",
  }: {
    page?: number;
    limit?: number;
    status?: "draft" | "published";
    languageId?: string;
  }) {
    // If database is not available, return empty result
    if (!db) {
      return {
        articles: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;

    const where: {
      status?: "DRAFT" | "PUBLISHED";
    } = {};

    if (status) {
      where.status = status.toUpperCase() as "DRAFT" | "PUBLISHED";
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          originalLanguage: true,
          tags: {
            include: {
              tag: true,
            },
          },
          translations: {
            where: { languageId },
            include: {
              language: true,
            },
          },
        },
      }),
      db.article.count({ where }),
    ]);

    // Get language code for tag translations
    const language = await db.language.findUnique({
      where: { id: languageId },
    });
    const languageCode = language?.code || "en";

    // Process articles to use translation data if available
    const processedArticles = await Promise.all(
      articles.map(async (article) => {
        const translation = article.translations[0];
        const base = translation
          ? {
              ...article,
              title: translation.title,
              excerpt: translation.excerpt,
              metaTitle: translation.metaTitle,
              metaDescription: translation.metaDescription,
              keywords: translation.keywords,
            }
          : article;

        // Get translated tags for this language
        const tagIds = article.tags.map((at) => at.tag.id);
        const translatedTags = await this.getTranslatedTags(tagIds, languageCode);

        return {
          ...base,
          tags: translatedTags,
          readTime: ArticleService.computeReadTimeFromHtml((base as any).content),
        } as any;
      })
    );

    return {
      articles: processedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get articles with translations support (for public API)
   */
  static async getArticlesWithTranslations({
    page = 1,
    limit = 10,
    status,
    languageCode = "en",
  }: {
    page?: number;
    limit?: number;
    status?: "draft" | "published";
    languageCode?: string;
  }) {
    if (!db) {
      return {
        articles: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Use database wrapper for robust error handling
    const language = await DatabaseWrapper.query(async () => {
      if (!db) {
        throw new Error("Database not available");
      }
      return db.language.findUnique({
        where: { code: languageCode },
      });
    });

    if (!language) {
      // Return empty result if language not found (database not seeded yet)
      return {
        articles: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const skip = (page - 1) * limit;
    const statusValue = status ? (status.toUpperCase() as "DRAFT" | "PUBLISHED") : undefined;

    const where: {
      OR: Array<
        | {
            originalLanguageId: string;
            status?: "DRAFT" | "PUBLISHED";
          }
        | {
            translations: {
              some: {
                languageId: string;
                status?: "DRAFT" | "PUBLISHED";
              };
            };
          }
      >;
    } = {
      OR: [
        {
          originalLanguageId: language.id,
          ...(statusValue && { status: statusValue }),
        },
        {
          translations: {
            some: {
              languageId: language.id,
              ...(statusValue && { status: statusValue }),
            },
          },
        },
      ],
    };

    // Use database wrapper for parallel queries with retry logic
    const [articles, total] = await DatabaseWrapper.queryAll([
      () => {
        if (!db) throw new Error("Database not available");
        return db.article.findMany({
          where,
          skip,
          take: limit,
          orderBy: { publishedAt: "desc" },
          include: {
            author: { select: { id: true, name: true } },
            originalLanguage: true,
            tags: {
              include: {
                tag: true,
              },
            },
            translations: {
              where: {
                languageId: language.id,
              },
              include: {
                language: true,
              },
            },
          },
        });
      },
      () => {
        if (!db) throw new Error("Database not available");
        return db.article.count({ where });
      },
    ]);

    // Handle null results from database wrapper
    if (!articles || total === null) {
      console.error("Failed to fetch articles from database");
      return {
        articles: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

      // Process articles to include translation data and translated tags
      const processedArticles = await Promise.all(
        articles.map(async (article) => {
          const translation = article.translations[0];
          
          // Use translation data if available, otherwise use original
          const finalTitle = translation?.title || article.title;
          const finalExcerpt = translation?.excerpt || article.excerpt;
          const finalContent = translation?.content || article.content;
          
          // Get translated tags for this language
          const tagIds = article.tags.map((at) => at.tag.id);
          const translatedTags = await this.getTranslatedTags(tagIds, languageCode);
          
          return {
            id: article.id,
            title: finalTitle,
            slug: article.slug,
            excerpt: finalExcerpt || "",
            content: finalContent || "",
            coverUrl: article.coverUrl,
            status: article.status,
            publishedAt: article.publishedAt?.toISOString() || new Date().toISOString(),
            author: article.author,
            tags: translatedTags,
            readTime: this.computeReadTimeFromHtml(finalContent || undefined),
          };
        })
      );

    return {
      articles: processedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get article statistics
   */
  static async getArticleStats() {
    if (!db) {
      return {
        total: 0,
        published: 0,
        drafts: 0,
        translations: 0,
      };
    }

    const [total, published, drafts, translations] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      db.article.count({ where: { status: ArticleStatus.DRAFT } }),
      db.articleTranslation.count(),
    ]);

    return {
      total,
      published,
      drafts,
      translations,
    };
  }
}
