/**
 * Performance optimization utilities for Galatide
 * Lighthouse and Core Web Vitals focused improvements
 */

// Image optimization helpers
export const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 120 },
  card: { width: 400, height: 240 },
  hero: { width: 1200, height: 600 },
  cover: { width: 800, height: 450 },
  avatar: { width: 64, height: 64 },
} as const;

export const IMAGE_QUALITY = {
  thumbnail: 60,
  card: 75,
  hero: 85,
  cover: 80,
  avatar: 90,
} as const;

/**
 * Generate optimized image URL with Next.js Image Optimization
 */
export function getOptimizedImageUrl(
  src: string,
  size: keyof typeof IMAGE_SIZES,
  quality?: number
): string {
  const { width, height } = IMAGE_SIZES[size];
  const q = quality || IMAGE_QUALITY[size];
  
  // For external URLs, use Next.js image optimization
  if (src.startsWith('http')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&h=${height}&q=${q}`;
  }
  
  // For local images, return as-is (Next.js Image component will handle optimization)
  return src;
}

/**
 * Generate responsive image sizes string
 */
export function getResponsiveImageSizes(size: keyof typeof IMAGE_SIZES): string {
  const { width } = IMAGE_SIZES[size];
  
  switch (size) {
    case 'hero':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px';
    case 'cover':
      return '(max-width: 768px) 100vw, 800px';
    case 'card':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px';
    case 'thumbnail':
      return '200px';
    case 'avatar':
      return '64px';
    default:
      return `${width}px`;
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
}

/**
 * Lazy load non-critical resources
 */
export function lazyLoadResource(href: string, as: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Critical resource priorities
 */
export const RESOURCE_PRIORITIES = {
  critical: ['fonts', 'css', 'hero-images'],
  important: ['scripts', 'cover-images'],
  normal: ['icons', 'thumbnails'],
  low: ['analytics', 'social-widgets'],
} as const;

/**
 * Font display strategies for optimal loading
 */
export const FONT_DISPLAY_STRATEGIES = {
  critical: 'swap', // For body text - show fallback immediately
  heading: 'fallback', // For headings - brief invisible period, then fallback
  decorative: 'optional', // For decorative fonts - use only if available quickly
} as const;

/**
 * Code splitting helpers
 */
import React from "react";

export function createAsyncComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn);
}

/**
 * Bundle size optimization
 */
export const BUNDLE_OPTIMIZATION = {
  // Tree-shakeable imports
  lodashModular: 'import { debounce } from "lodash-es"', // Instead of 'import _ from "lodash"'
  dateModular: 'import { format } from "date-fns"', // Instead of importing entire library
  
  // Dynamic imports for large libraries (commented to avoid missing dependencies)
  // chartjs: () => import('chart.js'),
  // editor: () => import('@monaco-editor/react'),
  // pdf: () => import('react-pdf'),
} as const;

/**
 * Web Vitals thresholds (Google's recommendations)
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },   // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
} as const;

/**
 * Performance monitoring helper
 */
export function measurePerformance(name: string, fn: () => void): number {
  if (typeof window === 'undefined') {
    fn();
    return 0;
  }
  
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  return duration;
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Service Worker utilities
 */
export const SERVICE_WORKER = {
  register: async (swPath: string = '/sw.js') => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('SW registered:', registration);
      return registration;
    } catch (error) {
      console.log('SW registration failed:', error);
      return null;
    }
  },
  
  unregister: async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    return registration.unregister();
  },
};

/**
 * Resource hints for better loading
 */
export function addResourceHints(): void {
  if (typeof window === 'undefined') return;
  
  // DNS prefetch for external domains
  const dnsPrefetch = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'images.unsplash.com',
  ];
  
  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
  
  // Preconnect to critical domains
  const preconnect = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
  
  preconnect.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}
