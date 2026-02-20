/**
 * Image Optimization Service
 * Handles image compression, format optimization, and thumbnail generation
 */

export interface ImageOptimizationOptions {
  quality?: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface OptimizedImage {
  originalUrl: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  originalSize: number;
  optimizedSize?: number;
  compressionRatio?: number;
  width: number;
  height: number;
  format: string;
}

export class ImageOptimizationService {
  /**
   * Generate thumbnail URL using Next.js Image Optimization
   */
  static generateThumbnailUrl(imageUrl: string, size: number = 200): string {
    // For external URLs, we can't use Next.js optimization directly
    // In a production environment, you'd use a service like Cloudinary or ImageKit
    if (imageUrl.startsWith('http')) {
      // For now, return the original URL
      // In production, implement actual thumbnail generation
      return imageUrl;
    }
    
    // For local images, use Next.js Image optimization
    return `/_next/image?url=${encodeURIComponent(imageUrl)}&w=${size}&q=75`;
  }

  /**
   * Generate responsive image variants
   */
  static generateResponsiveVariants(imageUrl: string): {
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      small: this.generateThumbnailUrl(imageUrl, 400),
      medium: this.generateThumbnailUrl(imageUrl, 800),
      large: this.generateThumbnailUrl(imageUrl, 1200),
      original: imageUrl
    };
  }

  /**
   * Analyze image and suggest optimizations
   */
  static analyzeImage(file: File): Promise<{
    needsOptimization: boolean;
    suggestions: string[];
    estimatedSavings?: number;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const blobUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Revoke blob URL immediately after loading
        URL.revokeObjectURL(blobUrl);
        
        const suggestions: string[] = [];
        let needsOptimization = false;
        let estimatedSavings = 0;

        // Check file size
        if (file.size > 2 * 1024 * 1024) { // > 2MB
          suggestions.push('File size is large. Consider compressing to reduce load times.');
          needsOptimization = true;
          estimatedSavings += 0.3; // Estimate 30% savings
        }

        // Check dimensions
        if (img.width > 2000 || img.height > 2000) {
          suggestions.push('Image dimensions are very large. Consider resizing for web use.');
          needsOptimization = true;
          estimatedSavings += 0.2; // Estimate 20% additional savings
        }

        // Check format
        if (file.type === 'image/png' && !this.hasTransparency(img, canvas, ctx)) {
          suggestions.push('PNG without transparency could be converted to JPEG for smaller size.');
          needsOptimization = true;
          estimatedSavings += 0.4; // Estimate 40% savings
        }

        if (file.type === 'image/jpeg' || file.type === 'image/png') {
          suggestions.push('Consider converting to WebP format for better compression.');
          estimatedSavings += 0.25; // Estimate 25% additional savings
        }

        resolve({
          needsOptimization,
          suggestions,
          estimatedSavings: Math.min(estimatedSavings, 0.8) // Cap at 80% savings
        });
      };

      img.onerror = () => {
        // Revoke blob URL on error too
        URL.revokeObjectURL(blobUrl);
        
        resolve({
          needsOptimization: false,
          suggestions: ['Unable to analyze image.']
        });
      };

      img.src = blobUrl;
    });
  }

  /**
   * Check if image has transparency (simplified check)
   */
  private static hasTransparency(img: HTMLImageElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null): boolean {
    if (!ctx) return false;
    
    canvas.width = Math.min(img.width, 100);
    canvas.height = Math.min(img.height, 100);
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Check alpha channel
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          return true; // Has transparency
        }
      }
    } catch (error) {
      // CORS or other error, assume no transparency
      return false;
    }
    
    return false;
  }

  /**
   * Get optimal image format based on content
   */
  static getOptimalFormat(file: File): Promise<'webp' | 'jpeg' | 'png'> {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const blobUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Revoke blob URL immediately after loading
        URL.revokeObjectURL(blobUrl);
        
        if (this.hasTransparency(img, canvas, ctx)) {
          resolve('webp'); // WebP supports transparency and good compression
        } else if (file.type.includes('photo') || file.name.toLowerCase().includes('photo')) {
          resolve('jpeg'); // Photos usually better as JPEG
        } else {
          resolve('webp'); // Default to WebP for best compression
        }
      };

      img.onerror = () => {
        // Revoke blob URL on error too
        URL.revokeObjectURL(blobUrl);
        resolve('jpeg'); // Fallback
      };

      img.src = blobUrl;
    });
  }

  /**
   * Compress image client-side (basic implementation)
   */
  static compressImage(file: File, options: ImageOptimizationOptions = {}): Promise<{
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  }> {
    return new Promise((resolve, reject) => {
      const {
        quality = 80,
        maxWidth = 1920,
        maxHeight = 1080,
        format = 'jpeg'
      } = options;

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const blobUrl = URL.createObjectURL(file);

      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Revoke blob URL immediately after loading
        URL.revokeObjectURL(blobUrl);
        
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });

            const compressionRatio = (file.size - blob.size) / file.size;

            resolve({
              compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio
            });
          },
          `image/${format}`,
          quality / 100
        );
      };

      img.onerror = () => {
        // Revoke blob URL on error too
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to load image'));
      };

      img.src = blobUrl;
    });
  }

  /**
   * Generate lazy loading placeholder (low quality image placeholder)
   */
  static generatePlaceholder(file: File, size: number = 20): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const blobUrl = URL.createObjectURL(file);

      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Revoke blob URL immediately after loading
        URL.revokeObjectURL(blobUrl);
        
        // Create tiny version
        const ratio = Math.min(size / img.width, size / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to base64 with very low quality
        const placeholder = canvas.toDataURL('image/jpeg', 0.1);
        resolve(placeholder);
      };

      img.onerror = () => {
        // Revoke blob URL on error too
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to generate placeholder'));
      };

      img.src = blobUrl;
    });
  }

  /**
   * Calculate storage savings from optimization
   */
  static calculateStorageSavings(originalSize: number, optimizedSize: number): {
    savedBytes: number;
    savedPercentage: number;
    savedMB: number;
  } {
    const savedBytes = originalSize - optimizedSize;
    const savedPercentage = (savedBytes / originalSize) * 100;
    const savedMB = savedBytes / (1024 * 1024);

    return {
      savedBytes,
      savedPercentage,
      savedMB
    };
  }
}