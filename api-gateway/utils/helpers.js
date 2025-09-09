const axios = require('axios');
const RedisCacheManager = require('./redis-cache');

// Initialize Redis cache manager
const redisCache = new RedisCacheManager();

// In-memory cache as fallback
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enhanced cache functions with Redis fallback
const getCachedData = async (key) => {
    try {
        // Try Redis first
        if (redisCache.isConnected) {
            const cached = await redisCache.get(key);
            if (cached) {
                console.log(`📦 Redis cache hit: ${key}`);
                return cached;
            }
        }

        // Fallback to memory cache
        const cached = memoryCache.get(key);
        if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
            console.log(`💾 Memory cache hit: ${key}`);
            return cached.data;
        }

        return null;
    } catch (error) {
        console.error('Cache get error:\n', error);
        // Fallback to memory cache on error
        const cached = memoryCache.get(key);
        if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL) {
            return cached.data;
        }
        return null;
    }
};

const setCachedData = async (key, data, ttl = 300) => {
    try {
        // Set in Redis first
        if (redisCache.isConnected) {
            await redisCache.set(key, data, ttl);
            console.log(`📦 Redis cache set: ${key} (TTL: ${ttl}s)`);
        }

        // Also set in memory cache as backup
        memoryCache.set(key, { data, timestamp: Date.now() });
    } catch (error) {
        console.error('Cache set error:\n', error);
        // Fallback to memory cache only
        memoryCache.set(key, { data, timestamp: Date.now() });
    }
};

const makeRequest = async (req, res, serviceName, serviceUrl) => {
    try {
        // Prepare headers, include internal service header if present
        const headers = {
            'x-auth-token': req.header('x-auth-token')
        };

        // Forward internal service header if present (for statistics service calls)
        if (req.header('x-internal-service')) {
            headers['x-internal-service'] = req.header('x-internal-service');
        }

        const response = await axios({
            method: req.method,
            url: `${serviceUrl}${req.originalUrl}`,
            data: req.body,
            headers: headers,
            validateStatus: function (status) {
                // Accept all HTTP status codes as valid responses
                // This prevents 4xx and 5xx from being treated as errors
                return status >= 200 && status < 600;
            }
        });

        return response;
    } catch (error) {
        console.log(`Error making ${req.method} request to ${serviceName} with url ${req.originalUrl}:`, error.message);
        // Don't send response here, let routeToService handle it
        throw error; // Rethrow the error to be handled by routeToService
    }
};

const routeToService = (serviceName, serviceUrl) => async (req, res) => {
    
    // Check if response has already been sent
    if (res.headersSent) {
        console.log(`Response already sent for ${serviceName} request`);
        return;
    }

    try {
        const response = await makeRequest(req, res, serviceName, serviceUrl);

        // Check again before sending response
        if (res.headersSent) {
            console.log(`Response headers already sent for ${serviceName}, skipping response`);
            return;
        }

        if (response && response.status && response.data !== undefined) {
            // Forward all responses, including 4xx and 5xx status codes
            res.status(response.status).json(response.data);
        } else {
            res.status(502).json({
                success: false,
                error: `${serviceName} Service Unavailable`,
                message: `${serviceName} service is currently unavailable`,
                code: 'SERVICE_UNAVAILABLE',
                service: serviceName,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        // Check if response has already been sent before sending error response
        if (res.headersSent) {
            console.log(`Response already sent for ${serviceName}, cannot send error response`);
            return;
        }

        // Handle network errors and connection issues
        console.log(`Network error for ${serviceName}:`, error.message);
        
        try {
            res.status(502).json({
                success: false,
                error: `${serviceName} Service Unavailable`,
                message: `${serviceName} service is currently unavailable - ${error.message}`,
                code: 'SERVICE_UNAVAILABLE',
                service: serviceName,
                timestamp: new Date().toISOString()
            });
        } catch (responseError) {
            console.log(`Failed to send error response for ${serviceName}:`, responseError.message);
        }
    }
};

module.exports = {
    makeRequest,
    routeToService,
    getCachedData,
    setCachedData,
    redisCache,
    memoryCache
};