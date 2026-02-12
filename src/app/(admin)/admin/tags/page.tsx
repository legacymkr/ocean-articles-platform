"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Languages } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Tag {
  id: string;
  name: string;
  color?: string;
  translations: TagTranslation[];
}

interface TagTranslation {
  id: string;
  name: string;
  languageCode: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [translationForm, setTranslationForm] = useState<{ [key: string]: string }>({});

  // Create tag state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", color: "#6366f1" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchLanguages();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch("/api/admin/languages");
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const handleTranslationSubmit = async () => {
    if (!selectedTag) return;

    try {
      const translations = Object.entries(translationForm).map(([languageCode, name]) => ({
        languageCode,
        name: name.trim(),
      })).filter(t => t.name);

      const response = await fetch(`/api/admin/tags/${selectedTag.id}/translations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translations }),
      });

      if (response.ok) {
        setShowTranslationDialog(false);
        setSelectedTag(null);
        setTranslationForm({});
        fetchTags();
      }
    } catch (error) {
      console.error("Error saving translations:", error);
    }
  };

  const handleCreateTag = async () => {
    if (!createForm.name.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim(),
          color: createForm.color,
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setCreateForm({ name: "", color: "#6366f1" });
        fetchTags();
      } else {
        const errorData = await response.json();
        alert(errorData.message || errorData.error || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const openTranslationDialog = (tag: Tag) => {
    setSelectedTag(tag);

    // Pre-fill existing translations
    const form: { [key: string]: string } = {};
    tag.translations?.forEach(t => {
      form[t.languageCode] = t.name;
    });
    setTranslationForm(form);
    setShowTranslationDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-glow-primary">Tag Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage tags and their translations for multilingual content
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      </div>

      <div className="grid gap-6">
        {tags.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                No tags created yet. Create your first tag to get started.
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Tag
              </Button>
            </CardContent>
          </Card>
        ) : (
          tags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tag.translations?.length || 0} translations
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTranslationDialog(tag)}
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    Manage Translations
                  </Button>
                </div>
              </CardHeader>
              {tag.translations && tag.translations.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tag.translations.map((translation) => (
                      <Badge key={translation.id} variant="secondary">
                        {translation.languageCode}: {translation.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag with a name and color
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name *</Label>
              <Input
                id="tag-name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter tag name"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tag-color"
                  type="color"
                  value={createForm.color}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={createForm.color}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#6366f1"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <Badge variant="outline" style={{ backgroundColor: createForm.color }}>
                {createForm.name || "Tag Name"}
              </Badge>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={creating || !createForm.name.trim()}
            >
              {creating ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Translation Dialog */}
      <Dialog open={showTranslationDialog} onOpenChange={setShowTranslationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Tag Translations</DialogTitle>
            <DialogDescription>
              Add translations for "{selectedTag?.name}" in different languages
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {languages.map((language) => (
              <div key={language.code} className="space-y-2">
                <Label htmlFor={`translation-${language.code}`}>
                  {language.nativeName} ({language.code})
                </Label>
                <Input
                  id={`translation-${language.code}`}
                  value={translationForm[language.code] || ""}
                  onChange={(e) => setTranslationForm(prev => ({
                    ...prev,
                    [language.code]: e.target.value
                  }))}
                  placeholder={`Tag name in ${language.nativeName}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTranslationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTranslationSubmit}>
              Save Translations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}