"use client";

import Image from "next/image";
import { useState } from "react";
import { getOptimizedImageProps, getOptimalDimensions } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  useCase?: "thumbnail" | "card" | "hero" | "full-width";
  className?: string;
  containerWidth?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  useCase = "card",
  className,
  containerWidth = 1200,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get optimal dimensions based on use case
  const optimalDimensions = getOptimalDimensions(useCase, containerWidth);
  const finalWidth = width || optimalDimensions.width;
  const finalHeight = height || optimalDimensions.height;

  const imageProps = getOptimizedImageProps(src, alt, finalWidth, finalHeight, priority);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
        style={{ width: finalWidth, height: finalHeight }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        {...imageProps}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          imageProps.className,
        )}
      />
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
          style={{ width: finalWidth, height: finalHeight }}
        >
          <div className="text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  );
}
