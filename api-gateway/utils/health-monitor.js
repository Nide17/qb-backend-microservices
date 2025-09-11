const os = require('os');
const axios = require('axios');

/**
 * Health Monitoring and Metrics Collection
 * Provides comprehensive health checks and performance metrics
 */

class HealthMonitor {
    constructor() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTime: [],
            memoryUsage: [],
            cpuUsage: [],
            uptime: Date.now()
        };
        this.healthChecks = new Map();
        this.alerts = [];
        this.thresholds = {
            responseTime: 5000, // 5 seconds
            memoryUsage: 0.9, // 90%
            cpuUsage: 0.8, // 80%
            errorRate: 0.1 // 10%
        };
    }

    /**
     * Record request metrics
     */
    recordRequest(responseTime, isError = false) {
        this.metrics.requests++;
        if (isError) this.metrics.errors++;
        
        this.metrics.responseTime.push({
            time: responseTime,
            timestamp: Date.now()
        });

        // Keep only last 1000 entries
        if (this.metrics.responseTime.length > 1000) {
            this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
        }

        // Check thresholds
        this.checkThresholds();
    }

    /**
     * Get system metrics
     */
    getSystemMetrics() {
        const memUsage = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        const cpuUsage = process.cpuUsage();
        const loadAvg = os.loadavg();

        const systemMetrics = {
            memory: {
                used: memUsage.heapUsed,
                total: memUsage.heapTotal,
                external: memUsage.external,
                systemUsed: usedMem,
                systemTotal: totalMem,
                systemFree: freeMem,
                usagePercent: (usedMem / totalMem) * 100
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system,
                loadAverage: loadAvg,
                cores: os.cpus().length
            },
            uptime: {
                process: process.uptime(),
                system: os.uptime()
            },
            platform: {
                type: os.type(),
                platform: os.platform(),
                arch: os.arch(),
                release: os.release()
            }
        };

        // Store metrics for trending
        this.metrics.memoryUsage.push({
            usage: systemMetrics.memory.usagePercent,
            timestamp: Date.now()
        });

        this.metrics.cpuUsage.push({
            usage: loadAvg[0],
            timestamp: Date.now()
        });

        // Keep only last 100 entries
        if (this.metrics.memoryUsage.length > 100) {
            this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
        }
        if (this.metrics.cpuUsage.length > 100) {
            this.metrics.cpuUsage = this.metrics.cpuUsage.slice(-100);
        }

        return systemMetrics;
    }

    /**
     * Check service health
     */
    async checkServiceHealth(serviceName, url, timeout = 5000) {
        const startTime = Date.now();
        
        try {
            const response = await axios.get(`${url}/health`, { 
                timeout,
                validateStatus: (status) => status < 500
            });
            
            const responseTime = Date.now() - startTime;
            const isHealthy = response.status === 200;
            
            const healthStatus = {
                service: serviceName,
                status: isHealthy ? 'healthy' : 'degraded',
                responseTime,
                timestamp: Date.now(),
                details: response.data || null,
                error: null
            };

            this.healthChecks.set(serviceName, healthStatus);
            return healthStatus;
            
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const healthStatus = {
                service: serviceName,
                status: 'unhealthy',
                responseTime,
                timestamp: Date.now(),
                details: null,
                error: error.message
            };

            this.healthChecks.set(serviceName, healthStatus);
            return healthStatus;
        }
    }

    /**
     * Check database connectivity
     */
    async checkDatabaseHealth(mongoose) {
        try {
            const state = mongoose.connection.readyState;
            const states = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };

            const dbHealth = {
                status: state === 1 ? 'healthy' : 'unhealthy',
                state: states[state],
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                timestamp: Date.now()
            };

            if (state === 1) {
                // Test with a simple query
                const startTime = Date.now();
                await mongoose.connection.db.admin().ping();
                dbHealth.responseTime = Date.now() - startTime;
            }

            return dbHealth;
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Get comprehensive health report
     */
    async getHealthReport(services = [], mongoose = null) {
        const systemMetrics = this.getSystemMetrics();
        const serviceChecks = [];

        // Check all registered services
        for (const [name, url] of Object.entries(services)) {
            const health = await this.checkServiceHealth(name, url);
            serviceChecks.push(health);
        }

        // Check database if provided
        let databaseHealth = null;
        if (mongoose) {
            databaseHealth = await this.checkDatabaseHealth(mongoose);
        }

        // Calculate overall status
        const unhealthyServices = serviceChecks.filter(s => s.status === 'unhealthy').length;
        const degradedServices = serviceChecks.filter(s => s.status === 'degraded').length;
        
        let overallStatus = 'healthy';
        if (unhealthyServices > 0) {
            overallStatus = 'unhealthy';
        } else if (degradedServices > 0 || (databaseHealth && databaseHealth.status === 'unhealthy')) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            timestamp: Date.now(),
            uptime: Date.now() - this.metrics.uptime,
            system: systemMetrics,
            database: databaseHealth,
            services: serviceChecks,
            metrics: this.getMetricsSummary(),
            alerts: this.alerts.slice(-10) // Last 10 alerts
        };
    }

    /**
     * Get metrics summary
     */
    getMetricsSummary() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Filter recent metrics
        const recentResponseTimes = this.metrics.responseTime.filter(r => r.timestamp > oneHourAgo);
        const recentMemory = this.metrics.memoryUsage.filter(m => m.timestamp > oneHourAgo);
        const recentCpu = this.metrics.cpuUsage.filter(c => c.timestamp > oneHourAgo);

        const avgResponseTime = recentResponseTimes.length > 0 
            ? recentResponseTimes.reduce((sum, r) => sum + r.time, 0) / recentResponseTimes.length 
            : 0;

        const avgMemoryUsage = recentMemory.length > 0
            ? recentMemory.reduce((sum, m) => sum + m.usage, 0) / recentMemory.length
            : 0;

        const avgCpuUsage = recentCpu.length > 0
            ? recentCpu.reduce((sum, c) => sum + c.usage, 0) / recentCpu.length
            : 0;

        const errorRate = this.metrics.requests > 0 ? this.metrics.errors / this.metrics.requests : 0;

        return {
            totalRequests: this.metrics.requests,
            totalErrors: this.metrics.errors,
            errorRate,
            averageResponseTime: Math.round(avgResponseTime),
            averageMemoryUsage: Math.round(avgMemoryUsage * 100) / 100,
            averageCpuUsage: Math.round(avgCpuUsage * 100) / 100,
            period: 'last 1 hour'
        };
    }

    /**
     * Check thresholds and create alerts
     */
    checkThresholds() {
        const metrics = this.getMetricsSummary();
        const alerts = [];

        if (metrics.averageResponseTime > this.thresholds.responseTime) {
            alerts.push({
                type: 'warning',
                message: `High response time: ${metrics.averageResponseTime}ms`,
                threshold: this.thresholds.responseTime,
                timestamp: Date.now()
            });
        }

        if (metrics.averageMemoryUsage > this.thresholds.memoryUsage * 100) {
            alerts.push({
                type: 'critical',
                message: `High memory usage: ${metrics.averageMemoryUsage}%`,
                threshold: this.thresholds.memoryUsage * 100,
                timestamp: Date.now()
            });
        }

        if (metrics.averageCpuUsage > this.thresholds.cpuUsage) {
            alerts.push({
                type: 'warning',
                message: `High CPU usage: ${metrics.averageCpuUsage}`,
                threshold: this.thresholds.cpuUsage,
                timestamp: Date.now()
            });
        }

        if (metrics.errorRate > this.thresholds.errorRate) {
            alerts.push({
                type: 'critical',
                message: `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
                threshold: this.thresholds.errorRate * 100,
                timestamp: Date.now()
            });
        }

        // Add new alerts
        this.alerts.push(...alerts);

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }

        return alerts;
    }

    /**
     * Express middleware for automatic metrics collection
     */
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();

            // Override res.end to capture response time
            const originalEnd = res.end;
            res.end = (...args) => {
                const responseTime = Date.now() - startTime;
                const isError = res.statusCode >= 400;
                this.recordRequest(responseTime, isError);
                originalEnd.apply(res, args);
            };

            next();
        };
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTime: [],
            memoryUsage: [],
            cpuUsage: [],
            uptime: Date.now()
        };
        this.alerts = [];
    }
}

module.exports = HealthMonitor;
