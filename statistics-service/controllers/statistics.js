const { handleError } = require('../utils/error');
const os = require('os');
const process = require('process');
const axios = require('axios');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

// Cache for frequently accessed statistics
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for statistics

// Helper function to make API calls without authentication (for internal service calls)
const makeInternalRequest = async (url, options = {}) => {
    const requestOptions = {
        ...options,
        headers: {
            ...options.headers,
            'x-internal-service': 'statistics-service', // Internal service identifier
            'Content-Type': 'application/json'
        },
    };
    
    try {
        return await axios.get(url, requestOptions);
    } catch (error) {
        console.log(`Request error to ${url}: ${error}`);
        
        // Return a structured error response instead of throwing
        return {
            data: null,
            error: true,
            message: error.message,
            status: error.response?.status || 500
        };
    }
};

// Helper function to get cached data
const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

// Helper function to set cached data
const setCachedData = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Clear expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp >= CACHE_TTL) {
            cache.delete(key);
        }
    }
}, CACHE_TTL);

// Enhanced system performance monitoring
exports.getSystemMetrics = async (req, res) => {
    const cacheKey = 'system_metrics';
    
    try {
        let metrics = getCachedData(cacheKey);
        
        if (!metrics) {
            // Get system information
            const cpuUsage = process.cpuUsage();
            const memoryUsage = process.memoryUsage();
            const systemInfo = {
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                uptime: os.uptime(),
                loadAverage: os.loadavg()
            };

            // Get service health status - Monitor all services
            const services = [
                { name: 'users-service', port: 5001 },
                { name: 'quizzing-service', port: 5002 }, 
                { name: 'posts-service', port: 5003 },
                { name: 'schools-service', port: 5004 },
                { name: 'courses-service', port: 5005 },
                { name: 'scores-service', port: 5006 },
                { name: 'downloads-service', port: 5007 },
                { name: 'contacts-service', port: 5008 },
                { name: 'feedbacks-service', port: 5009 },
                { name: 'comments-service', port: 5010 },
                { name: 'statistics-service', port: 5011 }
            ];
            const serviceHealthChecks = await Promise.allSettled(
                services.map(service => 
                    axios.get(`http://localhost:${service.port}/health`, { timeout: 20000 })
                )
            );

            const serviceHealth = serviceHealthChecks.map((result, index) => ({
                service: services[index].name,
                status: result.status === 'fulfilled' && result.value.data.status === 'healthy' ? 'healthy' : 'unhealthy',
                uptime: result.status === 'fulfilled' && result.value.data ? result.value.data.uptime || 0 : 0
            }));

            metrics = {
                timestamp: new Date().toISOString(),
                system: {
                    ...systemInfo,
                    memoryUsagePercent: ((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory * 100).toFixed(2),
                    process: {
                        pid: process.pid,
                        uptime: process.uptime(),
                        memoryUsage: {
                            rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
                            heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
                            heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
                            external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB'
                        },
                        cpuUsage: {
                            user: cpuUsage.user,
                            system: cpuUsage.system
                        }
                    }
                },
                services: serviceHealth
            };
            
            setCachedData(cacheKey, metrics);
        }

        res.json(metrics);
    } catch (error) {
        console.log('Error retrieving system metrics:', error);
        handleError(res, error);
    }
};

// MongoDB database metrics
exports.getDatabaseMetrics = async (req, res) => {
    const cacheKey = 'database_metrics';
    
    try {
        let dbMetrics = getCachedData(cacheKey);
        
        if (!dbMetrics) {
            // Get database statistics from each service
            const services = [
                { name: 'users', endpoint: '/api/users/db-stats' },
                { name: 'posts', endpoint: '/api/posts/db-stats' },
                { name: 'quizzes', endpoint: '/api/quizzes/db-stats' },
                { name: 'scores', endpoint: '/api/scores/db-stats' },
                { name: 'downloads', endpoint: '/api/downloads/db-stats' },
                { name: 'schools', endpoint: '/api/schools/db-stats' },
                { name: 'courses', endpoint: '/api/courses/db-stats' },
                { name: 'contacts', endpoint: '/api/contacts/db-stats' },
                { name: 'feedbacks', endpoint: '/api/feedbacks/db-stats' },
                { name: 'comments', endpoint: '/api/comments/db-stats' },
                { name: 'statistics', endpoint: '/api/statistics/db-stats' }
            ];

            const dbStatsPromises = services.map(service =>
                axios.get(`${API_GATEWAY_URL}${service.endpoint}`, { timeout: 5000 })
                    .then(response => ({
                        service: service.name,
                        status: 'success',
                        data: response.data
                    }))
                    .catch(error => ({
                        service: service.name,
                        status: 'error',
                        error: error.message,
                        data: null
                    }))
            );

            const dbStatsResults = await Promise.all(dbStatsPromises);
            
            // Calculate total database usage
            let totalDocuments = 0;
            let totalDataSize = 0;
            let totalIndexSize = 0;
            let totalStorageSize = 0;

            const serviceStats = dbStatsResults.map(result => {
                if (result.status === 'success' && result.data) {
                    totalDocuments += result.data.documents || 0;
                    totalDataSize += result.data.dataSize || 0;
                    totalIndexSize += result.data.indexSize || 0;
                    totalStorageSize += result.data.storageSize || 0;
                }
                return result;
            });

            dbMetrics = {
                timestamp: new Date().toISOString(),
                overview: {
                    totalDocuments,
                    totalDataSize: (totalDataSize / 1024 / 1024).toFixed(2) + ' MB',
                    totalIndexSize: (totalIndexSize / 1024 / 1024).toFixed(2) + ' MB',
                    totalStorageSize: (totalStorageSize / 1024 / 1024).toFixed(2) + ' MB'
                },
                services: serviceStats
            };
            
            setCachedData(cacheKey, dbMetrics);
        }

        res.json(dbMetrics);
    } catch (error) {
        console.log('Error retrieving database metrics:', error);
        handleError(res, error);
    }
};

// Performance analytics endpoint
exports.getPerformanceMetrics = async (req, res) => {
    const cacheKey = 'performance_metrics';
    
    try {
        let perfMetrics = getCachedData(cacheKey);
        
        if (!perfMetrics) {
            const now = new Date();
            const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Get performance data from different services
            const [usersData, scoresData, quizzesData, downloadsData, postsData, schoolsData, coursesData, contactsData, feedbacksData, commentsData] = await Promise.allSettled([
                axios.get(`${API_GATEWAY_URL}/api/users`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/scores`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/quizzes`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/downloads`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/posts`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/schools`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/courses`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/contacts`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/feedbacks`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/comments`, {
                    params: { 
                        date_from: last24Hours.toISOString(),
                        performance_metrics: true 
                    },
                    timeout: 5000
                })
            ]);

            // Calculate API response times and throughput
            const apiMetrics = {
                users: usersData.status === 'fulfilled' ? {
                    responseTime: usersData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: usersData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },
                
                scores: scoresData.status === 'fulfilled' ? {
                    responseTime: scoresData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: scoresData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },
                
                quizzes: quizzesData.status === 'fulfilled' ? {
                    responseTime: quizzesData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: quizzesData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },
                
                downloads: downloadsData.status === 'fulfilled' ? {
                    responseTime: downloadsData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: downloadsData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },

                posts: postsData.status === 'fulfilled' ? {
                    responseTime: postsData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: postsData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },

                schools: schoolsData.status === 'fulfilled' ? {
                    responseTime: schoolsData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: schoolsData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },

                courses: coursesData.status === 'fulfilled' ? {
                    responseTime: coursesData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: coursesData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },

                contacts: contactsData.status === 'fulfilled' ? {
                    responseTime: contactsData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: contactsData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },

                feedbacks: feedbacksData.status === 'fulfilled' ? {
                    responseTime: feedbacksData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: feedbacksData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' },

                comments: commentsData.status === 'fulfilled' ? {
                    responseTime: commentsData.value.headers['x-response-time'] || 'N/A',
                    totalRequests: commentsData.value.data.length || 0,
                    status: 'healthy'
                } : { responseTime: 'N/A', totalRequests: 0, status: 'unhealthy' }
            };

            perfMetrics = {
                timestamp: now.toISOString(),
                period: '24h',
                apiMetrics,
                summary: {
                    totalApiCalls: Object.values(apiMetrics).reduce((sum, metric) => sum + metric.totalRequests, 0),
                    healthyServices: Object.values(apiMetrics).filter(metric => metric.status === 'healthy').length,
                    totalServices: Object.keys(apiMetrics).length
                }
            };
            
            setCachedData(cacheKey, perfMetrics);
        }

        res.json(perfMetrics);
    } catch (error) {
        console.log('Error retrieving performance metrics:', error);
        handleError(res, error);
    }
};

// Aggregated dashboard statistics endpoint
exports.getDashboardStats = async (req, res) => {
    const cacheKey = 'dashboard_stats';
    
    try {
        let stats = getCachedData(cacheKey);
        
        if (!stats) {
            // Get service health first
            const serviceHealth = await checkAllServicesHealth();
            
            // Get actual data from working endpoints and count them through API Gateway
            const [usersResponse, scoresResponse, quizzesResponse, downloadsResponse] = await Promise.allSettled([
                makeInternalRequest(`${API_GATEWAY_URL}/api/users`),
                makeInternalRequest(`${API_GATEWAY_URL}/api/scores`),
                makeInternalRequest(`${API_GATEWAY_URL}/api/quizzes`),
                makeInternalRequest(`${API_GATEWAY_URL}/api/downloads`)
            ]);

            // Handle users count with graceful fallback
            let totalUsers = 0;
            let usersError = false;
            if (usersResponse.status === 'fulfilled' && 
                usersResponse.value && 
                !usersResponse.value.error &&
                usersResponse.value.data && 
                Array.isArray(usersResponse.value.data)) {
                totalUsers = usersResponse.value.data.length;
            } else {
                console.log('Users service unavailable, returning 0');
                usersError = true;
            }

            // Handle scores count with graceful fallback
            let totalScores = 0;
            let scoresError = false;
            if (scoresResponse.status === 'fulfilled' && 
                scoresResponse.value && 
                !scoresResponse.value.error &&
                scoresResponse.value.data) {
                if (scoresResponse.value.data.scores && Array.isArray(scoresResponse.value.data.scores)) {
                    totalScores = scoresResponse.value.data.scores.length;
                } else if (Array.isArray(scoresResponse.value.data)) {
                    totalScores = scoresResponse.value.data.length;
                }
            } else {
                console.log('Getting Dashboard Stats failed, Scores service unavailable, returning 0');
                scoresError = true;
            }

            // Handle quizzes count with graceful fallback
            let totalQuizzes = 0;
            let quizzesError = false;
            if (quizzesResponse.status === 'fulfilled' && 
                quizzesResponse.value && 
                !quizzesResponse.value.error &&
                quizzesResponse.value.data && 
                Array.isArray(quizzesResponse.value.data)) {
                totalQuizzes = quizzesResponse.value.data.length;
            } else {
                console.log('Quizzes service unavailable, returning 0');
                quizzesError = true;
            }

            // Handle downloads count with graceful fallback
            let totalDownloads = 0;
            let downloadsError = false;
            if (downloadsResponse.status === 'fulfilled' && 
                downloadsResponse.value && 
                !downloadsResponse.value.error &&
                downloadsResponse.value.data) {
                if (Array.isArray(downloadsResponse.value.data)) {
                    totalDownloads = downloadsResponse.value.data.length;
                } else if (downloadsResponse.value.data.downloads && Array.isArray(downloadsResponse.value.data.downloads)) {
                    totalDownloads = downloadsResponse.value.data.downloads.length;
                }
            } else {
                console.log('Downloads service unavailable, returning 0\n');
                downloadsError = true;
            }

            stats = {
                totalUsers,
                totalScores,
                totalQuizzes,
                totalDownloads,
                serviceHealth,
                lastUpdated: new Date().toISOString(),
                errors: {
                    usersError,
                    scoresError,
                    quizzesError,
                    downloadsError
                }
            };
            
            setCachedData(cacheKey, stats);
        }

        res.json(stats);
    } catch (error) {
        console.log('Error retrieving dashboard stats:', error);
        handleError(res, error);
    }
};

// Real-time statistics update endpoint
exports.updateDashboardStats = async (req, res) => {
    try {
        // Clear dashboard cache to force refresh
        cache.delete('dashboard_stats');
        
        // Emit real-time update if socket.io is available
        if (req.io) {
            const stats = await this.getDashboardStats({ query: {} }, { json: (data) => data });
            req.io.emit('dashboard-stats-update', {
                type: 'refresh',
                data: stats
            });
        }
        
        res.json({ message: 'Dashboard stats updated successfully' });
    } catch (error) {
        handleError(res, error);
    }
};

exports.get50NewUsers = async (req, res) => {
    const cacheKey = 'new_users_50';
    
    try {
        let users = getCachedData(cacheKey);
        
        if (!users) {
            const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
                params: {
                    limit: 50,
                    sort: '-register_date'
                }
            });
            
            // Check if the request failed
            if (response.error) {
                console.log('Users service unavailable:', response.message);
                return res.status(503).json({
                    success: false,
                    message: 'Users temporarily unavailable',
                    users: [],
                    error: true,
                    details: response.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            users = response.data;
            if (!users || !Array.isArray(users)) {
                return res.status(503).json({
                    success: false,
                    message: 'No users found or service error',
                    users: [],
                    error: true,
                    timestamp: new Date().toISOString()
                });
            }
            
            setCachedData(cacheKey, users);
        }

        res.status(200).json(users);
    } catch (err) {
        console.log('Unexpected error in get50NewUsers:', err.message);
        res.status(503).json({
            success: false,
            message: 'Users temporarily unavailable',
            users: [],
            error: true,
            details: 'Unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`);
        
        // Check if the request failed
        if (response.error) {
            console.log('Users service unavailable:', response.message);
            return res.status(503).json({
                success: false,
                message: 'Users temporarily unavailable',
                users: [],
                error: true,
                details: response.message,
                timestamp: new Date().toISOString()
            });
        }
        
        const users = response.data;
        if (!users) {
            return res.status(503).json({
                success: false,
                message: 'No users found or service error',
                users: [],
                error: true,
                timestamp: new Date().toISOString()
            });
        }

        res.status(200).json(users);
    } catch (err) {
        console.log('Unexpected error in getAllUsers:', err.message);
        res.status(503).json({
            success: false,
            message: 'Users temporarily unavailable',
            users: [],
            error: true,
            details: 'Unexpected error occurred',
            timestamp: new Date().toISOString()
        });
    }
};

exports.getUsersWithImage = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'image'
            }
        });
        
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that image' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithSchool = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'school'
            }
        });
        
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that school' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithLevel = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'level'
            }
        });
        
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that level' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithFaculty = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'faculty'
            }
        });
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that faculty' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithYear = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'year'
            }
        });
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that year' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithInterests = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'interests'
            }
        });
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that interest' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithAbout = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'about'
            }
        });
        const users = response.data;

        if (!users) return res.status(404).json({ message: 'No users found with that about' });

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop100Quizzing = async (req, res) => {
    const cacheKey = 'top_100_quizzing';
    
    try {
        let quizStats = getCachedData(cacheKey);
        
        if (!quizStats) {
            
            const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/scores/ranking`);
            
            // Check if the request failed
            if (response.error) {
                console.log('\n\nGetting Top 100 Quizzing failed, Scores service unavailable:', response.message);
                return res.status(503).json({
                    success: false,
                    message: 'Quiz ranking temporarily unavailable',
                    rankings: [],
                    error: true,
                    details: response.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            quizStats = response.data;
            if (quizStats) {
                setCachedData(cacheKey, quizStats);
                console.log('✅ Successfully fetched and cached quiz ranking statistics');
            }
        } else {
            console.log('📦 Returning cached quiz ranking statistics');
        }

        res.json(quizStats || { rankings: [], message: 'No ranking data available', error: true });
    } catch (err) {
        console.error('💥 Error in getTop100Quizzing:', err.message);
        
        // Return graceful error response
        res.status(503).json({
            success: false,
            message: 'Quiz ranking temporarily unavailable',
            rankings: [],
            error: true,
            details: 'Unable to fetch quiz ranking statistics',
            timestamp: new Date().toISOString()
        });
    }
};

exports.getTop100Downloaders = async (req, res) => {
    const cacheKey = 'top_100_downloaders';
    
    try {
        let downloadStats = getCachedData(cacheKey);
        
        if (!downloadStats) {
            console.log('📊 Fetching download statistics...');
            
            const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/downloads`);
            
            downloadStats = response.data;
            setCachedData(cacheKey, downloadStats);
            console.log('✅ Successfully fetched and cached download statistics');
        } else {
            console.log('📦 Returning cached download statistics');
        }

        res.json(downloadStats);
    } catch (err) {
        console.error('💥 Error in getTop100Downloaders:', err.message);
        handleError(res, err);
    }
};

