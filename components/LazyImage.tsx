import React, { useEffect, useRef, useState } from 'react';
import { observeImage, supportsIntersectionObserver, generatePlaceholder } from '../utils/lazyLoadingUtils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

/**
 * LazyImage Component
 * Automatically handles lazy loading with fallbacks for browsers that don't support
 * IntersectionObserver. Uses native lazy loading when available.
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  onLoad,
  onError,
  srcSet,
  sizes,
  loading = 'lazy',
  decoding = 'async',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If native lazy loading is supported, use it
    if (loading === 'lazy' && 'loading' in img) {
      img.loading = 'lazy';
      img.src = src;
      if (srcSet) img.srcSet = srcSet;
      if (sizes) img.sizes = sizes;
    } else if (supportsIntersectionObserver()) {
      // Use IntersectionObserver for lazy loading
      img.dataset.src = src;
      if (srcSet) img.dataset.srcset = srcSet;
      img.classList.add('lazy');
      observeImage(img);
    } else {
      // Fallback: load immediately
      img.src = src;
      if (srcSet) img.srcSet = srcSet;
    }

    // Handle load event
    const handleLoad = () => {
      setIsLoaded(true);
      img.classList.add('lazy-loaded');
      img.classList.remove('lazy');
      onLoad?.();
    };

    // Handle error event
    const handleError = () => {
      setHasError(true);
      img.classList.remove('lazy');
      onError?.();
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, srcSet, sizes, loading, onLoad, onError]);

  const placeholderSrc = placeholder || generatePlaceholder(width || 10, height || 10);

  return (
    <img
      ref={imgRef}
      src={loading === 'eager' ? src : placeholderSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'lazy-loaded' : 'lazy'} ${
        hasError ? 'opacity-50' : ''
      }`}
      width={width}
      height={height}
      decoding={decoding}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  );
};

export default LazyImage;
