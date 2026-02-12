/**
 * Cloudinary service for image upload and optimization
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'douh6tfzo',
  api_key: process.env.CLOUDINARY_API_KEY || '827437729188963',
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(
  file: File | string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any;
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Convert File to base64 if needed
    let uploadSource: string;
    
    if (typeof file === 'string') {
      uploadSource = file;
    } else {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      uploadSource = `data:${file.type};base64,${base64}`;
    }

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: options.folder || 'galatide-articles',
      public_id: options.public_id,
      ...options.transformation,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Generate optimized image URL with automatic compression
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width || 1000,
        crop: options.crop || 'scale'
      },
      {
        quality: options.quality || 'auto'
      },
      {
        fetch_format: options.format || 'auto'
      }
    ]
  });
}

/**
 * Generate responsive image with multiple sizes for better performance
 */
export function getResponsiveImageUrl(
  publicId: string,
  sizes: number[] = [400, 800, 1200, 1600]
): { [key: string]: string } {
  const responsiveUrls: { [key: string]: string } = {};
  
  sizes.forEach(size => {
    responsiveUrls[`w_${size}`] = cloudinary.url(publicId, {
      transformation: [
        { width: size, crop: 'scale' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
  });
  
  return responsiveUrls;
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 300): string {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

export default cloudinary;
