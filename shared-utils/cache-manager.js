const Redis = require('ioredis');

class CacheManager {
    constructor(options = {}) {
        this.options = {
            redis: {
                host: options.redis?.host || process.env.REDIS_HOST || 'localhost',
                port: options.redis?.port || process.env.REDIS_PORT || 6379,
                password: options.redis?.password || process.env.REDIS_PASSWORD,
                db: options.redis?.db || process.env.REDIS_DB || 0,
                ...options.redis
            },
            memory: {
                maxSize: options.memory?.maxSize || 1000,
                ttl: options.memory?.ttl || 5 * 60 * 1000, // 5 minutes
                ...options.memory
            },
            defaultTTL: options.defaultTTL || 300, // 5 minutes in seconds
            enableRedis: options.enableRedis !== false,
            enableMemory: options.enableMemory !== false
        };

        this.redis = null;
        this.memoryCache = new Map();
        this.isRedisConnected = false;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };

        this.initialize();
    }

    async initialize() {
        if (this.options.enableRedis) {
            await this.connectRedis();
        }
    }

    async connectRedis() {
        try {
            this.redis = new Redis(this.options.redis);

            this.redis.on('connect', () => {
                console.log('✅ Redis cache connected');
                this.isRedisConnected = true;
            });

            this.redis.on('error', (err) => {
                console.error('❌ Redis cache error:', err);
                this.isRedisConnected = false;
            });

            this.redis.on('close', () => {
                console.log('🔌 Redis cache disconnected');
                this.isRedisConnected = false;
            });

            await this.redis.ping();
        } catch (error) {
            console.warn('⚠️ Redis cache connection failed, falling back to memory cache:', error.message);
            this.isRedisConnected = false;
        }
    }

    async get(key) {
        try {
            // Try Redis first
            if (this.isRedisConnected && this.redis) {
                const value = await this.redis.get(key);
                if (value) {
                    this.stats.hits++;
                    return JSON.parse(value);
                }
            }

            // Fallback to memory cache
            if (this.options.enableMemory) {
                const cached = this.memoryCache.get(key);
                if (cached && Date.now() - cached.timestamp < cached.ttl) {
                    this.stats.hits++;
                    return cached.data;
                }
            }

            this.stats.misses++;
            return null;
        } catch (error) {
            console.error('Cache get error:', error);
            // Fallback to memory cache on error
            if (this.options.enableMemory) {
                const cached = this.memoryCache.get(key);
                if (cached && Date.now() - cached.timestamp < cached.ttl) {
                    return cached.data;
                }
            }
            return null;
        }
    }

    async set(key, value, ttl = this.options.defaultTTL) {
        try {
            this.stats.sets++;

            // Set in Redis first
            if (this.isRedisConnected && this.redis) {
                await this.redis.setex(key, ttl, JSON.stringify(value));
            }

            // Also set in memory cache
            if (this.options.enableMemory) {
                this.setMemoryCache(key, value, ttl * 1000);
            }

            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            // Fallback to memory cache only
            if (this.options.enableMemory) {
                this.setMemoryCache(key, value, ttl * 1000);
            }
            return false;
        }
    }

    setMemoryCache(key, value, ttl) {
        // Clean up old entries if cache is full
        if (this.memoryCache.size >= this.options.memory.maxSize) {
            const oldestKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(oldestKey);
        }

        this.memoryCache.set(key, {
            data: value,
            timestamp: Date.now(),
            ttl: ttl
        });
    }

    async delete(key) {
        try {
            this.stats.deletes++;

            // Delete from Redis
            if (this.isRedisConnected && this.redis) {
                await this.redis.del(key);
            }

            // Delete from memory cache
            if (this.options.enableMemory) {
                this.memoryCache.delete(key);
            }

            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            // Fallback to memory cache only
            if (this.options.enableMemory) {
                this.memoryCache.delete(key);
            }
            return false;
        }
    }

    async exists(key) {
        try {
            if (this.isRedisConnected && this.redis) {
                const result = await this.redis.exists(key);
                return result === 1;
            }

            if (this.options.enableMemory) {
                const cached = this.memoryCache.get(key);
                return cached && Date.now() - cached.timestamp < cached.ttl;
            }

            return false;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    async expire(key, ttl) {
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.expire(key, ttl);
            }

            if (this.options.enableMemory) {
                const cached = this.memoryCache.get(key);
                if (cached) {
                    cached.ttl = ttl * 1000;
                }
            }

            return true;
        } catch (error) {
            console.error('Cache expire error:', error);
            return false;
        }
    }

    async ttl(key) {
        try {
            if (this.isRedisConnected && this.redis) {
                return await this.redis.ttl(key);
            }

            if (this.options.enableMemory) {
                const cached = this.memoryCache.get(key);
                if (cached) {
                    const remaining = cached.ttl - (Date.now() - cached.timestamp);
                    return Math.max(0, Math.floor(remaining / 1000));
                }
            }

            return -1;
        } catch (error) {
            console.error('Cache TTL error:', error);
            return -1;
        }
    }

    async keys(pattern) {
        try {
            if (this.isRedisConnected && this.redis) {
                return await this.redis.keys(pattern);
            }

            if (this.options.enableMemory) {
                const keys = [];
                for (const key of this.memoryCache.keys()) {
                    if (this.matchPattern(key, pattern)) {
                        keys.push(key);
                    }
                }
                return keys;
            }

            return [];
        } catch (error) {
            console.error('Cache keys error:', error);
            return [];
        }
    }

    matchPattern(key, pattern) {
        // Simple pattern matching for memory cache
        const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(key);
    }

    async flush() {
        try {
            if (this.isRedisConnected && this.redis) {
                await this.redis.flushdb();
            }

            if (this.options.enableMemory) {
                this.memoryCache.clear();
            }

            this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
            return true;
        } catch (error) {
            console.error('Cache flush error:', error);
            return false;
        }
    }

    async invalidatePattern(pattern) {
        try {
            const keys = await this.keys(pattern);
            if (keys.length > 0) {
                await Promise.all(keys.map(key => this.delete(key)));
                console.log(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
            }
            return true;
        } catch (error) {
            console.error('Cache invalidate pattern error:', error);
            return false;
        }
    }

    async invalidateRelated(key) {
        const patterns = [
            `*${key}*`,
            `quiz_*`,
            `user_*`,
            `category_*`,
            `search_*`
        ];

        for (const pattern of patterns) {
            await this.invalidatePattern(pattern);
        }
    }

    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;

        return {
            redis: {
                connected: this.isRedisConnected,
                host: this.options.redis.host,
                port: this.options.redis.port
            },
            memory: {
                size: this.memoryCache.size,
                maxSize: this.options.memory.maxSize
            },
            performance: {
                hits: this.stats.hits,
                misses: this.stats.misses,
                sets: this.stats.sets,
                deletes: this.stats.deletes,
                hitRate: `${hitRate}%`
            }
        };
    }

    async disconnect() {
        if (this.redis) {
            await this.redis.quit();
            this.isRedisConnected = false;
        }
    }

    // Clean up expired memory cache entries
    cleanup() {
        if (this.options.enableMemory) {
            const now = Date.now();
            for (const [key, cached] of this.memoryCache.entries()) {
                if (now - cached.timestamp > cached.ttl) {
                    this.memoryCache.delete(key);
                }
            }
        }
    }
}

// Start cleanup interval
setInterval(() => {
    if (global.cacheManager) {
        global.cacheManager.cleanup();
    }
}, 60000); // Clean up every minute

module.exports = CacheManager;
