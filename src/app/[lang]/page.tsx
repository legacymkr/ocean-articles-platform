"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Sparkles, Rocket, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { CTABar } from "@/components/cta-bar";
import { formatDate } from "@/lib/date";
import { t, type SupportedLang } from "@/lib/i18n";
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
    tag: {
      name: string;
    };
  }>;
}

export default function LanguageHome() {
  const params = useParams();
  const currentLang = (params?.lang as string || "en") as SupportedLang;
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
          console.error(`Articles API returned ${response.status}: ${response.statusText}`);
          throw new Error(`Failed to fetch articles: ${response.status}`);
        }

        const data = await response.json();
        console.log("Articles API response:", data);
        setLatestArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setLatestArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestArticles();
  }, [currentLang]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          <div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 text-glow-primary">
              {t(currentLang, "welcomeToGalatide")}
            </h1>
            <div className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary/80">
              {t(currentLang, "galatideOcean")}
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t(currentLang, "discoverOceanSecrets")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={articlesUrl}>
                <Button size="lg" className="ripple-effect text-lg px-8 py-4">
                  {t(currentLang, "beginJourney")}
                  <ArrowDown className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-glow-primary mb-4">
                {t(currentLang, "discoverUnknown")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t(currentLang, "discoverDescription")}
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
                    {t(currentLang, "oceanDepths")}
                  </CardTitle>
                  <CardDescription>
                    {t(currentLang, "oceanDepthsDesc")}
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
                    {t(currentLang, "oceanMysteries")}
                  </CardTitle>
                  <CardDescription>
                    {t(currentLang, "oceanMysteriesDesc")}
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
                    {t(currentLang, "scientificResearch")}
                  </CardTitle>
                  <CardDescription>
                    {t(currentLang, "scientificResearchDesc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-glow-primary mb-4">
                {t(currentLang, "latestArticles")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t(currentLang, "exploreLatestContent")}
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
                          <Sparkles className="h-12 w-12 text-primary/60" />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags?.slice(0, 2).map((tagRelation, idx) => (
                          <span
                            key={tagRelation?.tag?.name || idx}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {tagRelation?.tag?.name || 'Tag'}
                          </span>
                        )) || []}
                      </div>
                      <CardTitle className={`text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
                        index === 0 ? 'text-primary text-glow-primary' : ''
                      }`}>
                        {article.title}
                      </CardTitle>
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{article.author?.name || 'Author'}</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <Link 
                        href={currentLang === "en" ? `/articles/${article.slug}` : `/${currentLang}/articles/${article.slug}`}
                        className="mt-4 inline-block"
                      >
                        <Button variant="ghost" size="sm" className="w-full">
                          {t(currentLang, "readMore")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}

          <ScrollReveal delay={400}>
            <div className="text-center mt-12">
              <Link href={articlesUrl}>
                <Button variant="outline" size="lg">
                  {t(currentLang, "viewAllArticles")}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <CTABar 
        title={t(currentLang, "exploreTheDepths")}
        description={t(currentLang, "discoverOceanSecrets")}
        buttonText={t(currentLang, "beginJourney")}
        buttonHref={articlesUrl}
        variant="primary"
        icon="sparkles"
      />
    </div>
  );
}
