"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ArrowLeft, Save, Globe, Languages, Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

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
  slug: string;
  excerpt: string;
  content: string;
  coverUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  originalLanguage: Language;
  tags?: Array<{ tag: { name: string } }>;
}

function NewTranslationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");
  const languageId = searchParams.get("languageId");

  const [article, setArticle] = useState<Article | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    // Publishing fields
    author: "Galatide Authors",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    publishedAt: "",
    scheduledPublishAt: "",
    estimatedReadingMinutes: "5",
  });



  useEffect(() => {
    if (!articleId || !languageId) {
      setError("Missing article ID or language ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch original article
        const articleResponse = await fetch(`/api/articles/${articleId}`);
        if (!articleResponse.ok) {
          const errorText = await articleResponse.text();
          console.error('Failed to fetch article:', errorText);
          throw new Error("Failed to fetch article");
        }
        const articleData = await articleResponse.json();
        console.log('Fetched article data:', articleData);
        // API returns { article: {...} }, extract the article object
        setArticle(articleData.article || articleData);

        // Fetch target language
        const languageResponse = await fetch(`/api/languages/${languageId}`);
        if (!languageResponse.ok) {
          throw new Error("Failed to fetch language");
        }
        const languageData = await languageResponse.json();
        setTargetLanguage(languageData);



      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [articleId, languageId]);



  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!article || !targetLanguage) return;

    // Validate required fields before sending
    if (!formData.title || !formData.title.trim()) {
      alert('Translation title is required');
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      alert('Translation content is required');
      return;
    }

    setSaving(true);
    try {
      // Prepare payload with normalized optional fields
      const payload = {
        articleId: article.id,
        languageId: targetLanguage.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        status,
        // Only include optional fields if they have non-empty values
        ...(formData.excerpt?.trim() && { excerpt: formData.excerpt.trim() }),
        ...(formData.metaTitle?.trim() && { metaTitle: formData.metaTitle.trim() }),
        ...(formData.metaDescription?.trim() && { metaDescription: formData.metaDescription.trim() }),
        ...(formData.keywords?.trim() && { keywords: formData.keywords.trim() }),
        // Publishing fields
        author: formData.author || "Galatide Authors",
        publishedAt: formData.status === "PUBLISHED" && formData.publishedAt 
          ? new Date(formData.publishedAt).toISOString() 
          : (formData.status === "PUBLISHED" ? new Date().toISOString() : undefined),
        scheduledAt: formData.scheduledPublishAt 
          ? new Date(formData.scheduledPublishAt).toISOString() 
          : undefined,
        estimatedReadingMinutes: parseInt(formData.estimatedReadingMinutes) || 5,
      };

      console.log('Sending translation payload:', payload);

      const response = await apiRequest("/api/translations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        
        // Show detailed error message if available
        const errorMessage = errorData.message || errorData.error || "Failed to save translation";
        const details = errorData.fieldErrors 
          ? '\n\nDetails: ' + errorData.fieldErrors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
          : '';
        
        throw new Error(errorMessage + details);
      }

      const translation = await response.json();
      console.log('Translation saved successfully:', translation);
      router.push(`/admin/translations?articleId=${article.id}`);
    } catch (err) {
      console.error("Error saving translation:", err);
      alert(err instanceof Error ? err.message : "Failed to save translation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading translation editor...</p>
        </div>
      </div>
    );
  }

  if (error || !article || !targetLanguage) {
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
            <div className="text-destructive mb-4">{error || "Failed to load translation data"}</div>
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
          <Link href={`/admin/translations?articleId=${article.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Translations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold">Create Translation</h1>
            <p className="text-muted-foreground mt-2">
              Translating "{article.title}" to {targetLanguage?.nativeName || targetLanguage?.name || targetLanguage?.code || 'Target Language'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            onClick={() => handleSave("DRAFT")} 
            variant="outline"
            disabled={saving}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            <Globe className="h-4 w-4 mr-2" />
            Publish Translation
          </Button>
        </div>
      </div>

      {/* Language Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <Badge variant="outline" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-xs sm:text-sm">From: {article.originalLanguage?.nativeName || article.originalLanguage?.name || 'Original'} ({article.originalLanguage?.code?.toUpperCase() || 'N/A'})</span>
        </Badge>
        <Badge variant="default" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-xs sm:text-sm">To: {targetLanguage?.nativeName || targetLanguage?.name || 'Target'} ({targetLanguage?.code?.toUpperCase() || 'N/A'})</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Content */}
        <div className="space-y-6">
          <ScrollReveal>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Original ({article.originalLanguage?.code?.toUpperCase() || 'EN'})
                </CardTitle>
                <CardDescription>Reference content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={article.title} readOnly className="bg-muted/50" />
                </div>
                
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea value={article.excerpt} readOnly className="bg-muted/50" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md bg-muted/50">
                    {(!article.tags || article.tags.length === 0) ? (
                      <span className="text-muted-foreground text-sm">No tags</span>
                    ) : (
                      article.tags.map((tagItem: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {tagItem?.tag?.name || 'Unknown'}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <div className="p-3 bg-muted rounded-md mt-1 max-h-[400px] overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Translation Form */}
        <div className="space-y-6">
          {/* Basic Information */}
          <ScrollReveal delay={200}>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Translate the basic article information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    placeholder={`Translate: "${article.title}"`}
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({...prev, excerpt: e.target.value}))}
                    placeholder="Translate the excerpt..."
                    rows={3}
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={300}>
            <Card>
              <CardHeader>
                <CardTitle>Content *</CardTitle>
                <CardDescription>Translate the article content</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({...prev, content}))}
                  placeholder="Translate the content..."
                />
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Inherited Tags */}
          <ScrollReveal delay={400}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5" />
                  Inherited Tags
                </CardTitle>
                <CardDescription>Tags from the original article (cannot be modified in translations)</CardDescription>
              </CardHeader>
              <CardContent>
                {(!article.tags || article.tags.length === 0) ? (
                  <div className="text-sm text-muted-foreground">No tags assigned to this article</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tagItem: any, idx: number) => {
                      const tag = tagItem.tag || tagItem;
                      const originalName = tag.name || 'Unknown';

                      return (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {originalName}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                <div className="mt-3 text-xs text-muted-foreground">
                  Tags are inherited from the original article and will be automatically translated when displayed to users. 
                  To modify tags, edit the original article in the <Link href="/admin/articles" className="text-primary underline">Articles section</Link>.
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* SEO Translation */}
          <ScrollReveal delay={500}>
            <Card>
              <CardHeader>
                <CardTitle>SEO Translation (Optional)</CardTitle>
                <CardDescription>Translate SEO information for better search visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({...prev, metaTitle: e.target.value}))}
                    placeholder="Translated meta title"
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({...prev, metaDescription: e.target.value}))}
                    placeholder="Translated meta description"
                    rows={2}
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({...prev, keywords: e.target.value}))}
                    placeholder="Translated keywords (comma-separated)"
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Publishing Status */}
          <ScrollReveal delay={600}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Publishing
                </CardTitle>
                <CardDescription>Control translation visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Author Field */}
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({...prev, author: e.target.value}))}
                    placeholder="Author name"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.status === "DRAFT" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({...prev, status: "DRAFT"}))}
                    >
                      Draft
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === "PUBLISHED" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({...prev, status: "PUBLISHED"}))}
                    >
                      Published
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formData.status === "DRAFT"
                      ? "Translation will be saved as draft and not visible to visitors."
                      : "Translation will be published and visible to visitors."}
                  </div>
                </div>

                {/* Publication Date - Show only when Published */}
                {formData.status === "PUBLISHED" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Publication Date</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({...prev, publishedAt: e.target.value}))}
                    />
                    <div className="text-xs text-muted-foreground">
                      Leave empty to publish now • Current: {new Date().toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Schedule for Later */}
                <div className="space-y-2">
                  <Label htmlFor="scheduledPublishAt">Publish Later (Optional)</Label>
                  <Input
                    id="scheduledPublishAt"
                    type="datetime-local"
                    value={formData.scheduledPublishAt}
                    onChange={(e) => setFormData(prev => ({...prev, scheduledPublishAt: e.target.value}))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Translation will automatically publish at this date/time
                  </div>
                </div>

                {/* Estimated Reading Time */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedReadTime">Estimated Read Time (minutes)</Label>
                  <Input
                    id="estimatedReadTime"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.estimatedReadingMinutes}
                    onChange={(e) => setFormData(prev => ({...prev, estimatedReadingMinutes: e.target.value}))}
                    placeholder="e.g., 5"
                  />
                  <div className="text-xs text-muted-foreground">
                    Auto-calculated: {Math.max(
                      1,
                      Math.ceil(
                        (formData.content
                          .replace(/<[^>]+>/g, " ")
                          .replace(/&[^;]+;/g, " ")
                          .trim() || "")
                        .split(/\s+/).filter(Boolean).length / 200
                      )
                    )} min based on content
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

export default function NewTranslationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewTranslationPageContent />
    </Suspense>
  );
}
