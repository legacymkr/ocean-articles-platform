"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ArticleTranslationManager } from "@/components/admin/article-translation-manager";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

interface Article {
  id: string;
  title: string;
  originalLanguage: Language;
}

function TranslationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const articleId = searchParams.get("articleId");
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch translations data
  useEffect(() => {
    if (!articleId) {
      setError("No article ID provided");
      setLoading(false);
      return;
    }

    const fetchTranslations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/articles/${articleId}/translations`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch translations");
        }

        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load translations");
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [articleId]);

  const handleCreateTranslation = (articleId: string, languageId: string) => {
    router.push(`/admin/translations/new?articleId=${articleId}&languageId=${languageId}`);
  };

  const handleEditTranslation = (translationId: string) => {
    router.push(`/admin/translations/${translationId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading translations...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">{error || "Article not found"}</div>
            <Link href="/admin/articles">
              <Button>Return to Articles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-glow-primary">Translations</h1>
            <p className="text-muted-foreground mt-2">
              Manage translations for "{article.title}"
            </p>
          </div>
        </div>
      </div>

      {/* Translation Management */}
      <ScrollReveal>
        <ArticleTranslationManager
          articleId={article.id}
          articleTitle={article.title}
          originalLanguage={article.originalLanguage}
          onCreateTranslation={handleCreateTranslation}
          onEditTranslation={handleEditTranslation}
        />
      </ScrollReveal>
    </div>
  );
}

export default function TranslationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TranslationsPageContent />
    </Suspense>
  );
}