exports.getTop20Quizzes = async (req, res) => {
    const cacheKey = 'top_20_quizzes';
    
    try {
        let quizStatistics = getCachedData(cacheKey);
        
        if (!quizStatistics) {
            console.log('📊 Fetching popular quiz statistics...');
            
            const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/scores/popular-quizes`);
            
            quizStatistics = response.data;
            setCachedData(cacheKey, quizStatistics);
            console.log('✅ Successfully fetched popular quiz statistics');
        }

        res.json(quizStatistics);
    } catch (err) {
        console.error('💥 Error in getTop20Quizzes:', err.message);
        res.status(503).json({
            success: false,
            message: 'Popular quiz statistics temporarily unavailable',
            quizzes: [],
            error: true,
            timestamp: new Date().toISOString()
        });
    }
};

exports.getQuizzesStats = async (req, res) => {
    try {
        console.log('📊 Fetching quiz database statistics...');
        
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/scores/db-stats`);
        
        console.log('✅ Successfully fetched quiz database statistics');
        res.json(response.data);
    } catch (err) {
        console.error('💥 Error in getQuizzesStats:', err.message);
        res.status(503).json({
            success: false,
            totalQuizzes: 0,
            message: "Quiz temporarily unavailable",
            error: true,
            timestamp: new Date().toISOString()
        });
    }
};

