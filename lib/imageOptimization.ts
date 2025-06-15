/**
 * Image optimization utilities
 */

// Function to get optimized image URL from Firebase Storage URL
export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url) return '';
  
  // Check if it's a Firebase Storage URL
  if (url.includes('firebasestorage.googleapis.com')) {
    // Add image processing parameters to the URL
    const separator = url.includes('?') ? '&' : '?';
    // Use webp format for better compression and performance
    return `${url}${separator}w=${width}&q=75&fm=webp&auto=compress`;
  }
  
  // For placeholder images, return as is
  if (url.includes('placehold.co')) {
    return url;
  }
  
  // Return original URL for other sources
  return url;
}

// Function to get appropriate image size based on viewport
export function getImageSizes(): string {
  return '(max-width: 640px) 95vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 33vw';
}

// Function to generate blur data URL for images (simple version)
export function getBlurDataUrl(): string {
  // Smaller, more optimized blur data URL
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}

// Function to check if image should be lazy loaded based on viewport position
export function shouldLazyLoad(elementPosition: number): boolean {
  if (typeof window === 'undefined') return true;
  
  const viewportHeight = window.innerHeight;
  return elementPosition > viewportHeight * 1.5; // Load images that are 1.5x viewport away
} 