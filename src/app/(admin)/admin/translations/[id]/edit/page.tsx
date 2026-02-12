"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ArrowLeft, Save, Globe, Eye, Languages, Tag as TagIcon } from "lucide-react";
import Link from "next/link";

export default function TranslationEditPage() {
  const router = useRouter();
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<any>(null);



  const [original, setOriginal] = useState({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    languageCode: "en",
    tags: [] as string[],
    tagData: [] as Array<{ id: string; name: string }>, // Store tag IDs and names
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    estimatedReadingMinutes: 5,
  });

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    languageCode: "ar",
    status: "draft" as "draft" | "published",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    // Publishing fields
    author: "Galatide Authors",
    publishedAt: "",
    scheduledPublishAt: "",
    estimatedReadingMinutes: "5",
  });



  // Fetch translation data, original article, and tags
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch translation data
        const translationResponse = await fetch(`/api/translations/${params.id}`);
        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          const translation = translationData.translation;
          
          // Set form data from existing translation
          setForm({
            title: translation.title || "",
            excerpt: translation.excerpt || "",
            content: translation.content || "",
            languageCode: translation.language?.code || "ar",
            status: translation.status?.toLowerCase() || "draft",
            metaTitle: translation.metaTitle || "",
            metaDescription: translation.metaDescription || "",
            keywords: translation.keywords || "",
            // Publishing fields
            author: translation.author || "Galatide Authors",
            publishedAt: translation.publishedAt || "",
            scheduledPublishAt: translation.scheduledPublishAt || "",
            estimatedReadingMinutes: translation.estimatedReadingMinutes?.toString() || "5",
          });
          
          // Set original article data
          const originalArticle = translation.article;
          setOriginal({
            id: originalArticle.id,
            title: originalArticle.title || "",
            slug: originalArticle.slug || "",
            excerpt: originalArticle.excerpt || "",
            content: originalArticle.content || "",
            coverUrl: originalArticle.coverUrl || "",
            languageCode: originalArticle.originalLanguage?.code || "en",
            tags: originalArticle.tags?.map((tag: any) => tag?.tag?.name || tag?.name).filter(Boolean) || [],
            tagData: originalArticle.tags?.map((tag: any) => ({
              id: tag?.tag?.id || tag?.id || '',
              name: tag?.tag?.name || tag?.name || ''
            })).filter((t: any) => t.id) || [],
            metaTitle: originalArticle.metaTitle || "",
            metaDescription: originalArticle.metaDescription || "",
            keywords: originalArticle.keywords || "",
            estimatedReadingMinutes: originalArticle.estimatedReadingMinutes || 5,
          });

          setTargetLanguage(translation.language);


        }
      } catch (error) {
        console.error('Error loading translation data:', error);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id]);



  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!original.id) {
      alert('No article ID provided');
      return;
    }

    // Validate required fields
    if (!form.title || !form.title.trim()) {
      alert('Translation title is required');
      return;
    }

    if (!form.content || !form.content.trim()) {
      alert('Translation content is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        status: status.toUpperCase(),
        // Only include optional fields if they have non-empty values
        ...(form.excerpt?.trim() && { excerpt: form.excerpt.trim() }),
        ...(form.metaTitle?.trim() && { metaTitle: form.metaTitle.trim() }),
        ...(form.metaDescription?.trim() && { metaDescription: form.metaDescription.trim() }),
        ...(form.keywords?.trim() && { keywords: form.keywords.trim() }),
        // Publishing fields
        author: form.author || "Galatide Authors",
        publishedAt: form.status === "published" && form.publishedAt 
          ? new Date(form.publishedAt).toISOString() 
          : (form.status === "published" ? new Date().toISOString() : undefined),
        scheduledAt: form.scheduledPublishAt 
          ? new Date(form.scheduledPublishAt).toISOString() 
          : undefined,
        estimatedReadingMinutes: parseInt(form.estimatedReadingMinutes) || 5,
      };

      console.log('Updating translation:', payload);

      const res = await fetch(`/api/translations/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-role": "admin" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || "Failed to save translation");
      }

      const result = await res.json();
      console.log('Translation updated successfully:', result);
      router.push(`/admin/translations?articleId=${original.id}`);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to save translation");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/translations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Translations
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-glow-primary">Edit Translation</h1>
            <p className="text-muted-foreground mt-2">
              Translating to {targetLanguage ? (targetLanguage?.nativeName || targetLanguage?.name || targetLanguage?.code?.toUpperCase() || form.languageCode.toUpperCase()) : form.languageCode.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleSave("draft")} disabled={isSaving} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={isSaving}
          >
            <Globe className="h-4 w-4 mr-2" />
            {isSaving ? "Publishing..." : "Publish Translation"}
          </Button>
        </div>
      </div>

      {/* Language Info */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          From: {original.languageCode?.toUpperCase() || 'EN'}
        </Badge>
        <Badge variant="default" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          To: {targetLanguage?.nativeName || targetLanguage?.name || form.languageCode.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Article - Left Column */}
        <div className="space-y-6">
          <ScrollReveal delay={100}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Original ({original.languageCode?.toUpperCase() || 'Original'})
                </CardTitle>
                <CardDescription>Reference content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={original.title} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea value={original.excerpt} readOnly className="bg-muted/50" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md bg-muted/50">
                    {original.tags.length === 0 ? (
                      <span className="text-muted-foreground text-sm">No tags</span>
                    ) : (
                      original.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <div className="p-3 bg-muted rounded-md mt-1 max-h-[400px] overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: original.content }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Translation Form - Right Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <ScrollReveal delay={200}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Translate the basic article information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder={`Translate: "${original.title}"`}
                    className="text-lg"
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={form.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Translate the excerpt..."
                    rows={3}
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={500}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Content *</CardTitle>
                <CardDescription>Translate the article content</CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                  placeholder="Translate the content..."
                />
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Inherited Tags */}
          <ScrollReveal delay={400}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5" />
                  Inherited Tags
                </CardTitle>
                <CardDescription>Tags from the original article (cannot be modified in translations)</CardDescription>
              </CardHeader>
              <CardContent>
                {(!original.tags || original.tags.length === 0) ? (
                  <div className="text-sm text-muted-foreground">No tags assigned to this article</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {original.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-xs text-muted-foreground">
                  Tags are inherited from the original article and will be automatically translated when displayed to users. 
                  To modify tags, edit the original article in the <Link href="/admin/articles" className="text-primary underline">Articles section</Link>.
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Publishing Status */}
          <ScrollReveal delay={700}>
            <Card className="glass-card">
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
                    value={form.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="Author name"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={form.status === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm(prev => ({ ...prev, status: "draft" }))}
                      className="flex-1"
                    >
                      Draft
                    </Button>
                    <Button
                      type="button"
                      variant={form.status === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm(prev => ({ ...prev, status: "published" }))}
                      className="flex-1"
                    >
                      Published
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {form.status === "draft"
                      ? "Translation will be saved as draft and not visible to visitors."
                      : "Translation will be published and visible to visitors."}
                  </div>
                </div>

                {/* Publication Date - Show only when Published */}
                {form.status === "published" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Publication Date</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(e) => handleInputChange("publishedAt", e.target.value)}
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
                    value={form.scheduledPublishAt}
                    onChange={(e) => handleInputChange("scheduledPublishAt", e.target.value)}
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
                    value={form.estimatedReadingMinutes}
                    onChange={(e) => handleInputChange("estimatedReadingMinutes", e.target.value)}
                    placeholder="e.g., 5"
                  />
                  <div className="text-xs text-muted-foreground">
                    Auto-calculated: {Math.max(
                      1,
                      Math.ceil(
                        (form.content
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

          {/* SEO Translation */}
          <ScrollReveal delay={600}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>SEO Translation (Optional)</CardTitle>
                <CardDescription>Translate SEO information for better search visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={form.metaTitle}
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                    placeholder="Translated meta title"
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={form.metaDescription}
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                    placeholder="Translated meta description"
                    rows={2}
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={form.keywords}
                    onChange={(e) => handleInputChange("keywords", e.target.value)}
                    placeholder="Translated keywords (comma-separated)"
                    dir={targetLanguage?.isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}