exports.getTop20Notes = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/top20notes`);
        const notesStats = response.data;

        res.json(notesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getNotesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/notesStats`);
        const notesStats = response.data;

        res.json(notesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizCategoriesStats = async (req, res) => {
    try {
        // Use popular-quizes endpoint as fallback for categories stats
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/popular-quizes`);
        const categoriesStats = response.data;

        res.json(categoriesStats);
    } catch (err) {
        // Provide fallback data
        res.json({
            categories: [],
            message: "Quiz categories temporarily unavailable"
        });
    }
};

exports.getNotesCategoriesStats = async (req, res) => {
    try {
        const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/downloads/notesCategoriesStats`);
        const categoriesStats = response.data;

        res.json(categoriesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getDailyUserRegistration = async (req, res) => {
    const cacheKey = 'daily_user_registration';
    
    try {
        let usersStats = getCachedData(cacheKey);
        
        if (!usersStats) {
            const response = await makeInternalRequest(`${API_GATEWAY_URL}/api/users/daily-user-registration`);
            usersStats = response.data;
            setCachedData(cacheKey, usersStats);
        }

        res.json(usersStats);
    } catch (err) {
        handleError(res, err);
    }
};

// Real-time analytics endpoint
exports.getLiveAnalytics = async (req, res) => {
    const cacheKey = 'live_analytics';
    
    try {
        let analytics = getCachedData(cacheKey);
        
        if (!analytics) {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Get today's statistics
            const [todayUsers, todayScores, todayQuizzes] = await Promise.allSettled([
                makeInternalRequest(`${API_GATEWAY_URL}/api/users`, {
                    params: { date_from: startOfDay.toISOString() }
                }),
                makeInternalRequest(`${API_GATEWAY_URL}/api/scores`, {
                    params: { date_from: startOfDay.toISOString() }
                }),
                makeInternalRequest(`${API_GATEWAY_URL}/api/quizzes`, {
                    params: { date_from: startOfDay.toISOString() }
                })
            ]);
            
            analytics = {
                today: {
                    newUsers: todayUsers.status === 'fulfilled' ? todayUsers.value.data.length || 0 : 0,
                    newScores: todayScores.status === 'fulfilled' ? todayScores.value.data.length || 0 : 0,
                    newQuizzes: todayQuizzes.status === 'fulfilled' ? todayQuizzes.value.data.length || 0 : 0
                },
                timestamp: now.toISOString()
            };
            
            setCachedData(cacheKey, analytics);
        }
        
        res.json(analytics);
    } catch (error) {
        console.log('Error retrieving live analytics:', error);
        handleError(res, error);
    }
};

// Helper function to check health of all services
const checkAllServicesHealth = async () => {
    const services = [
        { name: 'users-service', url: 'http://qb-users-service-local:5001/health' },
        { name: 'quizzing-service', url: 'http://qb-quizzing-service-local:5002/health' }, 
        { name: 'posts-service', url: 'http://qb-posts-service-local:5003/health' },
        { name: 'schools-service', url: 'http://qb-schools-service-local:5004/health' },
        { name: 'courses-service', url: 'http://qb-courses-service-local:5005/health' },
        { name: 'scores-service', url: 'http://qb-scores-service-local:5006/health' },
        { name: 'downloads-service', url: 'http://qb-downloads-service-local:5007/health' },
        { name: 'contacts-service', url: 'http://qb-contacts-service-local:5008/health' },
        { name: 'feedbacks-service', url: 'http://qb-feedbacks-service-local:5009/health' },
        { name: 'comments-service', url: 'http://qb-comments-service-local:5010/health' },
        { name: 'statistics-service', url: 'http://localhost:5011/health' }
    ];
    
    const serviceHealthChecks = await Promise.allSettled(
        services.map(service => 
            axios.get(service.url, { timeout: 3000 })
        )
    );

    const serviceHealth = serviceHealthChecks.map((result, index) => ({
        service: services[index].name,
        status: result.status === 'fulfilled' && result.value.data.status === 'healthy' ? 'healthy' : 'unhealthy',
        uptime: result.status === 'fulfilled' && result.value.data ? result.value.data.uptime || 0 : 0,
        responseTime: result.status === 'fulfilled' && result.value.data ? result.value.data.responseTime : null,
        database: result.status === 'fulfilled' && result.value.data ? result.value.data.database : 'unknown'
    }));

    return {
        total: services.length,
        healthy: serviceHealth.filter(s => s.status === 'healthy').length,
        unhealthy: serviceHealth.filter(s => s.status === 'unhealthy').length,
        services: serviceHealth
    };
};

// Clear cache endpoint for admin use
exports.clearStatsCache = async (req, res) => {
    try {
        cache.clear();
        res.json({ message: 'Statistics cache cleared successfully' });
    } catch (error) {
        handleError(res, error);
    }
};
