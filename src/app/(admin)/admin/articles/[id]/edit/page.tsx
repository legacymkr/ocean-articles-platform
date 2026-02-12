"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArticles } from "@/contexts/articles-context";
import { ArrowLeft, Save, Trash2, Eye, Plus, X, Upload, Tag, Globe, Search, Type, Image as ImageIcon, FileText } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";
import { MediaPicker } from "@/components/media-picker";
import { MediaType } from "@prisma/client";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RichTextEditor } from "@/components/rich-text-editor";


export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { updateArticle } = useArticles();
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverUrl: "",
    status: "draft",
    publishedAt: "",
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    loadTags();
  }, []);

  // Load article data
  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        const article = data.article;
        
        setFormData({
          title: article.title || "",
          slug: article.slug || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          coverUrl: article.coverUrl || "",
          status: article.status || "draft",
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString().slice(0,16) : "",
          tags: article.tags?.map((tagRelation: any) => tagRelation?.tag?.name).filter(Boolean) || [],
          metaTitle: article.metaTitle || "",
          metaDescription: article.metaDescription || "",
          keywords: article.keywords || "",
        });
      } catch (error) {
        console.error("Error loading article:", error);
        alert("Failed to load article");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadArticle();
    }
  }, [params.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddExistingTag = (tagName: string) => {
    if (!formData.tags.includes(tagName)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagName],
      }));
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      // Auto-generate slug if empty
      const slug = formData.slug || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'untitled-article');
      
      const response = await apiRequest(`/api/articles/${params.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          slug,
          status,
          tags: formData.tags,
          coverUrl: formData.coverUrl || undefined, // Convert empty string to undefined
        publishedAt:
          (status === "published" && formData.publishedAt)
            ? new Date(formData.publishedAt).toISOString()
            : undefined,
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

      // Update article in context
      updateArticle(params.id as string, article);

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

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      try {
        const response = await apiRequest(`/api/articles/${params.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete article");
        }

        console.log("Article deleted successfully");

        // Redirect to articles list
        router.push("/admin/articles");
      } catch (error) {
        console.error("Error deleting article:", error);
        alert("Failed to delete article. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
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
            <h1 className="text-3xl font-heading font-bold text-glow-primary">Edit Article</h1>
            <p className="text-muted-foreground mt-2">Update your ocean exploration article</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={() => handleSave("draft")} disabled={isSaving} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="ripple-effect"
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
                <div className="space-y-2">
                  <Label htmlFor="coverUrl">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coverUrl"
                      value={formData.coverUrl}
                      onChange={(e) => handleInputChange("coverUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <MediaPicker
                      onSelect={(item) => {
                        setFormData((prev) => ({ ...prev, coverUrl: item.url }));
                      }}
                      triggerText="Pick"
                    />
                  </div>
                </div>
                {formData.coverUrl && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={formData.coverUrl}
                      alt={formData.metaTitle || formData.title || "Cover image"}
                      className="w-full h-full object-cover"
                    />
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
                    onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
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
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selected Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                    {formData.tags.length > 0 ? (
                      formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <span>{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive text-sm"
                            title="Remove tag"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No tags selected</span>
                    )}
                  </div>
                </div>

                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Available Tags</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                      {availableTags
                        .filter(tag => !formData.tags.includes(tag.name))
                        .map((tag) => (
                          <Badge 
                            key={tag.id} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleAddExistingTag(tag.name)}
                            style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Add Custom Tag */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Add Custom Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter new tag name..."
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
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
                    onChange={(e) => handleInputChange("metaTitle", e.target.value)}
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
                    onChange={(e) => handleInputChange("metaDescription", e.target.value)}
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
                    onChange={(e) => handleInputChange("keywords", e.target.value)}
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
                <div className="text-sm text-muted-foreground">
                  Author: Galatide Admin (current)
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={formData.status === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, status: "draft" }))}
                    >
                      Draft
                    </Button>
                    <Button
                      variant={formData.status === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, status: "published" }))}
                    >
                      Published
                    </Button>
                  </div>
                </div>
                {formData.status === "published" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt">Publication Date</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => handleInputChange("publishedAt", e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground">Leave empty to publish now</div>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Estimated read time: {
                    Math.max(
                      1,
                      Math.ceil(
                        (formData.content
                          .replace(/<[^>]+>/g, " ")
                          .replace(/&[^;]+;/g, " ")
                          .trim() || ""
                        ).split(/\s+/).filter(Boolean).length / 200,
                      ),
                    )
                  } min
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.status === "draft"
                    ? "Article will be saved as draft and not visible to visitors."
                    : "Article will be published and visible to visitors."}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
