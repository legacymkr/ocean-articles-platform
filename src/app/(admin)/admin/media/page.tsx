"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MediaPicker } from "@/components/media-picker";
import {
  Search,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  HardDrive,
  Music,
  Copy,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Edit,
  X,
  RefreshCw,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { MediaType } from "@prisma/client";

interface MediaAsset {
  id: string;
  url: string;
  type: MediaType;
  width?: number;
  height?: number;
  blurhash?: string;
  altText?: string;
  seoTitle?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
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

interface EditingMedia {
  id: string;
  altText: string;
  seoTitle: string;
}

const typeIcons = {
  [MediaType.IMAGE]: ImageIcon,
  [MediaType.VIDEO]: Video,
  [MediaType.DOCUMENT]: FileText,
  [MediaType.AUDIO]: Music,
};

const typeColors = {
  [MediaType.IMAGE]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  [MediaType.VIDEO]: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  [MediaType.DOCUMENT]: "bg-green-500/20 text-green-400 border-green-500/30",
  [MediaType.AUDIO]: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function MediaPage() {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [unusedMedia, setUnusedMedia] = useState<any[]>([]);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [showStorageStats, setShowStorageStats] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [duplicateMedia, setDuplicateMedia] = useState<any[]>([]);
  const [showDuplicatesDialog, setShowDuplicatesDialog] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingMedia, setEditingMedia] = useState<{id: string, altText: string, seoTitle: string} | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    destructive?: boolean;
  } | null>(null);

  // Advanced filtering state
  const [filters, setFilters] = useState<MediaFilters>({
    search: '',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch media assets from database
  useEffect(() => {
    fetchMediaAssets();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchMediaAssets();
  }, [filters, pagination.offset]);  const 
fetchMediaAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.type !== 'all') params.append('type', filters.type);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());
      
      console.log('Fetching media with params:', params.toString());
      
      const response = await fetch(`/api/media?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Media API Error:', response.status, errorText);
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Media API Response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.success && data.success !== undefined) {
        throw new Error(data.error || 'API returned unsuccessful response');
      }
      
      setMediaAssets(data.mediaAssets || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false
      }));
      
      console.log(`Loaded ${data.mediaAssets?.length || 0} media assets`);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load media assets');
      setMediaAssets([]);
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof MediaFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleMediaSelect = (media: any) => {
    // Media was uploaded via MediaPicker, refresh the list
    console.log('Media uploaded successfully:', media);
    toast.success('Media uploaded successfully!');
    fetchMediaAssets();
    setShowUploadDialog(false);
  };  const 
getMediaTypeIcon = (type: MediaType) => {
    const IconComponent = typeIcons[type];
    return <IconComponent className="h-4 w-4" />;
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

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const handlePreview = (media: MediaAsset) => {
    setPreviewMedia(media);
    setShowPreviewDialog(true);
  };

  const handleEdit = (media: MediaAsset) => {
    setEditingMedia({
      id: media.id,
      altText: media.altText || '',
      seoTitle: media.seoTitle || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    try {
      const response = await fetch(`/api/media/${editingMedia.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          altText: editingMedia.altText,
          seoTitle: editingMedia.seoTitle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update media');
      }

      await fetchMediaAssets();
      setShowEditDialog(false);
      setEditingMedia(null);
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Failed to update media');
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    showConfirmation(
      'Delete Media Asset',
      'Are you sure you want to delete this media asset? This action cannot be undone.',
      () => performDeleteMedia(mediaId),
      true
    );
  };

  const performDeleteMedia = async (mediaId: string) => {
    
    try {
      setIsDeleting(mediaId);
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Media is in use
          const forceDelete = confirm(
            `${errorData.details}\n\nThis will break references to this media. Continue anyway?`
          );
          if (forceDelete) {
            const forceResponse = await fetch(`/api/media/${mediaId}?force=true`, {
              method: 'DELETE'
            });
            if (!forceResponse.ok) {
              throw new Error('Failed to force delete media asset');
            }
          } else {
            return;
          }
        } else {
          throw new Error('Failed to delete media asset');
        }
      }
      
      setMediaAssets(prev => prev.filter(asset => asset.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media asset:', error);
      toast.error('Failed to delete media asset');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === mediaAssets.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(mediaAssets.map(item => item.id)));
      setShowBulkActions(true);
    }
  };  
const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    showConfirmation(
      'Delete Multiple Media Assets',
      `Are you sure you want to delete ${selectedItems.size} media asset(s)? This action cannot be undone.`,
      () => performBulkDelete(),
      true
    );
  };

  const performBulkDelete = async () => {
    
    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: Array.from(selectedItems),
          force: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete media assets');
      }

      const result = await response.json();
      
      if (result.results.inUse.length > 0) {
        const forceDelete = confirm(
          `${result.results.inUse.length} media asset(s) are in use. Force delete anyway?`
        );
        
        if (forceDelete) {
          const forceResponse = await fetch('/api/media', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ids: Array.from(selectedItems),
              force: true
            })
          });
          
          if (!forceResponse.ok) {
            throw new Error('Failed to force delete media assets');
          }
        }
      }
      
      await fetchMediaAssets();
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error deleting media assets:', error);
      toast.error('Failed to delete some media assets');
    }
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };



  const showConfirmation = (title: string, message: string, onConfirm: () => void, destructive: boolean = false) => {
    setConfirmAction({ title, message, onConfirm, destructive });
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onConfirm();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleFindUnusedMedia = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/admin/media/cleanup');
      const data = await response.json();
      
      if (data.success) {
        setUnusedMedia(data.unusedMedia);
        setShowCleanupDialog(true);
      } else {
        toast.error('Failed to find unused media');
      }
    } catch (error) {
      console.error('Error finding unused media:', error);
      toast.error('Failed to find unused media');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleCleanupUnused = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/admin/media/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cleanup' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Cleaned up ${data.cleanedCount} unused media references`);
        setShowCleanupDialog(false);
        setUnusedMedia([]);
        await fetchMediaAssets(); // Refresh the media list
      } else {
        toast.error('Failed to cleanup unused media');
      }
    } catch (error) {
      console.error('Error cleaning up unused media:', error);
      toast.error('Failed to cleanup unused media');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleFindDuplicates = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/admin/media/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'find-duplicates' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDuplicateMedia(data.duplicates);
        setShowDuplicatesDialog(true);
      } else {
        toast.error('Failed to find duplicate media');
      }
    } catch (error) {
      console.error('Error finding duplicate media:', error);
      toast.error('Failed to find duplicate media');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleGetStorageStats = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/admin/media/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'storage-stats' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStorageStats(data.stats);
        setShowStorageStats(true);
      } else {
        toast.error('Failed to get storage statistics');
      }
    } catch (error) {
      console.error('Error getting storage stats:', error);
      toast.error('Failed to get storage statistics');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleShowStorageStats = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/admin/media/cleanup?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStorageStats(data.stats);
        setShowStorageStats(true);
      } else {
        toast.error('Failed to load storage statistics');
      }
    } catch (error) {
      console.error('Error loading storage stats:', error);
      toast.error('Failed to load storage statistics');
    } finally {
      setCleanupLoading(false);
    }
  };



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-glow-primary">Media Library</h1>
          <p className="text-muted-foreground mt-2">Manage your images, videos, and documents</p>
        </div>
        <div className="flex items-center gap-2">
          {showBulkActions && (
            <>
              <Badge variant="secondary" className="mr-2">
                {selectedItems.size} selected
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="mr-2"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={handleShowStorageStats}
            disabled={cleanupLoading}
            size="sm"
          >
            {cleanupLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4 mr-1" />
            )}
            Storage
          </Button>
          <Button 
            variant="outline"
            onClick={handleFindDuplicates}
            disabled={cleanupLoading}
            size="sm"
          >
            {cleanupLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            Duplicates
          </Button>
          <Button 
            variant="outline"
            onClick={handleFindUnusedMedia}
            disabled={cleanupLoading}
            size="sm"
          >
            {cleanupLoading ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Cleanup
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Upload Media
          </Button>
        </div>
      </div>      {/*
 Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading media assets...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="glass-card border-destructive/50">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchMediaAssets} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simple Media Grid */}
      {!loading && !error && mediaAssets.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground mb-4">Upload your first media asset to get started.</p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-1" />
              Upload Media
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Media Grid */}
      {!loading && !error && mediaAssets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaAssets.map((asset) => (
            <Card key={asset.id} className="glass-card group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Media Preview */}
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                  {asset.type === 'IMAGE' ? (
                    <img
                      src={asset.url}
                      alt={asset.altText || 'Media asset'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-muted">
                              <div class="text-center">
                                <svg class="h-12 w-12 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-xs text-muted-foreground">Failed to load</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        {getMediaTypeIcon(asset.type)}
                        <p className="text-xs text-muted-foreground mt-2">
                          {asset.type.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handlePreview(asset)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyUrl(asset.url)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(asset)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteMedia(asset.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Media Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getMediaTypeIcon(asset.type)}
                    <Badge variant="secondary" className={typeColors[asset.type]}>
                      {asset.type}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-sm truncate mb-1">
                    {asset.altText || getFileName(asset.url)}
                  </h4>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Created: {formatDate(asset.createdAt)}</p>
                    {asset.width && asset.height && (
                      <p>Size: {asset.width} × {asset.height}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload new media files to your library. You can drag and drop files or click to browse.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <MediaPicker
              onSelect={handleMediaSelect}
              triggerText="Upload Files"
              maxSelection={10}
              showUpload={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Cleanup Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Cleanup</DialogTitle>
            <DialogDescription>
              Review and clean up unused media files to free up storage space.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Found {unusedMedia.length} potentially unused media files older than 30 days.
              </p>
              
              {unusedMedia.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {unusedMedia.map((media) => (
                    <div key={media.id} className="flex items-center justify-between p-2 border border-border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{getFileName(media.url)}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(media.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                {unusedMedia.length > 0 && (
                  <Button 
                    onClick={handleCleanupUnused}
                    disabled={cleanupLoading}
                    variant="destructive"
                  >
                    {cleanupLoading ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Cleanup Unused
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowCleanupDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Storage Statistics Dialog */}
      <Dialog open={showStorageStats} onOpenChange={setShowStorageStats}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Storage Statistics</DialogTitle>
            <DialogDescription>
              View detailed statistics about your media library storage usage.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {storageStats && (
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{storageStats.totalFiles}</div>
                    <div className="text-sm text-muted-foreground">Total Files</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {Math.round(storageStats.totalSize / (1024 * 1024))}MB
                    </div>
                    <div className="text-sm text-muted-foreground">Total Size</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {Math.round(storageStats.averageFileSize / 1024)}KB
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Size</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{Object.keys(storageStats.byType).length}</div>
                    <div className="text-sm text-muted-foreground">File Types</div>
                  </div>
                </div>

                {/* By Type */}
                <div>
                  <h4 className="font-semibold mb-3">Storage by Type</h4>
                  <div className="space-y-2">
                    {Object.entries(storageStats.byType).map(([type, stats]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          {type === 'IMAGE' && <ImageIcon className="h-4 w-4" />}
                          {type === 'VIDEO' && <Video className="h-4 w-4" />}
                          {type === 'DOCUMENT' && <FileText className="h-4 w-4" />}
                          <span className="font-medium">{type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{stats.count} files</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(stats.size / (1024 * 1024))}MB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duplicates Info */}
                {duplicateMedia.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Duplicate Files Found</h4>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <p className="text-sm">
                        Found {duplicateMedia.length} sets of duplicate files. 
                        Use the "Duplicates" button to review and clean them up.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2 justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowStorageStats(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>
              Please confirm your action. This operation may not be reversible.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-muted-foreground mb-6">
              {confirmAction?.message}
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant={confirmAction?.destructive ? "destructive" : "default"}
                onClick={handleConfirm}
              >
                {confirmAction?.destructive ? "Delete" : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Duplicates Dialog */}
      <Dialog open={showDuplicatesDialog} onOpenChange={setShowDuplicatesDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Duplicate Media Files</DialogTitle>
            <DialogDescription>
              Review and manage duplicate media files found in your library.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Found {duplicateMedia.length} groups of duplicate media files.
              </p>
              
              {duplicateMedia.length > 0 && (
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {duplicateMedia.map((group, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Duplicate Group {index + 1}</h4>
                      <p className="text-sm text-muted-foreground mb-3">URL: {group.url}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.duplicates.map((duplicate: any, dupIndex: number) => (
                          <div key={duplicate.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">Copy {dupIndex + 1}</p>
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(duplicate.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {dupIndex > 0 && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteMedia(duplicate.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDuplicatesDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Storage Stats Dialog */}
      <Dialog open={showStorageStats} onOpenChange={setShowStorageStats}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Storage Statistics</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {storageStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{storageStats.totalFiles}</div>
                    <div className="text-sm text-muted-foreground">Total Files</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {storageStats.totalSize ? `${(storageStats.totalSize / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Size</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Files by Type</h4>
                  <div className="space-y-2">
                    {Object.entries(storageStats.byType).map(([type, stats]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          {getMediaTypeIcon(type as MediaType)}
                          <span className="capitalize">{type.toLowerCase()}</span>
                        </div>
                        <div className="text-sm">
                          {stats.count} files
                          {stats.size > 0 && ` • ${(stats.size / (1024 * 1024)).toFixed(1)} MB`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(storageStats.oldestFile || storageStats.newestFile) && (
                  <div>
                    <h4 className="font-medium mb-3">Timeline</h4>
                    <div className="space-y-2">
                      {storageStats.oldestFile && (
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Oldest File:</span>
                          <span>{new Date(storageStats.oldestFile).toLocaleDateString()}</span>
                        </div>
                      )}
                      {storageStats.newestFile && (
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Newest File:</span>
                          <span>{new Date(storageStats.newestFile).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowStorageStats(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Media Preview</DialogTitle>
            <DialogDescription>
              Preview the selected media file and view its details.
            </DialogDescription>
          </DialogHeader>
          {previewMedia && (
            <div className="p-4">
              <div className="space-y-4">
                {/* Media Preview */}
                <div className="flex justify-center">
                  {previewMedia.type === 'IMAGE' ? (
                    <img
                      src={previewMedia.url}
                      alt={previewMedia.altText || 'Preview'}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  ) : previewMedia.type === 'VIDEO' ? (
                    <video
                      src={previewMedia.url}
                      controls
                      className="max-w-full max-h-96 rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-64 h-64 bg-muted rounded-lg">
                      {getMediaTypeIcon(previewMedia.type)}
                      <span className="ml-2">{previewMedia.type}</span>
                    </div>
                  )}
                </div>

                {/* Media Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Alt Text:</strong> {previewMedia.altText || 'None'}
                  </div>
                  <div>
                    <strong>SEO Title:</strong> {previewMedia.seoTitle || 'None'}
                  </div>
                  <div>
                    <strong>Type:</strong> {previewMedia.type}
                  </div>
                  <div>
                    <strong>Created:</strong> {formatDate(previewMedia.createdAt)}
                  </div>
                  {previewMedia.width && previewMedia.height && (
                    <>
                      <div>
                        <strong>Width:</strong> {previewMedia.width}px
                      </div>
                      <div>
                        <strong>Height:</strong> {previewMedia.height}px
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyUrl(previewMedia.url)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreviewDialog(false);
                      handleEdit(previewMedia);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowPreviewDialog(false);
                      handleDeleteMedia(previewMedia.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
            <DialogDescription>
              Edit the alt text and SEO title for this media file.
            </DialogDescription>
          </DialogHeader>
          {editingMedia && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    value={editingMedia.altText}
                    onChange={(e) => setEditingMedia({
                      ...editingMedia,
                      altText: e.target.value
                    })}
                    placeholder="Describe the media for accessibility"
                  />
                </div>
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={editingMedia.seoTitle}
                    onChange={(e) => setEditingMedia({
                      ...editingMedia,
                      seoTitle: e.target.value
                    })}
                    placeholder="SEO-friendly title"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingMedia(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}