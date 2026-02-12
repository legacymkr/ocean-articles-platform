"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Image as ImageIcon, File, Video, Music } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import Link from "next/link";

export default function MediaUploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    try {
      // This is a placeholder - in a real app you'd upload to your storage service
      const uploadPromises = files.map(async (file) => {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a fake URL for demo purposes
        const fakeUrl = URL.createObjectURL(file);
        
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: fakeUrl,
          uploadedAt: new Date().toISOString()
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...results]);
      
      // In a real app, you'd save these to your database here
      console.log("Files uploaded:", results);
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/media">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-glow-primary">Upload Media</h1>
            <p className="text-muted-foreground mt-2">Upload images, videos, and other media files</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <ScrollReveal delay={100}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
              <CardDescription>
                Drag and drop files here or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-lg font-medium mb-2">
                  {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-muted-foreground mb-4">
                  Supports images, videos, documents, and more
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
                <Button 
                  asChild 
                  disabled={uploading}
                  className="ripple-effect"
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? 'Uploading...' : 'Browse Files'}
                  </label>
                </Button>
              </div>

              {uploading && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Uploading files...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Uploaded Files */}
        <ScrollReveal delay={200}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>
                Files uploaded in this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(file.url);
                          alert('URL copied to clipboard!');
                        }}
                      >
                        Copy URL
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      {/* Upload Tips */}
      <ScrollReveal delay={300}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Recommended: JPG, PNG, WebP</li>
                  <li>• Max size: 10MB</li>
                  <li>• Optimal: 1920x1080 or higher</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Supported: MP4, WebM</li>
                  <li>• Max size: 100MB</li>
                  <li>• Recommended: H.264 codec</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
