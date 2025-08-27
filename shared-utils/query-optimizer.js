const mongoose = require('mongoose');

/**
 * Database Query Optimization Utilities
 * Provides common patterns and optimizations for MongoDB queries
 */

class QueryOptimizer {
    constructor() {
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Create optimized pagination query
     */
    createPaginationQuery(page = 1, limit = 20, sortField = 'createdAt', sortOrder = -1) {
        const skip = (page - 1) * limit;
        return {
            skip,
            limit: Math.min(limit, 100), // Cap at 100 items per page
            sort: { [sortField]: sortOrder }
        };
    }

    /**
     * Create aggregation pipeline for efficient counting with filters
     */
    createCountPipeline(matchStage = {}) {
        return [
            { $match: matchStage },
            { $count: "total" }
        ];
    }

    /**
     * Create lookup pipeline for efficient joins
     */
    createLookupPipeline(from, localField, foreignField, as, project = null) {
        const pipeline = [
            {
                $lookup: {
                    from,
                    localField,
                    foreignField,
                    as
                }
            }
        ];

        if (project) {
            pipeline.push({ $project: project });
        }

        return pipeline;
    }

    /**
     * Optimize text search queries
     */
    createTextSearchQuery(searchTerm, fields = []) {
        if (!searchTerm) return {};

        if (fields.length > 0) {
            // Field-specific search
            const orConditions = fields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' }
            }));
            return { $or: orConditions };
        } else {
            // Full text search
            return { $text: { $search: searchTerm } };
        }
    }

    /**
     * Create date range query
     */
    createDateRangeQuery(field, startDate, endDate) {
        const query = {};
        if (startDate || endDate) {
            query[field] = {};
            if (startDate) query[field].$gte = new Date(startDate);
            if (endDate) query[field].$lte = new Date(endDate);
        }
        return query;
    }

    /**
     * Batch operations for better performance
     */
    async batchInsert(Model, documents, batchSize = 1000) {
        const results = [];
        for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            const result = await Model.insertMany(batch, { ordered: false });
            results.push(...result);
        }
        return results;
    }

    /**
     * Efficient bulk update operations
     */
    async batchUpdate(Model, updates) {
        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: update.filter,
                update: update.update,
                upsert: update.upsert || false
            }
        }));

        return await Model.bulkWrite(bulkOps);
    }

    /**
     * Create efficient aggregation for statistics
     */
    createStatsAggregation(groupBy, countField = '_id', additionalStages = []) {
        return [
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 },
                    ...(countField !== '_id' && { [countField]: { $sum: `$${countField}` } })
                }
            },
            { $sort: { count: -1 } },
            ...additionalStages
        ];
    }

    /**
     * Memory-efficient cursor iteration
     */
    async processLargeCollection(Model, query, processor, batchSize = 1000) {
        const cursor = Model.find(query).cursor({ batchSize });
        let processed = 0;

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            await processor(doc);
            processed++;

            if (processed % batchSize === 0) {
                console.log(`Processed ${processed} documents`);
            }
        }

        return processed;
    }

    /**
     * Query result caching
     */
    getCachedResult(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCachedResult(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Index recommendations based on query patterns
     */
    getIndexRecommendations(queries) {
        const recommendations = new Set();

        queries.forEach(query => {
            // Recommend indexes for frequently queried fields
            Object.keys(query.filter || {}).forEach(field => {
                recommendations.add(`{ "${field}": 1 }`);
            });

            // Recommend compound indexes for sort + filter
            if (query.sort && query.filter) {
                const sortField = Object.keys(query.sort)[0];
                const filterFields = Object.keys(query.filter);
                filterFields.forEach(filterField => {
                    recommendations.add(`{ "${filterField}": 1, "${sortField}": ${query.sort[sortField]} }`);
                });
            }
        });

        return Array.from(recommendations);
    }

    /**
     * Performance monitoring for queries
     */
    async monitorQuery(Model, query, operation = 'find') {
        const startTime = Date.now();
        let result;

        try {
            switch (operation) {
                case 'find':
                    result = await Model.find(query).explain('executionStats');
                    break;
                case 'aggregate':
                    result = await Model.aggregate(query).explain('executionStats');
                    break;
                default:
                    throw new Error(`Unsupported operation: ${operation}`);
            }

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            return {
                executionTime,
                stats: result.executionStats,
                recommendations: this.analyzePerformance(result.executionStats)
            };
        } catch (error) {
            console.error('Query monitoring error:', error);
            return null;
        }
    }

    /**
     * Analyze query performance and provide recommendations
     */
    analyzePerformance(stats) {
        const recommendations = [];

        if (stats.totalDocsExamined > stats.totalDocsReturned * 10) {
            recommendations.push('Consider adding an index to reduce document examination');
        }

        if (stats.executionTimeMillis > 1000) {
            recommendations.push('Query is slow, consider optimization or indexing');
        }

        if (stats.stage === 'COLLSCAN') {
            recommendations.push('Collection scan detected, add appropriate index');
        }

        return recommendations;
    }

    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp >= this.CACHE_TTL) {
                this.cache.delete(key);
            }
        }
    }
}

// Singleton instance
const queryOptimizer = new QueryOptimizer();

// Clean up cache periodically
setInterval(() => {
    queryOptimizer.cleanupCache();
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = queryOptimizer;
