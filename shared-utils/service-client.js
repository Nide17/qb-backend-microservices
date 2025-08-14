const axios = require('axios');
const Logger = require('./logger');

class ServiceClient {
    constructor(serviceName, logger) {
        this.serviceName = serviceName;
        this.logger = logger || new Logger(serviceName);
        this.defaultTimeout = 10000; // 10 seconds
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async request(config) {
        const startTime = Date.now();
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await axios({
                    ...config,
                    timeout: config.timeout || this.defaultTimeout,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': `${this.serviceName}/1.0.0`,
                        ...config.headers
                    }
                });

                const duration = Date.now() - startTime;
                this.logger.logServiceCall(
                    config.service || 'unknown',
                    config.url || config.endpoint || 'unknown',
                    duration,
                    true
                );

                return response;
            } catch (error) {
                lastError = error;
                const duration = Date.now() - startTime;

                if (attempt < this.maxRetries) {
                    this.logger.warn(`Service call failed, retrying (${attempt}/${this.maxRetries})`, {
                        service: config.service || 'unknown',
                        endpoint: config.url || config.endpoint || 'unknown',
                        error: error.message,
                        attempt
                    });

                    // Exponential backoff
                    await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
                } else {
                    this.logger.error('Service call failed after all retries', {
                        service: config.service || 'unknown',
                        endpoint: config.url || config.endpoint || 'unknown',
                        error: error.message,
                        attempts: this.maxRetries,
                        duration
                    });
                }
            }
        }

        throw lastError;
    }

    async get(url, config = {}) {
        return this.request({
            method: 'GET',
            url,
            ...config
        });
    }

    async post(url, data, config = {}) {
        return this.request({
            method: 'POST',
            url,
            data,
            ...config
        });
    }

    async put(url, data, config = {}) {
        return this.request({
            method: 'PUT',
            url,
            data,
            ...config
        });
    }

    async delete(url, config = {}) {
        return this.request({
            method: 'DELETE',
            url,
            ...config
        });
    }

    async patch(url, data, config = {}) {
        return this.request({
            method: 'PATCH',
            url,
            data,
            ...config
        });
    }

    // Health check helper
    async healthCheck(url, timeout = 5000) {
        try {
            const response = await this.get(url, { timeout });
            return {
                status: 'healthy',
                responseTime: response.headers['x-response-time'] || 'N/A',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Batch requests helper
    async batchRequests(requests, concurrency = 5) {
        const results = [];
        const chunks = this.chunkArray(requests, concurrency);

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(async (request) => {
                try {
                    const response = await this.request(request);
                    return { success: true, data: response.data };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });

            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
        }

        return results;
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Circuit breaker pattern (basic implementation)
    constructor(serviceName, logger) {
        this.serviceName = serviceName;
        this.logger = logger || new Logger(serviceName);
        this.defaultTimeout = 10000;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.failureThreshold = 5;
        this.recoveryTimeout = 60000; // 1 minute
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async requestWithCircuitBreaker(config) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
                this.logger.info('Circuit breaker transitioning to HALF_OPEN');
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const response = await this.request(config);

            if (this.state === 'HALF_OPEN') {
                this.state = 'CLOSED';
                this.failures = 0;
                this.logger.info('Circuit breaker reset to CLOSED');
            }

            return response;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();

            if (this.failures >= this.failureThreshold) {
                this.state = 'OPEN';
                this.logger.warn('Circuit breaker opened due to failures', {
                    failures: this.failures,
                    threshold: this.failureThreshold
                });
            }

            throw error;
        }
    }
}

module.exports = ServiceClient;
