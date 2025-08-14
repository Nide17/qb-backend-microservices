const Redis = require('ioredis');

class RedisCacheManager {
    constructor() {
        this.redis = null;
        this.isConnected = false;
        this.defaultTTL = 300; // 5 minutes in seconds
        this.retryDelay = 5000; // 5 seconds
        this.maxRetries = 3;
    }

    async connect() {
        try {
            this.redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD,
                db: process.env.REDIS_DB || 0,
                retryDelayOnFailover: this.retryDelay,
                maxRetriesPerRequest: this.maxRetries,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000,
                retryDelayOnClusterDown: 300,
                enableOfflineQueue: false,
                maxLoadingTimeout: 10000,
            });

            this.redis.on('connect', () => {
                console.log('✅ Redis connected successfully');
                this.isConnected = true;
            });

            this.redis.on('error', (err) => {
                console.error('❌ Redis connection error:', err);
                this.isConnected = false;
            });

            this.redis.on('close', () => {
                console.log('🔌 Redis connection closed');
                this.isConnected = false;
            });

            this.redis.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
            });

            await this.redis.connect();
            return true;
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            this.isConnected = false;
            return false;
        }
    }

    async disconnect() {
        if (this.redis) {
            await this.redis.quit();
            this.isConnected = false;
        }
    }

    async get(key) {
        if (!this.isConnected || !this.redis) {
            return null;
        }

        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async set(key, value, ttl = this.defaultTTL) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            if (ttl > 0) {
                await this.redis.setex(key, ttl, serializedValue);
            } else {
                await this.redis.set(key, serializedValue);
            }
            return true;
        } catch (error) {
            console.error('Redis set error:', error);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            console.error('Redis del error:', error);
            return false;
        }
    }

    async exists(key) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    }

    async expire(key, ttl) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            await this.redis.expire(key, ttl);
            return true;
        } catch (error) {
            console.error('Redis expire error:', error);
            return false;
        }
    }

    async ttl(key) {
        if (!this.isConnected || !this.redis) {
            return -1;
        }

        try {
            return await this.redis.ttl(key);
        } catch (error) {
            console.error('Redis ttl error:', error);
            return -1;
        }
    }

    async keys(pattern) {
        if (!this.isConnected || !this.redis) {
            return [];
        }

        try {
            return await this.redis.keys(pattern);
        } catch (error) {
            console.error('Redis keys error:', error);
            return [];
        }
    }

    async flush() {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            await this.redis.flushdb();
            return true;
        } catch (error) {
            console.error('Redis flush error:', error);
            return false;
        }
    }

    async getStats() {
        if (!this.isConnected || !this.redis) {
            return null;
        }

        try {
            const info = await this.redis.info();
            const keys = await this.redis.dbsize();
            return {
                connected: this.isConnected,
                keys,
                info: info.split('\r\n').reduce((acc, line) => {
                    const [key, value] = line.split(':');
                    if (key && value) {
                        acc[key] = value;
                    }
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Redis stats error:', error);
            return null;
        }
    }

    // Cache invalidation patterns
    async invalidatePattern(pattern) {
        if (!this.isConnected || !this.redis) {
            return false;
        }

        try {
            const keys = await this.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                console.log(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
            }
            return true;
        } catch (error) {
            console.error('Redis invalidate pattern error:', error);
            return false;
        }
    }

    // Smart cache invalidation for related data
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
}

module.exports = RedisCacheManager;
