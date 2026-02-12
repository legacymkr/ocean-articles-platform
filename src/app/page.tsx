"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Sparkles, Rocket, Zap } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CTABar } from "@/components/cta-bar";
import { formatDate } from "@/lib/date";
import { detectLangFromPath, t } from "@/lib/i18n";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string;
  author: {
    name: string;
  };
  tags: Array<{
    tag?: {
      name?: string;
    };
    name?: string;
  }>;
}

export default function Home() {
  const pathname = usePathname();
  const currentLang = detectLangFromPath(pathname);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Create language-aware routes
  const articlesUrl = currentLang === "en" ? "/articles" : `/${currentLang}/articles`;

  // Fetch latest articles
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles?status=published&limit=3&lang=${currentLang}`);
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();
        setLatestArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching latest articles:", error);
        setLatestArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestArticles();
  }, [currentLang]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Layered Background */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20 pt-32 overflow-hidden">
        {/* Layered Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep space gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

          {/* Stellar glow spots */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div
            className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-secondary/15 blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-1/3 left-1/3 w-20 h-20 rounded-full bg-primary/8 blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <ScrollReveal delay={0}>
          <h1
            className="text-4xl md:text-6xl font-heading font-bold text-glow-primary mb-6 animate-float-up"
            style={{ animationDelay: "0.2s" }}
            dir={currentLang === "ar" ? "rtl" : "ltr"}
          >
            {t(currentLang, "welcomeToGalatide")}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl text-glow-subtle animate-float-up"
            style={{ animationDelay: "0.4s" }}
            dir={currentLang === "ar" ? "rtl" : "ltr"}
          >
            {t(currentLang, "discoverOceanSecrets")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div
            className="flex flex-col sm:flex-row gap-4 mb-12 animate-float-up"
            style={{ animationDelay: "0.6s" }}
          >
            <Link href={articlesUrl}>
              <Button size="lg" className="ripple-effect">
                <Rocket className="h-5 w-5 mr-2" />
                {t(currentLang, "articles")}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="ripple-effect">
              <Sparkles className="h-5 w-5 mr-2" />
              {t(currentLang, "exploreTheDepths")}
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div
            className="relative z-10 drop-shadow-lg animate-float-up"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="animate-bounce">
              <ArrowDown className="h-8 w-8 text-primary mx-auto" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Explore Further</p>
          </div>
        </ScrollReveal>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal delay={0}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-glow-primary mb-4">
                {t(currentLang as any, "discoverUnknown")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t(currentLang as any, "discoverDescription")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <ScrollReveal delay={0}>
              <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading text-glow-primary">
                    {t(currentLang as any, "oceanDepths")}
                  </CardTitle>
                  <CardDescription>
                    {t(currentLang as any, "oceanDepthsDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl font-heading text-glow-primary">
                    {t(currentLang as any, "oceanMysteries")}
                  </CardTitle>
                  <CardDescription>
                    {t(currentLang as any, "oceanMysteriesDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <Card className="glass-card hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading text-glow-primary">
                    {t(currentLang as any, "scientificResearch")}
                  </CardTitle>
                  <CardDescription>
                    {t(currentLang as any, "scientificResearchDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal delay={0}>
            <div className="text-center mb-16">
              <h2 
                className="text-3xl md:text-4xl font-heading font-bold text-glow-primary mb-4"
                dir={currentLang === "ar" ? "rtl" : "ltr"}
              >
                {t(currentLang, "latestArticles")}
              </h2>
              <p 
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
                dir={currentLang === "ar" ? "rtl" : "ltr"}
              >
                {t(currentLang, "exploreLatestContent")}
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t(currentLang, "loadingArticles")}</p>
              </div>
            </div>
          ) : latestArticles.length === 0 ? (
            <ScrollReveal delay={200}>
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <div 
                    className="text-muted-foreground"
                    dir={currentLang === "ar" ? "rtl" : "ltr"}
                  >
                    {t(currentLang, "noLatestArticles")}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {latestArticles.map((article, index) => (
                <ScrollReveal key={article.id} delay={200 + index * 100}>
                  <Card className={`glass-card hover:border-primary/50 transition-all duration-300 group ${
                    index === 0 ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''
                  }`}>
                    <CardHeader className="p-0">
                      {article.coverUrl ? (
                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                          <img
                            src={article.coverUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                          <div className="text-4xl opacity-50">🚀</div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <CardTitle className={`text-xl font-heading group-hover:text-primary transition-colors line-clamp-2 ${
                          index === 0 ? 'text-primary text-glow-primary' : 'text-glow-primary'
                        }`}>
                          {article.title}
                        </CardTitle>

                        {article.excerpt && (
                          <CardDescription className="line-clamp-3">
                            {article.excerpt}
                          </CardDescription>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full"
                              >
                                {tag?.tag?.name || tag?.name || 'Tag'}
                              </span>
                            ))}
                            {article.tags.length > 2 && (
                              <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                                +{article.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <Link href={`${articlesUrl}/${article.slug}`}>
                          <Button className="w-full ripple-effect">Read More</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}

          {latestArticles.length > 0 && (
            <ScrollReveal delay={500}>
              <div className="text-center mt-12">
                <Link href={articlesUrl}>
                  <Button size="lg" variant="outline" className="ripple-effect">
                    {t(currentLang, "viewAllArticles")}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-glow-primary mb-4">
                Stay Connected with the Ocean
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Subscribe to our newsletter and never miss the latest ocean discoveries, research breakthroughs, and mysterious deep-sea findings.
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <NewsletterSignup />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <ScrollReveal delay={600}>
        <CTABar
          title={t(currentLang, "readyToDiveDeeper")}
          description={t(currentLang, "joinCommunityDescription")}
          buttonText={t(currentLang, "startExploring")}
          buttonHref={articlesUrl}
          variant="primary"
          icon="sparkles"
        />
      </ScrollReveal>
    </div>
  );
}
