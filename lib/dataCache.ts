/**
 * Data caching utilities to improve performance
 */

// Cache storage
const dataCache: Record<string, {
  data: any;
  timestamp: number;
  expiresIn: number;
}> = {};

// Default cache expiration time (5 minutes)
const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

/**
 * Get data from cache or fetch it using the provided function
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param expiresIn Cache expiration time in milliseconds
 * @returns The cached or freshly fetched data
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expiresIn: number = DEFAULT_CACHE_TIME
): Promise<T> {
  const now = Date.now();
  
  // Check if data is in cache and not expired
  if (
    dataCache[key] &&
    now - dataCache[key].timestamp < dataCache[key].expiresIn
  ) {
    return dataCache[key].data as T;
  }
  
  // Fetch fresh data
  try {
    const data = await fetchFn();
    
    // Store in cache
    dataCache[key] = {
      data,
      timestamp: now,
      expiresIn,
    };
    
    return data;
  } catch (error) {
    // If we have stale data, return it on error
    if (dataCache[key]) {
      console.warn(`Error fetching fresh data for ${key}, using stale data:`, error);
      return dataCache[key].data as T;
    }
    
    // Otherwise, rethrow the error
    throw error;
  }
}

/**
 * Invalidate a specific cache entry
 * @param key Cache key to invalidate
 */
export function invalidateCache(key: string): void {
  delete dataCache[key];
}

/**
 * Invalidate all cache entries
 */
export function invalidateAllCache(): void {
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
} 