import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

/**
 * Lazy loading image component
 * Automatically adds loading="lazy" and handles errors
 */
export default function LazyImage({ 
  src, 
  alt, 
  fallback,
  className,
  ...props 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallback && !hasError) {
      setImageSrc(fallback);
      setHasError(true);
    } else if (!hasError) {
      // Default fallback - show placeholder
      setImageSrc('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E');
      setHasError(true);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      className={cn(className)}
      onError={handleError}
      {...props}
    />
  );
}


