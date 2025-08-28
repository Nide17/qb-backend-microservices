/**
 * API Cache Utility
 * 
 * This utility provides request deduplication and response caching
 * to optimize API calls and reduce network requests.
 */

// In-memory cache store
const cache = new Map();
// Active requests map to prevent duplicate requests
const activeRequests = new Map();

/**
 * Generate a cache key from request config
 * @param {Object} config - Request configuration
 * @returns {string} - Cache key
 */
const generateCacheKey = (config) => {
  const { method, url, params = {}, data = {} } = config;
  
  // Create a consistent key based on method, URL, and sorted params/data
  const keyParts = [
    method?.toLowerCase(),
    url,
    JSON.stringify(
      Object.keys(params)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {})
    ),
    method !== 'get' && method !== 'head' 
      ? JSON.stringify(data) 
      : ''
  ].filter(Boolean);
  
  return keyParts.join('|');
};

/**
 * Check if a cached response is still valid
 * @param {Object} cached - Cached response with timestamp
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {boolean} - True if cache is still valid
 */
const isCacheValid = (cached, maxAge) => {
  if (!cached || !cached.timestamp) return false;
  return Date.now() - cached.timestamp < (maxAge || 0);
};

/**
 * Get a cached response if available and valid
 * @param {string} key - Cache key
 * @param {number} maxAge - Maximum cache age in milliseconds
 * @returns {Object|null} - Cached response or null if not found/expired
 */
export const getCachedResponse = (key, maxAge) => {
  const cached = cache.get(key);
  return isCacheValid(cached, maxAge) ? cached.data : null;
};

/**
 * Cache a response
 * @param {string} key - Cache key
 * @param {*} data - Response data to cache
 * @param {number} maxAge - Cache duration in milliseconds
 */
export const cacheResponse = (key, data, maxAge) => {
  if (!key || !data) return;
  
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: maxAge ? Date.now() + maxAge : null,
  });
  
  // Schedule cache cleanup if maxAge is provided
  if (maxAge) {
    setTimeout(() => {
      const cached = cache.get(key);
      if (cached && cached.expiresAt <= Date.now()) {
        cache.delete(key);
      }
    }, maxAge);
  }
};

/**
 * Clear the cache
 * @param {string} [key] - Optional key to clear specific cache entry
 */
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Track an active request to prevent duplicates
 * @param {string} key - Request key
 * @returns {boolean} - True if request is already in progress
 */
export const trackRequest = (key) => {
  if (activeRequests.has(key)) {
    return true; // Request already in progress
  }
  
  activeRequests.set(key, true);
  return false;
};

/**
 * Mark a request as completed
 * @param {string} key - Request key
 */
export const completeRequest = (key) => {
  activeRequests.delete(key);
};

/**
 * Get the number of active requests
 * @returns {number} - Count of active requests
 */
export const getActiveRequestCount = () => {
  return activeRequests.size;
};

/**
 * Create a cache key for API requests
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} [params] - Request parameters
 * @param {Object} [data] - Request data
 * @returns {string} - Cache key
 */
export const createRequestKey = (method, url, params, data) => {
  return generateCacheKey({ method, url, params, data });
};

// Auto-cleanup for expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, { expiresAt }] of cache.entries()) {
    if (expiresAt && expiresAt <= now) {
      cache.delete(key);
    }
  }
}, 60000); // Run cleanup every minute

export default {
  get: getCachedResponse,
  set: cacheResponse,
  clear: clearCache,
  createKey: createRequestKey,
  trackRequest,
  completeRequest,
  getActiveRequestCount,
};
