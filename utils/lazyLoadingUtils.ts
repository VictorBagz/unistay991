/**
 * Lazy Loading Image Utilities
 * Provides utilities for implementing native lazy loading and intersection observer
 * for optimized image rendering and performance
 */

export interface LazyImageConfig {
  rootMargin?: string;
  threshold?: number | number[];
}

const DEFAULT_CONFIG: LazyImageConfig = {
  rootMargin: '50px',
  threshold: 0.01,
};

/**
 * Check if browser supports IntersectionObserver API
 */
export const supportsIntersectionObserver = (): boolean => {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
};

/**
 * Check if browser supports native lazy loading
 */
export const supportsNativeLazyLoading = (): boolean => {
  if (typeof HTMLImageElement === 'undefined') return false;
  return 'loading' in HTMLImageElement.prototype;
};

/**
 * Get the appropriate loading strategy based on browser support
 */
export const getLoadingStrategy = (): 'native' | 'observer' | 'fallback' => {
  if (supportsNativeLazyLoading()) {
    return 'native';
  }
  if (supportsIntersectionObserver()) {
    return 'observer';
  }
  return 'fallback';
};

/**
 * Setup intersection observer for lazy loading images
 */
export const setupLazyLoadObserver = (
  config: LazyImageConfig = DEFAULT_CONFIG
): IntersectionObserver | null => {
  if (!supportsIntersectionObserver()) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        const srcSet = img.dataset.srcset;

        if (src && !img.src) {
          img.src = src;
        }
        if (srcSet && !(img as any).srcSet) {
          (img as any).srcSet = srcSet;
        }

        img.classList.remove('lazy');
        img.classList.add('lazy-loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: config.rootMargin || DEFAULT_CONFIG.rootMargin,
    threshold: config.threshold !== undefined ? config.threshold : DEFAULT_CONFIG.threshold,
  });
};

let observer: IntersectionObserver | null = null;

/**
 * Initialize global lazy load observer
 */
export const initializeLazyLoadObserver = (config?: LazyImageConfig): void => {
  if (!supportsIntersectionObserver()) {
    console.warn('IntersectionObserver not supported - lazy loading will use fallback');
    return;
  }

  if (observer) {
    return; // Already initialized
  }

  observer = setupLazyLoadObserver(config);
};

/**
 * Observe an image element for lazy loading
 */
export const observeImage = (img: HTMLImageElement): void => {
  if (observer && supportsIntersectionObserver()) {
    observer.observe(img);
  } else {
    // Fallback: load image immediately
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;
    if (src) img.src = src;
    if (srcSet) (img as any).srcSet = srcSet;
  }
};

/**
 * Cleanup lazy load observer
 */
export const cleanupLazyLoadObserver = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

/**
 * Generate CSS for lazy loading styles
 */
export const getLazyLoadingStyles = (): string => `
  img.lazy {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  img.lazy-loaded {
    opacity: 1;
  }
  
  img.lazy-loading {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

/**
 * Preload an image
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map((src) => preloadImage(src)));
};

/**
 * Generate a placeholder blur hash or gradient
 */
export const generatePlaceholder = (
  width: number = 10,
  height: number = 10,
  color: string = '#e0e0e0'
): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(color)}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};

/**
 * Create an optimized image URL with transformations
 */
export const optimizeImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'avif';
  } = {}
): string => {
  if (!url) return '';
  
  // If URL doesn't support transformation, return as-is
  if (!url.includes('/')) {
    return url;
  }

  const { width, height, quality = 80, format } = options;
  
  // Handle URLs with transformation parameters
  if (url.includes('picsum.photos')) {
    const parts = url.split('?');
    const baseUrl = parts[0];
    const dimensions = width && height ? `${width}/${height}` : '';
    return dimensions ? `${baseUrl}?${dimensions}&q=${quality}` : url;
  }

  return url;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280]
): string => {
  return sizes
    .map((size) => `${optimizeImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};
