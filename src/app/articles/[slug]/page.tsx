"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CTABar } from "@/components/cta-bar";
import { FocusMode } from "@/components/focus-mode";
import { useNavbar } from "@/components/navbar-provider";
import { formatDate } from "@/lib/date";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { detectLangFromPath, t } from "@/lib/i18n";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  type: "VARIOUS" | "CLUSTER" | "SERIES";
  publishedAt: string;
  author: {
    name: string;
  };
  tags: Array<{
    tag: {
      name: string;
    };
  }>;
  metaTitle?: string;
  metaDescription?: string;
  readTime?: number;
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { isFocusMode, toggleFocusMode } = useNavbar();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const pathname = usePathname();

  const currentLang = detectLangFromPath(pathname);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        let response = await fetch(`/api/articles?slug=${resolvedParams.slug}&status=published&languageId=${currentLang}`);

        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch article");
        }

        let data = await response.json();
        if (data.articles && data.articles.length > 0) {
          setArticle(data.articles[0]);
        } else {
          // Fallback to English if no translation found
          if (currentLang !== "en") {
            response = await fetch(`/api/articles?slug=${resolvedParams.slug}&status=published&languageId=en`);
            if (!response.ok) throw new Error("Failed to fetch fallback article");
            data = await response.json();
            if (data.articles && data.articles.length > 0) {
              setArticle(data.articles[0]);
              return;
            }
          }
          notFound();
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params]);

  if (loading) {
    return (
      <FocusMode isActive={isFocusMode} onToggle={toggleFocusMode}>
        <div className="min-h-screen">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading article...</p>
            </div>
          </div>
        </div>
      </FocusMode>
    );
  }

  if (!article) {
    notFound();
  }

  // Use provided readTime or compute as fallback
  const readTime = typeof article.readTime === "number"
    ? article.readTime
    : Math.ceil(((article.content || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length || 0) / 200);

  return (
    <FocusMode isActive={isFocusMode} onToggle={toggleFocusMode}>
      <div className="min-h-screen">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-background/50 z-50">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Header */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal delay={0}>
              <div className="mb-8">
                <Link href="/articles">
                  <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t(currentLang, "backToArticles")}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{article.type}</Badge>
                </div>

                <h1 className="text-4xl md:text-6xl font-heading font-bold text-glow-primary">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="text-xl text-muted-foreground text-glow-subtle">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {article.author?.name || 'Author'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {currentLang === "ar" ? `${readTime} ${t(currentLang, "minRead")}` : `${readTime} ${t(currentLang, "minRead")}`}
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t(currentLang, "share")}
                </Button>
              </div>
            </ScrollReveal>

            {article.tags.length > 0 && (
              <ScrollReveal delay={300}>
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.tag?.name || 'Unknown Tag'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {article.coverUrl && (
              <ScrollReveal delay={400}>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-8">
                  <img
                    src={article.coverUrl}
                    alt={article.metaTitle || article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal delay={500}>
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <ScrollReveal delay={600}>
          <CTABar
            title="Continue Your Journey"
            description="Explore more fascinating stories from the depths of our oceans and the vastness of space."
            buttonText="Discover More"
            buttonHref="/articles"
            variant="primary"
            icon="sparkles"
          />
        </ScrollReveal>
      </div>
    </FocusMode>
  );
}
