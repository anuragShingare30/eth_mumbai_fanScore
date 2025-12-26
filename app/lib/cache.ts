// In-memory cache and rate limiting utilities for scaling

// Cache for user data with TTL (Time To Live)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 300) {
    // Default 5 minutes TTL
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  set(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get entry age in seconds
  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return Math.floor((Date.now() - entry.timestamp) / 1000);
  }

  // Check if entry is stale (older than given seconds)
  isStale(key: string, maxAgeSeconds: number): boolean {
    const age = this.getAge(key);
    return age === null || age > maxAgeSeconds;
  }
}

// Request deduplication - prevents duplicate API calls for the same handle
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  async dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
    // If there's already a pending request for this key, return that promise
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Create new request and store it
    const promise = factory()
      .finally(() => {
        // Clean up after request completes
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  hasPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}

// Simple rate limiter using sliding window
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowSeconds: number = 60, maxRequests: number = 30) {
    this.windowMs = windowSeconds * 1000;
    this.maxRequests = maxRequests;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.requests.get(key) || [];
    
    // Filter out old timestamps
    timestamps = timestamps.filter(t => t > windowStart);
    
    if (timestamps.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(key, timestamps);
    
    return false;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(t => t > windowStart);
    
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}

// Global rate limiter for RapidAPI (to not exceed API limits)
// Adjust based on your RapidAPI plan limits
export const apiRateLimiter = new RateLimiter(60, 100); // 100 requests per minute

// Per-IP rate limiter for user requests
export const userRateLimiter = new RateLimiter(60, 10); // 10 requests per minute per IP

// Cache for user analysis results (5 minute TTL)
export const userCache = new MemoryCache<{
  handle: string;
  displayName: string;
  profileImageUrl: string;
  tweetCount: number;
  score: number;
  ethMumbaiTweets: number;
  ethMumbaiMentions: number;
  ethMumbaiHashtags: number;
  rank: string;
}>(300);

// Request deduplicator to prevent duplicate API calls
export const requestDeduplicator = new RequestDeduplicator();

// Leaderboard version for real-time updates
let leaderboardVersion = 0;

export function incrementLeaderboardVersion(): number {
  return ++leaderboardVersion;
}

export function getLeaderboardVersion(): number {
  return leaderboardVersion;
}

// Cleanup old rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiRateLimiter.cleanup();
    userRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}
