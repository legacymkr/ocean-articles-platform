/**
 * Image optimization utilities with blur placeholders
 */

import { ImageProps } from "next/image";

/**
 * Generate a blur placeholder for images
 * This creates a small base64 encoded image for smooth loading
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  const canvas = typeof window !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) {
    // Fallback for SSR
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  }

  // Create a gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0A2C38");
  gradient.addColorStop(0.5, "#1F5C73");
  gradient.addColorStop(1, "#3CA8C1");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.1);
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  width: number = 800,
  height: number = 600,
  priority: boolean = false,
): ImageProps {
  return {
    src,
    alt,
    width,
    height,
    priority,
    placeholder: "blur",
    blurDataURL: generateBlurPlaceholder(10, 10),
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 85,
    className: "rounded-lg object-cover",
  };
}

/**
 * Generate responsive image sizes for different breakpoints
 */
export function getResponsiveImageSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw";
}

/**
 * Get image dimensions from URL (for uploaded images)
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      // SSR fallback
      resolve({ width: 800, height: 600 });
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Generate a blur hash for an image (simplified version)
 * In production, you'd want to use a proper blur hash library
 */
export function generateBlurHash(width: number, height: number): string {
  // This is a simplified blur hash - in production use a proper library
  const hash = `L${width}x${height}`;
  return hash;
}

/**
 * Get image aspect ratio
 */
export function getAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Check if image is landscape or portrait
 */
export function isLandscape(width: number, height: number): boolean {
  return width > height;
}

/**
 * Get optimal image dimensions for different use cases
 */
export function getOptimalDimensions(
  useCase: "thumbnail" | "card" | "hero" | "full-width",
  containerWidth: number = 1200,
): { width: number; height: number } {
  switch (useCase) {
    case "thumbnail":
      return { width: 300, height: 200 };
    case "card":
      return { width: 400, height: 300 };
    case "hero":
      return { width: containerWidth, height: Math.round(containerWidth * 0.6) };
    case "full-width":
      return { width: containerWidth, height: Math.round(containerWidth * 0.5) };
    default:
      return { width: 800, height: 600 };
  }
}
