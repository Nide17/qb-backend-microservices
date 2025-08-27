const axios = require('axios');
const { handleError } = require('../utils/error');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

// Cache for frequently accessed statistics
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for statistics

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

// Aggregated dashboard statistics endpoint
exports.getDashboardStats = async (req, res) => {
    const cacheKey = 'dashboard_stats';
    
    try {
        let stats = getCachedData(cacheKey);
        
        if (!stats) {
            // Parallel requests for better performance
            const [usersResponse, scoresResponse, quizzesResponse, downloadsResponse] = await Promise.allSettled([
                axios.get(`${API_GATEWAY_URL}/api/users`, { timeout: 5000 }),
                axios.get(`${API_GATEWAY_URL}/api/scores`, { timeout: 5000 }),
                axios.get(`${API_GATEWAY_URL}/api/quizzes`, { timeout: 5000 }),
                axios.get(`${API_GATEWAY_URL}/api/downloads`, { timeout: 5000 })
            ]);

            stats = {
                totalUsers: usersResponse.status === 'fulfilled' ? usersResponse.value.data.length || 0 : 0,
                totalScores: scoresResponse.status === 'fulfilled' ? scoresResponse.value.data.length || 0 : 0,
                totalQuizzes: quizzesResponse.status === 'fulfilled' ? quizzesResponse.value.data.length || 0 : 0,
                totalDownloads: downloadsResponse.status === 'fulfilled' ? downloadsResponse.value.data.length || 0 : 0,
                lastUpdated: new Date().toISOString()
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
            const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
                params: {
                    limit: 50,
                    sort: '-register_date'
                },
                timeout: 5000
            });
            users = response.data;

            if (!users) throw Error('No users exist');
            setCachedData(cacheKey, users);
        }

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`);
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithImage = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'image'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithSchool = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'school'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithLevel = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'level'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithFaculty = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'faculty'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithYear = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'year'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getUsersWithInterests = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/users`, {
            params: {
                filter: 'interests'
            }
        });
        const users = response.data;

        if (!users) throw Error('No users exist');

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

        if (!users) throw Error('No users exist');

        res.status(200).json(users);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop100Quizzing = async (req, res) => {
    const cacheKey = 'top_100_quizzing';
    
    try {
        let scores = getCachedData(cacheKey);
        
        if (!scores) {
            const response = await axios.get(`${API_GATEWAY_URL}/api/scores/top100`, {
                timeout: 5000
            });
            scores = response.data;
            setCachedData(cacheKey, scores);
        }

        res.json(scores);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop100Downloaders = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/top100`);
        const downloadsCount = response.data;

        res.json(downloadsCount);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getTop20Quizzes = async (req, res) => {
    const cacheKey = 'top_20_quizzes';
    
    try {
        let quizStatistics = getCachedData(cacheKey);
        
        if (!quizStatistics) {
            const response = await axios.get(`${API_GATEWAY_URL}/api/scores/top20quizzes`, {
                timeout: 5000
            });
            quizStatistics = response.data;
            setCachedData(cacheKey, quizStatistics);
        }

        res.json(quizStatistics);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/quizzesStats`);
        const quizStatistics = response.data;

        res.json(quizStatistics);
    } catch (err) {
        handleError(res, err);
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
        const response = await axios.get(`${API_GATEWAY_URL}/api/scores/quizCategoriesStats`);
        const categoriesStats = response.data;

        res.json(categoriesStats);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getNotesCategoriesStats = async (req, res) => {
    try {
        const response = await axios.get(`${API_GATEWAY_URL}/api/downloads/notesCategoriesStats`);
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
            const response = await axios.get(`${API_GATEWAY_URL}/api/users/daily-user-registration`, {
                timeout: 5000
            });
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
                axios.get(`${API_GATEWAY_URL}/api/users`, {
                    params: { date_from: startOfDay.toISOString() },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/scores`, {
                    params: { date_from: startOfDay.toISOString() },
                    timeout: 5000
                }),
                axios.get(`${API_GATEWAY_URL}/api/quizzes`, {
                    params: { date_from: startOfDay.toISOString() },
                    timeout: 5000
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

// Clear cache endpoint for admin use
exports.clearStatsCache = async (req, res) => {
    try {
        cache.clear();
        res.json({ message: 'Statistics cache cleared successfully' });
    } catch (error) {
        handleError(res, error);
    }
};
