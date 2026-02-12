"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { RefreshCw, Download, Globe, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SitemapStatus {
  language: string;
  languageName: string;
  status: 'idle' | 'generating' | 'success' | 'error';
  lastGenerated?: string;
  urlCount?: number;
  error?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' }
];

export default function SitemapGeneratorPage() {
  const [sitemapStatuses, setSitemapStatuses] = useState<SitemapStatus[]>(
    SUPPORTED_LANGUAGES.map(lang => ({
      language: lang.code,
      languageName: lang.name,
      status: 'idle'
    }))
  );
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const updateSitemapStatus = (language: string, updates: Partial<SitemapStatus>) => {
    setSitemapStatuses(prev => 
      prev.map(status => 
        status.language === language 
          ? { ...status, ...updates }
          : status
      )
    );
  };

  const generateSitemap = async (language: string) => {
    updateSitemapStatus(language, { status: 'generating' });

    try {
      const response = await fetch(`/api/admin/sitemap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate sitemap: ${response.statusText}`);
      }

      const result = await response.json();
      
      updateSitemapStatus(language, {
        status: 'success',
        lastGenerated: result.lastGenerated || new Date().toISOString(),
        urlCount: result.urlCount || 0
      });

      toast.success(`Sitemap generated for ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateSitemapStatus(language, {
        status: 'error',
        error: errorMessage
      });
      toast.error(`Failed to generate sitemap for ${language}: ${errorMessage}`);
    }
  };

  const generateAllSitemaps = async () => {
    setIsGeneratingAll(true);
    
    try {
      // Generate main sitemap index
      const indexResponse = await fetch('/api/admin/sitemap/generate-index', {
        method: 'POST',
      });

      if (!indexResponse.ok) {
        throw new Error('Failed to generate sitemap index');
      }

      // Generate all language sitemaps
      for (const lang of SUPPORTED_LANGUAGES) {
        await generateSitemap(lang.code);
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('All sitemaps generated successfully!');
    } catch (error) {
      toast.error('Failed to generate all sitemaps');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const getStatusIcon = (status: SitemapStatus['status']) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SitemapStatus['status']) => {
    switch (status) {
      case 'generating':
        return <Badge variant="secondary">Generating...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Generated</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Not Generated</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sitemap Generator</h1>
          <p className="text-muted-foreground">
            Generate XML sitemaps for all supported languages
          </p>
        </div>
        <Button 
          onClick={generateAllSitemaps}
          disabled={isGeneratingAll}
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          {isGeneratingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Generate All Sitemaps
        </Button>
      </div>

      <div className="h-[1px] w-full bg-border" />

      {/* Main Sitemap Index */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Main Sitemap Index
          </CardTitle>
          <CardDescription>
            The main sitemap.xml file that links to all language-specific sitemaps (dynamically generated)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">sitemap.xml</p>
              <p className="text-sm text-muted-foreground">
                Available at: <code>/sitemap.xml</code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/sitemap.xml', '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language-Specific Sitemaps */}
      <Card>
        <CardHeader>
          <CardTitle>Language-Specific Sitemaps</CardTitle>
          <CardDescription>
            Generate sitemaps for each supported language containing articles and pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sitemapStatuses.map((sitemap) => (
              <div
                key={sitemap.language}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(sitemap.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{sitemap.languageName}</p>
                      <Badge variant="outline">{sitemap.language}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      sitemap-{sitemap.language}.xml
                      {sitemap.urlCount && ` • ${sitemap.urlCount} URLs`}
                    </p>
                    {sitemap.lastGenerated && (
                      <p className="text-xs text-muted-foreground">
                        Last generated: {new Date(sitemap.lastGenerated).toLocaleString()}
                      </p>
                    )}
                    {sitemap.error && (
                      <p className="text-xs text-red-500">
                        Error: {sitemap.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(sitemap.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSitemap(sitemap.language)}
                    disabled={sitemap.status === 'generating'}
                  >
                    {sitemap.status === 'generating' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Generate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/sitemap-${sitemap.language}.xml`, '_blank')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <p className="text-sm">
              <strong>Main Sitemap:</strong> Contains links to all language-specific sitemaps
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <p className="text-sm">
              <strong>Language Sitemaps:</strong> Include published articles, homepage, and newsletter page for each language
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <p className="text-sm">
              <strong>SEO Optimized:</strong> Includes proper lastmod, changefreq, and priority values
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <p className="text-sm">
              <strong>Search Engine Ready:</strong> Submit the main sitemap.xml to Google Search Console
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
