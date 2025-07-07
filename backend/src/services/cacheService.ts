/**
 * Simple in-memory LRU cache for NLP results
 * Improves response time for repeated text patterns
 */

interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private ttl: number // Time to live in milliseconds

  constructor(maxSize: number = 1000, ttlMinutes: number = 30) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttlMinutes * 60 * 1000 // Convert to milliseconds
  }

  /**
   * Generate cache key from text and user languages
   */
  private generateKey(text: string, userLanguages: string[] = []): string {
    const normalizedText = text.toLowerCase().trim()
    const sortedLanguages = [...userLanguages].sort().join(',')
    return `${normalizedText}|${sortedLanguages}`
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.ttl
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Get cached result
   */
  get(text: string, userLanguages: string[] = []): T | null {
    const key = this.generateKey(text, userLanguages)
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }
    
    // Update access info for LRU
    entry.timestamp = Date.now()
    entry.accessCount++
    
    return entry.value
  }

  /**
   * Set cache entry
   */
  set(text: string, userLanguages: string[] = [], value: T): void {
    const key = this.generateKey(text, userLanguages)
    
    // Clean up expired entries occasionally
    if (this.cache.size > this.maxSize * 0.8) {
      this.cleanupExpired()
    }
    
    // Evict LRU if at max capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    })
  }

  /**
   * Check if result is cached
   */
  has(text: string, userLanguages: string[] = []): boolean {
    const key = this.generateKey(text, userLanguages)
    const entry = this.cache.get(key)
    return entry !== undefined && !this.isExpired(entry)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    maxSize: number
    ttlMinutes: number
    hitRate: number
    topEntries: Array<{ text: string; languages: string; accessCount: number }>
  } {
    this.cleanupExpired()
    
    let totalAccess = 0
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      totalAccess += entry.accessCount
      const [text, languages] = key.split('|')
      return {
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        languages: languages || 'none',
        accessCount: entry.accessCount
      }
    })
    
    // Sort by access count and take top 5
    const topEntries = entries
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttlMinutes: this.ttl / (60 * 1000),
      hitRate: totalAccess > 0 ? (totalAccess / this.cache.size) : 0,
      topEntries
    }
  }
}

// Global cache instance for NLP results
export const nlpCache = new LRUCache<any>(500, 15) // 500 entries, 15 minute TTL

export { LRUCache }