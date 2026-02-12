"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useArticles } from "@/contexts/articles-context";
import { apiRequest } from "@/lib/api-client";
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  Tag,
  Globe,
  Search,
  Type,
  Image as ImageIcon,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { MediaPicker } from "@/components/media-picker";
import { MediaType } from "@prisma/client";

export default function NewArticlePage() {
  const router = useRouter();
  const { addArticle } = useArticles();
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    author: "Galatide Authors", // Default author
    status: "draft",
    publishedAt: "",
    scheduledPublishAt: "",
    estimatedReadingMinutes: "5", // Default 5 minutes
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  const [newTag, setNewTag] = useState("");

  // Fetch available tags function
  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Fetch available tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    // Auto-generate slug from title and update both fields in single state update
    if (field === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, [field]: value, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setNewTag("");

      // Check if this tag already exists in available tags
      const existingTag = availableTags.find(tag => tag.name === trimmedTag);
      if (!existingTag) {
        // This is a new tag that will be created
        console.log(`New tag "${trimmedTag}" will be created when article is saved`);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      // Basic validation for published articles
      if (status === "published" && !formData.title?.trim()) {
        alert("Title is required for published articles");
        setIsSaving(false);
        return;
      }

      // Auto-generate slug if empty
      const slug = formData.slug || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'untitled-article');

      const response = await apiRequest("/api/articles", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          slug,
          status,
          tags: formData.tags,
          coverUrl: formData.coverUrl || undefined, // Convert empty string to undefined
          publishedAt:
            (status === "published" && formData.publishedAt)
              ? new Date(formData.publishedAt).toISOString()
              : (status === "published" ? new Date().toISOString() : undefined),
          scheduledAt: formData.scheduledPublishAt
            ? new Date(formData.scheduledPublishAt).toISOString()
            : undefined,
          estimatedReadingMinutes: parseInt(formData.estimatedReadingMinutes) || 5,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If response is not JSON, get the text
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText}`);
        }

        console.error("Validation errors:", errorData);
        console.error("Request data sent:", {
          ...formData,
          slug,
          status,
          tags: formData.tags,
          coverUrl: formData.coverUrl || undefined,
        });

        if (errorData.details) {
          const errorMessages = errorData.details
            .map(
              (detail: { path: string[]; message: string }) =>
                `${detail.path.join(".")}: ${detail.message}`,
            )
            .join(", ");
          throw new Error(`Validation failed: ${errorMessages}`);
        }

        throw new Error(errorData.error || "Failed to save article");
      }

      const article = await response.json();
      console.log("Article saved:", article);

      // Send newsletter notification if article is published
      if (status === "published" && article.id) {
        try {
          const newsletterResponse = await fetch('/api/newsletter/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: article.id,
              articleTitle: article.title,
              articleSlug: article.slug,
              articleExcerpt: article.excerpt,
              language: 'en',
            }),
          });

          if (newsletterResponse.ok) {
            const newsletterResult = await newsletterResponse.json();
            console.log('Newsletter notification sent:', newsletterResult);
          } else {
            console.warn('Newsletter notification failed:', await newsletterResponse.text());
          }
        } catch (emailError) {
          console.error('Failed to send newsletter:', emailError);
          // Don't fail the whole operation if email fails
        }
      }

      // Add article to context
      addArticle(article);

      // Redirect to articles list
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);

      let errorMessage = "Failed to save article. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Database connection not available")) {
          errorMessage = "Database connection error. Please check your database configuration and try again.";
        } else if (error.message.includes("Validation failed")) {
          errorMessage = `Validation error: ${error.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

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
            <h1 className="text-3xl font-heading font-bold text-glow-primary">New Article</h1>
            <p className="text-muted-foreground mt-2">Create a new ocean exploration article</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)} className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={() => handleSave("draft")} disabled={isSaving} variant="outline" className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="ripple-effect w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Slug */}
          <ScrollReveal delay={200}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set the title and URL slug for your article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter article title..."
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/articles/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="article-url-slug"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    placeholder="Brief description of the article..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Cover Image */}
          <ScrollReveal delay={300}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Cover Image
                </CardTitle>
                <CardDescription>Add a featured image for your article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cover Image Preview */}
                {formData.coverUrl ? (
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                      <img
                        src={formData.coverUrl}
                        alt={formData.metaTitle || formData.title || "Cover image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Cover image failed to load:', formData.coverUrl);
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg'; // Fallback image
                        }}
                      />

                      {/* Action overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <MediaPicker
                          onSelect={(item) => {
                            setFormData(prev => ({ ...prev, coverUrl: item.url }));
                          }}
                          triggerText="Change"
                          allowedTypes={[MediaType.IMAGE]}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, coverUrl: '' }))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Cover Image Details */}
                    <div className="text-sm text-muted-foreground">
                      <p className="truncate">URL: {formData.coverUrl}</p>
                    </div>
                  </div>
                ) : (
                  /* No Cover Image State */
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground mb-4">No cover image selected</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <MediaPicker
                            onSelect={(item) => {
                              setFormData(prev => ({ ...prev, coverUrl: item.url }));
                            }}
                            triggerText="Select Cover Image"
                            allowedTypes={[MediaType.IMAGE]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Manual URL Input */}
                    <div className="space-y-2">
                      <Label htmlFor="coverUrl">Or enter image URL manually</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coverUrl"
                          value={formData.coverUrl}
                          onChange={(e) => handleInputChange("coverUrl", e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (formData.coverUrl.trim()) {
                              // Validate URL format
                              try {
                                new URL(formData.coverUrl);
                              } catch {
                                alert('Please enter a valid URL');
                                return;
                              }
                            }
                          }}
                          disabled={!formData.coverUrl.trim()}
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Content Editor */}
          <ScrollReveal delay={400}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Content
                </CardTitle>
                <CardDescription>Write your article using the rich text editor</CardDescription>
              </CardHeader>
              <CardContent>
                {isPreview ? (
                  <div
                    className="prose prose-invert max-w-none min-h-[400px] p-4 bg-muted/30 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                ) : (
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Start writing your ocean exploration article..."
                  />
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <ScrollReveal delay={500}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
                <CardDescription>Add tags to categorize your article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tags */}
                <div className="space-y-2">
                  <Label>Selected Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md">
                    {formData.tags.length === 0 ? (
                      <span className="text-muted-foreground text-sm">No tags selected</span>
                    ) : (
                      formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Tags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Available Tags</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={fetchTags}
                      disabled={loadingTags}
                      className="h-6 px-2 text-xs"
                    >
                      {loadingTags ? "Loading..." : "Refresh"}
                    </Button>
                  </div>
                  {loadingTags ? (
                    <div className="text-sm text-muted-foreground">Loading tags...</div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                      {availableTags.length === 0 ? (
                        <span className="text-muted-foreground text-sm">
                          No tags available. Create tags in the <a href="/admin/tags" className="text-primary underline">Tags page</a>.
                        </span>
                      ) : (
                        availableTags
                          .filter(tag => !formData.tags.includes(tag.name))
                          .map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: [...prev.tags, tag.name]
                                }));
                              }}
                            >
                              + {tag.name}
                            </Badge>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {/* Manual Tag Input */}
                <div className="space-y-2">
                  <Label>Create New Tag</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter new tag name..."
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddTag}
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                    >
                      Add Tag
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    New tags will be created automatically when you save the article.
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* SEO Settings */}
          <ScrollReveal delay={600}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO Settings
                </CardTitle>
                <CardDescription>Optimize for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title (60 chars max)"
                    maxLength={60}
                  />
                  <div className="text-xs text-muted-foreground">
                    {formData.metaTitle.length}/60 characters
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="SEO description (160 chars max)"
                    rows={3}
                    maxLength={160}
                  />
                  <div className="text-xs text-muted-foreground">
                    {formData.metaDescription.length}/160 characters
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="ocean, deep sea, exploration"
                  />
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
                <CardDescription>Control article visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Author Field */}
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    placeholder="Author name"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.status === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, status: "draft" }))}
                    >
                      Draft
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, status: "published" }))}
                    >
                      Published
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formData.status === "draft"
                      ? "Article will be saved as draft and not visible to visitors."
                      : "Article will be published and visible to visitors."}
                  </div>
                </div>

                {/* Publication Date - Show only when Published */}
                {formData.status === "published" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Publication Date</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
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
                    value={formData.scheduledPublishAt}
                    onChange={(e) => handleInputChange("scheduledPublishAt", e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Article will automatically publish at this date/time
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
                    onChange={(e) => handleInputChange("estimatedReadingMinutes", e.target.value)}
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
