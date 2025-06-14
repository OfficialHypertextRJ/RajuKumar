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
    return `${url}${separator}w=${width}&q=75&auto=format`;
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
  return '(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw';
}

// Function to generate blur data URL for images (simple version)
export function getBlurDataUrl(): string {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF6nHgAAAABJRU5ErkJggg==';
} 