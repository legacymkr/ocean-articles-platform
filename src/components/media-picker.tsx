"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Image as ImageIcon,
  Search,
  Link,
  Upload,
  Filter,
  Calendar,
  FileText,
  Video,
  Music,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { MediaType } from "@prisma/client";
import { toast } from "sonner";
import { ImageOptimizationService } from "@/lib/services/image-optimization";

interface MediaItem {
  id: string;
  url: string;
  altText: string;
  seoTitle?: string;
  type: MediaType;
  width?: number;
  height?: number;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface MediaFilters {
  search: string;
  type: MediaType | 'all';
  sortBy: 'createdAt' | 'altText' | 'type';
  sortOrder: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

interface MediaPickerProps {
  onSelect: (item: MediaItem) => void;
  triggerText?: string;
  allowedTypes?: MediaType[];
  maxSelection?: number;
  showUpload?: boolean;
  embedded?: boolean; // When true, renders without Dialog wrapper
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open change
}

export function MediaPicker({
  onSelect,
  triggerText = "Choose Media",
  allowedTypes,
  maxSelection = 1,
  showUpload = true,
  embedded = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: MediaPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});
  const [retryAttempts, setRetryAttempts] = useState<{ [key: string]: number }>({});
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [optimizationFiles, setOptimizationFiles] = useState<File[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<any[]>([]);
  const [cancelledUploads, setCancelledUploads] = useState<Set<string>>(new Set());

  // Advanced filtering state
  const [filters, setFilters] = useState<MediaFilters>({
    search: '',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { startUpload } = useUploadThing("mediaUploader", {
    onClientUploadComplete: async (res) => {
      console.log("Files uploaded:", res);
      if (res && res[0]) {
        const uploadedFile = res[0];

        // Get current user for saving media asset
        try {
          const userResponse = await fetch('/api/admin/current-user');
          const userData = await userResponse.json();
          const currentUser = userData.user;

          // Update the media asset with alt text and SEO title if provided
          if (uploadedFile.serverData?.mediaAsset?.id && (altText || seoTitle)) {
            try {
              await fetch(`/api/media/${uploadedFile.serverData.mediaAsset.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  altText: altText || undefined,
                  seoTitle: seoTitle || undefined
                })
              });
            } catch (updateError) {
              console.error('Error updating media metadata:', updateError);
            }
          }

          // Media asset should already be saved by UploadThing onUploadComplete
          // Just refresh the media list to show the new upload
          await fetchMedia();

          // If single selection and auto-select is desired
          if (maxSelection === 1) {
            // Find the newly uploaded item and select it
            const updatedItems = await fetchMediaAndReturn();
            const newItem = updatedItems.find(item => item.url === uploadedFile.url);
            if (newItem) {
              onSelect(newItem);
              setOpen(false);
            }
          }

          // Clear the form fields
          setAltText("");
          setSeoTitle("");
          toast.success('Media uploaded successfully!');
        } catch (error) {
          console.error('Error saving media asset:', error);
          toast.error(`Error saving media asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      setUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);

      // Determine error type and provide specific feedback
      let errorMessage = 'Upload failed';
      let canRetry = true;

      if (error.message.includes('File too large')) {
        errorMessage = 'File size exceeds the maximum limit';
        canRetry = false;
      } else if (error.message.includes('Invalid file type')) {
        errorMessage = 'File type not supported';
        canRetry = false;
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out - please try again';
      } else {
        errorMessage = `Upload failed: ${error.message}`;
      }

      toast.error(errorMessage);
      setUploading(false);

      // Store error for potential retry
      if (canRetry) {
        setUploadErrors(prev => ({
          ...prev,
          'current': errorMessage
        }));
      }
    },
    onUploadProgress: (progress) => {
      setUploadProgress(prev => ({
        ...prev,
        'current': progress
      }));
    },
  });

  // Fetch media from database
  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  // Refetch when filters change
  useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [filters, open]);

  const fetchMedia = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type !== 'all') params.append('type', filters.type);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('limit', '100'); // Reasonable limit for picker

      const response = await fetch(`/api/media?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let mediaItems = data.mediaAssets?.map((asset: any) => ({
          id: asset.id,
          url: asset.url,
          altText: asset.altText || 'Media asset',
          seoTitle: asset.seoTitle || '',
          type: asset.type,
          width: asset.width,
          height: asset.height,
          createdAt: asset.createdAt,
          createdBy: asset.createdBy
        })) || [];

        // Filter by allowed types if specified
        if (allowedTypes && allowedTypes.length > 0) {
          mediaItems = mediaItems.filter((item: MediaItem) =>
            allowedTypes.includes(item.type)
          );
        }

        setItems(mediaItems);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaAndReturn = async (): Promise<MediaItem[]> => {
    try {
      const response = await fetch('/api/media?limit=100');
      if (response.ok) {
        const data = await response.json();
        const mediaItems = data.mediaAssets?.map((asset: any) => ({
          id: asset.id,
          url: asset.url,
          altText: asset.altText || 'Media asset',
          seoTitle: asset.seoTitle || '',
          type: asset.type,
          width: asset.width,
          height: asset.height,
          createdAt: asset.createdAt,
          createdBy: asset.createdBy
        })) || [];
        setItems(mediaItems);
        return mediaItems;
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    }
    return [];
  };

  // Memoized filtered and sorted items
  const filteredItems = useMemo(() => {
    return items; // Filtering is now done server-side
  }, [items]);

  const handlePick = (item: MediaItem) => {
    if (maxSelection === 1) {
      onSelect(item);
      setOpen(false);
    } else {
      // Multi-selection logic
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else if (newSelected.size < maxSelection) {
        newSelected.add(item.id);
      }
      setSelectedItems(newSelected);
    }
  };

  const handleSelectMultiple = () => {
    const selectedMediaItems = items.filter(item => selectedItems.has(item.id));
    selectedMediaItems.forEach(item => onSelect(item));
    setOpen(false);
    setSelectedItems(new Set());
  };

  const updateFilter = (key: keyof MediaFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.IMAGE:
        return <ImageIcon className="h-4 w-4" />;
      case MediaType.VIDEO:
        return <Video className="h-4 w-4" />;
      case MediaType.AUDIO:
        return <Music className="h-4 w-4" />;
      case MediaType.DOCUMENT:
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the dialog content
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const getMaxFileSize = (type: MediaType): number => {
    switch (type) {
      case MediaType.IMAGE:
        return 10 * 1024 * 1024; // 10MB
      case MediaType.VIDEO:
        return 50 * 1024 * 1024; // 50MB
      case MediaType.DOCUMENT:
        return 5 * 1024 * 1024; // 5MB
      default:
        return 10 * 1024 * 1024;
    }
  };

  const retryUpload = async (files: File[], attemptNumber: number = 1) => {
    const maxRetries = 3;
    const backoffDelay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 10000); // Exponential backoff, max 10s

    try {
      if (attemptNumber > 1) {
        toast.info(`Retrying upload (attempt ${attemptNumber}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }

      startUpload(files);
    } catch (error) {
      console.error(`Upload attempt ${attemptNumber} failed:`, error);

      if (attemptNumber < maxRetries) {
        setRetryAttempts(prev => ({
          ...prev,
          'current': attemptNumber
        }));
        await retryUpload(files, attemptNumber + 1);
      } else {
        toast.error(`Upload failed after ${maxRetries} attempts. Please try again later.`);
        setUploading(false);
      }
    }
  };

  const cancelUpload = () => {
    setCancelledUploads(prev => new Set([...prev, 'current']));
    setUploading(false);
    setUploadProgress({});
    toast.info('Upload cancelled');
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadErrors({});
    setRetryAttempts({});
    setUploadProgress({});

    // Validate file types if allowedTypes is specified
    if (allowedTypes && allowedTypes.length > 0) {
      const validFiles = files.filter(file => {
        const fileType = detectFileType(file);
        return allowedTypes.includes(fileType);
      });

      if (validFiles.length !== files.length) {
        const invalidCount = files.length - validFiles.length;
        toast.warning(`${invalidCount} file(s) were skipped due to unsupported file types.`);
      }

      if (validFiles.length === 0) {
        toast.error('No valid files to upload.');
        setUploading(false);
        return;
      }

      files = validFiles;
    }

    // Check max selection limit
    if (files.length > maxSelection) {
      toast.warning(`You can only upload ${maxSelection} file(s) at a time.`);
      files = files.slice(0, maxSelection);
    }

    // Validate file sizes and optimize images
    const processedFiles: File[] = [];

    for (const file of files) {
      const fileType = detectFileType(file);
      const maxSize = getMaxFileSize(fileType);

      if (file.size > maxSize) {
        if (fileType === MediaType.IMAGE) {
          // Try to compress the image
          try {
            toast.info(`Compressing ${file.name}...`);
            const compressed = await ImageOptimizationService.compressImage(file, {
              quality: 80,
              maxWidth: 1920,
              maxHeight: 1080
            });

            if (compressed.compressedSize <= maxSize) {
              processedFiles.push(compressed.compressedFile);
              toast.success(`${file.name} compressed by ${Math.round(compressed.compressionRatio * 100)}%`);
            } else {
              toast.error(`${file.name} is still too large after compression. Please reduce file size manually.`);
              setUploading(false);
              return;
            }
          } catch (error) {
            toast.error(`Failed to compress ${file.name}. Please reduce file size manually.`);
            setUploading(false);
            return;
          }
        } else {
          toast.error(`${file.name} is too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`);
          setUploading(false);
          return;
        }
      } else {
        // Check if image can benefit from optimization
        if (fileType === MediaType.IMAGE && file.size > 1024 * 1024) { // > 1MB
          try {
            const analysis = await ImageOptimizationService.analyzeImage(file);
            if (analysis.needsOptimization && analysis.estimatedSavings && analysis.estimatedSavings > 0.2) {
              toast.info(`Optimizing ${file.name}...`);
              const compressed = await ImageOptimizationService.compressImage(file, {
                quality: 85,
                maxWidth: 2000,
                maxHeight: 2000
              });
              processedFiles.push(compressed.compressedFile);
              toast.success(`${file.name} optimized - saved ${Math.round(compressed.compressionRatio * 100)}%`);
            } else {
              processedFiles.push(file);
            }
          } catch (error) {
            // If optimization fails, use original file
            processedFiles.push(file);
          }
        } else {
          processedFiles.push(file);
        }
      }
    }

    await retryUpload(processedFiles);
  };

  const detectFileType = (file: File): MediaType => {
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    return MediaType.DOCUMENT;
  };

  const isValidFileType = (file: File): boolean => {
    if (!allowedTypes || allowedTypes.length === 0) return true;

    const fileType = detectFileType(file);
    return allowedTypes.includes(fileType);
  };

  const handlePreview = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPreviewItem(item);
    setShowPreview(true);
  };

  const handleContextMenu = (item: MediaItem, e: React.MouseEvent) => {
    e.preventDefault();
    handlePreview(item);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadMedia = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = item.altText || 'media-file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      const newItem: MediaItem = {
        id: `url-${Date.now()}`,
        url: imageUrl.trim(),
        altText: altText.trim() || "Image from URL",
        seoTitle: seoTitle.trim() || "",
        type: MediaType.IMAGE,
        createdAt: new Date().toISOString()
      };
      onSelect(newItem);
      setOpen(false);
      setImageUrl("");
      setAltText("");
      setSeoTitle("");
      setShowUrlInput(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary z-50 flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-primary">Drop files here to upload</p>
              <p className="text-sm text-muted-foreground">
                {allowedTypes && allowedTypes.length > 0
                  ? `Supported types: ${allowedTypes.join(', ')}`
                  : 'All file types supported'
                }
              </p>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Select Media</span>
            <div className="flex items-center gap-2">
              {maxSelection > 1 && selectedItems.size > 0 && (
                <Badge variant="secondary">
                  {selectedItems.size} selected
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Choose from existing media files or upload new ones. You can select up to {maxSelection} {maxSelection === 1 ? 'file' : 'files'}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Upload Form */}
          {showUpload && !uploading && (
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium">Upload Media</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="upload-alt-text">Alt Text (Optional)</Label>
                    <Input
                      id="upload-alt-text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Describe the media for accessibility..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upload-seo-title">SEO Title (Optional)</Label>
                    <Input
                      id="upload-seo-title"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="SEO-friendly title..."
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = allowedTypes ?
                        allowedTypes.map(type => {
                          switch (type) {
                            case MediaType.IMAGE: return 'image/*';
                            case MediaType.VIDEO: return 'video/*';
                            case MediaType.AUDIO: return 'audio/*';
                            case MediaType.DOCUMENT: return '.pdf,.doc,.docx,.txt';
                            default: return '*/*';
                          }
                        }).join(',') : '*/*';
                      input.multiple = maxSelection > 1;
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length > 0) {
                          handleFileUpload(files);
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload {maxSelection > 1 ? 'Files' : 'File'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.current || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {uploadProgress.current || 0}%
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelUpload}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Add from URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filters.search || filters.type !== 'all' || filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
            {maxSelection > 1 && selectedItems.size > 0 && (
              <Button
                onClick={handleSelectMultiple}
                className="flex items-center gap-2"
              >
                Select {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        placeholder="Search by name..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Media Type */}
                  <div className="space-y-2">
                    <Label>Media Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => updateFilter('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {(!allowedTypes || allowedTypes.includes(MediaType.IMAGE)) && (
                          <SelectItem value={MediaType.IMAGE}>Images</SelectItem>
                        )}
                        {(!allowedTypes || allowedTypes.includes(MediaType.VIDEO)) && (
                          <SelectItem value={MediaType.VIDEO}>Videos</SelectItem>
                        )}
                        {(!allowedTypes || allowedTypes.includes(MediaType.AUDIO)) && (
                          <SelectItem value={MediaType.AUDIO}>Audio</SelectItem>
                        )}
                        {(!allowedTypes || allowedTypes.includes(MediaType.DOCUMENT)) && (
                          <SelectItem value={MediaType.DOCUMENT}>Documents</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => updateFilter('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="altText">Name</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value) => updateFilter('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">
                          <div className="flex items-center gap-2">
                            <SortDesc className="h-4 w-4" />
                            Descending
                          </div>
                        </SelectItem>
                        <SelectItem value="asc">
                          <div className="flex items-center gap-2">
                            <SortAsc className="h-4 w-4" />
                            Ascending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                    />
                  </div>
                </div>

                {/* Active Filters */}
                {(filters.search || filters.type !== 'all' || filters.dateFrom || filters.dateTo) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {filters.search && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Search: {filters.search}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilter('search', '')}
                        />
                      </Badge>
                    )}
                    {filters.type !== 'all' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Type: {filters.type}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilter('type', 'all')}
                        />
                      </Badge>
                    )}
                    {filters.dateFrom && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        From: {filters.dateFrom}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilter('dateFrom', undefined)}
                        />
                      </Badge>
                    )}
                    {filters.dateTo && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        To: {filters.dateTo}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilter('dateTo', undefined)}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* URL Input Section */}
          {showUrlInput && (
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="image-url">Media URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/media-file.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text (Optional)</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the media..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-title">SEO Title (Optional)</Label>
                  <Input
                    id="seo-title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO-friendly title..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()}>
                    Add Media
                  </Button>
                  <Button variant="outline" onClick={() => setShowUrlInput(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media Display */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading media...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                {showUpload && !filters.search && filters.type === 'all' && !filters.dateFrom && !filters.dateTo ? (
                  /* Drag and drop zone when no media exists */
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = allowedTypes ?
                        allowedTypes.map(type => {
                          switch (type) {
                            case MediaType.IMAGE: return 'image/*';
                            case MediaType.VIDEO: return 'video/*';
                            case MediaType.AUDIO: return 'audio/*';
                            case MediaType.DOCUMENT: return '.pdf,.doc,.docx,.txt';
                            default: return '*/*';
                          }
                        }).join(',') : '*/*';
                      input.multiple = maxSelection > 1;
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length > 0) {
                          handleFileUpload(files);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload your first media file</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {allowedTypes && allowedTypes.length > 0
                        ? `Supported types: ${allowedTypes.join(', ')}`
                        : 'All file types supported'
                      }
                    </p>
                  </div>
                ) : (
                  /* Regular empty state */
                  <div>
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No media found</p>
                    <p className="text-sm text-muted-foreground">
                      {filters.search || filters.type !== 'all' || filters.dateFrom || filters.dateTo
                        ? "Try adjusting your filters or upload new media"
                        : "Upload media to get started"
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`hover:border-primary/50 transition-colors cursor-pointer group ${selectedItems.has(item.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                    onClick={() => handlePick(item)}
                    onContextMenu={(e) => handleContextMenu(item, e)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                        {item.type === MediaType.IMAGE ? (
                          <img
                            src={item.url}
                            alt={item.altText}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                            {getMediaTypeIcon(item.type)}
                          </div>
                        )}

                        {/* Media type badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-xs"
                        >
                          {item.type}
                        </Badge>

                        {/* Preview button - shows on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handlePreview(item, e)}
                            className="text-xs"
                          >
                            Preview
                          </Button>
                        </div>

                        {/* Selection indicator */}
                        {maxSelection > 1 && selectedItems.has(item.id) && (
                          <div className="absolute top-2 left-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="text-xs line-clamp-1 font-medium">{item.altText}</div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDate(item.createdAt)}</span>
                          {item.width && item.height && (
                            <span>{item.width}×{item.height}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`hover:border-primary/50 transition-colors cursor-pointer group ${selectedItems.has(item.id) ? 'border-primary bg-primary/5' : ''
                      }`}
                    onClick={() => handlePick(item)}
                    onContextMenu={(e) => handleContextMenu(item, e)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.type === MediaType.IMAGE ? (
                            <img
                              src={item.url}
                              alt={item.altText}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getMediaTypeIcon(item.type)}
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{item.altText}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.createdAt)}
                            </span>
                            {item.width && item.height && (
                              <span>{item.width}×{item.height}</span>
                            )}
                            {item.createdBy && (
                              <span>by {item.createdBy.name}</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handlePreview(item, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Preview
                          </Button>

                          {/* Selection indicator */}
                          {maxSelection > 1 && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedItems.has(item.id)
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground'
                              }`}>
                              {selectedItems.has(item.id) && <span className="text-xs">✓</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Media Preview Modal */}
        {showPreview && previewItem && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getMediaTypeIcon(previewItem.type)}
                  Media Preview
                </DialogTitle>
                <DialogDescription>
                  Preview and details for {previewItem.altText || 'selected media file'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Media Display */}
                <div className="bg-muted rounded-lg overflow-hidden">
                  {previewItem.type === MediaType.IMAGE ? (
                    <img
                      src={previewItem.url}
                      alt={previewItem.altText}
                      className="w-full max-h-96 object-contain"
                    />
                  ) : previewItem.type === MediaType.VIDEO ? (
                    <video
                      src={previewItem.url}
                      controls
                      className="w-full max-h-96"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : previewItem.type === MediaType.AUDIO ? (
                    <div className="p-8 text-center">
                      <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <audio
                        src={previewItem.url}
                        controls
                        className="w-full max-w-md mx-auto"
                      >
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Document preview not available</p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(previewItem.url, '_blank')}
                        className="mt-4"
                      >
                        Open Document
                      </Button>
                    </div>
                  )}
                </div>

                {/* Media Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <p className="text-sm bg-muted p-2 rounded">{previewItem.altText}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Badge variant="outline">{previewItem.type}</Badge>
                  </div>

                  {previewItem.width && previewItem.height && (
                    <div className="space-y-2">
                      <Label>Dimensions</Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {previewItem.width} × {previewItem.height} pixels
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Created</Label>
                    <p className="text-sm bg-muted p-2 rounded">
                      {formatDate(previewItem.createdAt)}
                    </p>
                  </div>

                  {previewItem.createdBy && (
                    <div className="space-y-2">
                      <Label>Created By</Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {previewItem.createdBy.name}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={previewItem.url}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(previewItem.url)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => downloadMedia(previewItem)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(previewItem.url, '_blank')}
                    >
                      Open in New Tab
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        handlePick(previewItem);
                        setShowPreview(false);
                      }}
                    >
                      Select This Media
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}


