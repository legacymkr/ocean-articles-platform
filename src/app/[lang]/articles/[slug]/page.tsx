import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ArticlePageClient } from "./article-page-client";

interface ArticleData {
  article: any;
  translation: any;
}

// Server-side function to fetch article data
async function getArticleData(slug: string, lang: string): Promise<ArticleData | null> {
  if (!prisma) {
    return null;
  }

  try {
    // First, try to find a translation with this slug OR find translation of article with this slug
    if (lang !== "en") {
      const translation = await prisma.articleTranslation.findFirst({
        where: {
          OR: [
            {
              slug: slug,
              language: { code: lang },
              status: "PUBLISHED",
            },
            {
              article: { slug: slug },
              language: { code: lang },
              status: "PUBLISHED",
            }
          ]
        },
        include: {
          article: {
            include: {
              author: { select: { id: true, name: true } },
              originalLanguage: true,
              tags: {
                include: {
                  tag: true,
                },
              },
              translations: {
                where: { status: "PUBLISHED" },
                include: {
                  language: true,
                },
              },
            },
          },
          language: true,
        },
      });

      if (translation) {
        return {
          article: translation.article,
          translation: translation,
        };
      }
    }

    // If no translation found, look for original article with this slug
    const article = await prisma.article.findFirst({
      where: {
        slug: slug,
        status: "PUBLISHED",
      },
      include: {
        author: { select: { id: true, name: true } },
        originalLanguage: true,
        tags: {
          include: {
            tag: true,
          },
        },
        translations: {
          where: { status: "PUBLISHED" },
          include: {
            language: true,
          },
        },
      },
    });

    if (!article) {
      return null;
    }

    return {
      article: article,
      translation: null,
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug, lang } = resolvedParams;
  
  const data = await getArticleData(slug, lang);
  
  if (!data) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const { article, translation } = data;
  
  // Use translation metadata if available, otherwise fall back to original
  const title = translation?.metaTitle || translation?.title || article.metaTitle || article.title || "Galatide Ocean";
  const description = translation?.metaDescription || translation?.excerpt || article.metaDescription || article.excerpt || "Explore the mysteries of the ocean depths";
  const keywords = translation?.keywords || article.keywords || undefined;

  return {
    title: title,
    description: description,
    keywords: keywords || undefined,
    openGraph: {
      title: title,
      description: description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author?.name || "Galatide Team"],
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
  };
}

// Server component
export default async function LocalizedArticlePage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}) {
  const resolvedParams = await params;
  const { slug, lang } = resolvedParams;
  
  const data = await getArticleData(slug, lang);
  
  if (!data) {
    notFound();
  }

  // Pass data to client component
  return <ArticlePageClient initialData={data as any} lang={lang} slug={slug} />;
}
