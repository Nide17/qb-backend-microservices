const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
// const morgan = require('morgan');
const cors = require('cors');
const RedisCacheManager = require('./redis-cache');
const HealthMonitor = require('../shared-utils/health-monitor');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

app.use(express.json());
// app.use(morgan('combined'));
app.use(cors());

// Initialize Redis cache manager
const redisCache = new RedisCacheManager();

// Initialize health monitor
const healthMonitor = new HealthMonitor();

// In-memory cache as fallback
const memoryCache = new Map();
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Add health monitoring middleware
app.use(healthMonitor.middleware());

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
        console.error('Cache get error:', error);
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
        console.error('Cache set error:', error);
        // Fallback to memory cache only
        memoryCache.set(key, { data, timestamp: Date.now() });
    }
};

const retryRequest = async (req, res, serviceUrl, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios({
                method: req.method,
                url: `${serviceUrl}${req.originalUrl}`,
                data: req.body,
                headers: { 'x-auth-token': req.header('x-auth-token') },
                timeout: 10000, // 10 second timeout
            });
            return response;
        } catch (error) {
            if (i < retries - 1) {
                if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
                    console.log(`Retrying request to ${serviceUrl}${req.originalUrl} (${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
                } else if (error.code === 'ETIMEDOUT') {
                    res.status(504).send({
                        error: `Service at ${serviceUrl} [${req.originalUrl.split('/')[2]}] is taking too long to respond`
                    });
                    return;
                } else {
                    throw error;
                }
            } else {
                res.status(502).send({
                    error: `Service at ${serviceUrl} [${req.originalUrl.split('/')[2]}] is unavailable`
                });
                return;
            }
        }
    }
};

const routeToService = (serviceUrl) => async (req, res) => {
    try {
        const response = await retryRequest(req, res, serviceUrl);
        if (response) {
            res.status(response.status).send(response.data);
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            res.status(502).send({
                error: `Service at ${serviceUrl} [${req.originalUrl.split('/')[2]}] is unavailable`
            });
        } else if (error.response) {
            res.status(error.response.status).send({
                error: error.response.data.msg || error.response.data.error,
                id: error.response.data?.id,
            });
        } else {
            console.error('Unexpected error:', error);
            res.status(500).send({
                error: `Something went wrong: ${req.originalUrl.split('/')[2]}`
            });
        }
    }
};

// Enhanced Data Aggregation Endpoints
app.get('/api/aggregated/quiz/:id', async (req, res) => {
    try {
        const cacheKey = `quiz_${req.params.id}`;
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Fetch quiz with all related data
        const [quizRes, categoryRes, questionsRes, commentsRes, scoresRes] = await Promise.allSettled([
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/quizzes/${req.params.id}`),
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/categories`),
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/questions`),
            axios.get(`${process.env.COMMENTS_SERVICE_URL}/api/quizzes-comments?quiz=${req.params.id}`),
            axios.get(`${process.env.SCORES_SERVICE_URL}/api/scores?quiz=${req.params.id}`)
        ]);

        const quiz = quizRes.status === 'fulfilled' ? quizRes.value.data : null;
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Aggregate data
        const aggregatedData = {
            ...quiz,
            category: categoryRes.status === 'fulfilled' ?
                categoryRes.value.data.find(cat => cat._id === quiz.category) : null,
            questions: questionsRes.status === 'fulfilled' ?
                questionsRes.value.data.filter(q => quiz.questions.includes(q._id)) : [],
            comments: commentsRes.status === 'fulfilled' ? commentsRes.value.data : [],
            scores: scoresRes.status === 'fulfilled' ? scoresRes.value.data : [],
            _aggregated: true,
            _cached: false
        };

        await setCachedData(cacheKey, aggregatedData);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Error aggregating quiz data:', error);
        res.status(500).json({ error: 'Failed to aggregate quiz data' });
    }
});

app.get('/api/aggregated/quizzes', async (req, res) => {
    try {
        const { page = 1, limit = 12, category, search, difficulty, created_by } = req.query;
        const cacheKey = `quizzes_${page}_${limit}_${category}_${search}_${difficulty}_${created_by}`;
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('pageNo', page);
        if (limit) queryParams.append('limit', limit);
        if (category) queryParams.append('category', category);
        if (search) queryParams.append('search', search);
        if (difficulty) queryParams.append('difficulty', difficulty);
        if (created_by) queryParams.append('created_by', created_by);

        const [quizzesRes, categoriesRes, usersRes] = await Promise.allSettled([
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/quizzes?${queryParams}`),
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/categories`),
            axios.get(`${process.env.USERS_SERVICE_URL}/api/users`)
        ]);

        if (quizzesRes.status === 'rejected') {
            return res.status(500).json({ error: 'Failed to fetch quizzes' });
        }

        const quizzes = quizzesRes.value.data;
        const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : [];
        const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];

        // Enhance quizzes with category names, user info, and basic stats
        const enhancedQuizzes = quizzes.quizzes ? quizzes.quizzes.map(quiz => ({
            ...quiz,
            categoryName: categories.find(cat => cat._id === quiz.category)?.name || 'Unknown',
            categorySlug: categories.find(cat => cat._id === quiz.category)?.slug || '',
            creatorName: users.find(user => user._id === quiz.created_by)?.name || 'Unknown',
            questionCount: quiz.questions?.length || 0,
            estimatedTime: (quiz.questions?.length || 0) * 2, // 2 minutes per question
            difficulty: quiz.difficulty || 'medium'
        })) : [];

        const aggregatedData = {
            ...quizzes,
            quizzes: enhancedQuizzes,
            categories: categories,
            _aggregated: true,
            _cached: false
        };

        await setCachedData(cacheKey, aggregatedData);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Error aggregating quizzes data:', error);
        res.status(500).json({ error: 'Failed to aggregate quizzes data' });
    }
});

app.get('/api/aggregated/dashboard', async (req, res) => {
    try {
        const cacheKey = 'dashboard_stats';
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Fetch dashboard statistics from multiple services
        const [quizzesRes, usersRes, coursesRes, postsRes, scoresRes, feedbacksRes] = await Promise.allSettled([
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/quizzes`),
            axios.get(`${process.env.USERS_SERVICE_URL}/api/users`),
            axios.get(`${process.env.COURSES_SERVICE_URL}/api/courses`),
            axios.get(`${process.env.POSTS_SERVICE_URL}/api/blog-posts`),
            axios.get(`${process.env.SCORES_SERVICE_URL}/api/scores`),
            axios.get(`${process.env.FEEDBACKS_SERVICE_URL}/api/feedbacks`)
        ]);

        const dashboardData = {
            totalQuizzes: quizzesRes.status === 'fulfilled' ? quizzesRes.value.data.length : 0,
            totalUsers: usersRes.status === 'fulfilled' ? usersRes.value.data.length : 0,
            totalCourses: coursesRes.status === 'fulfilled' ? coursesRes.value.data.length : 0,
            totalPosts: postsRes.status === 'fulfilled' ? postsRes.value.data.length : 0,
            totalScores: scoresRes.status === 'fulfilled' ? scoresRes.value.data.length : 0,
            totalFeedbacks: feedbacksRes.status === 'fulfilled' ? feedbacksRes.value.data.length : 0,
            _aggregated: true,
            _cached: false,
            lastUpdated: new Date().toISOString()
        };

        await setCachedData(cacheKey, dashboardData);
        res.json(dashboardData);
    } catch (error) {
        console.error('Error aggregating dashboard data:', error);
        res.status(500).json({ error: 'Failed to aggregate dashboard data' });
    }
});

// New aggregated endpoints
app.get('/api/aggregated/user/:id', async (req, res) => {
    try {
        const cacheKey = `user_${req.params.id}`;
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const [userRes, scoresRes, quizzesRes, commentsRes] = await Promise.allSettled([
            axios.get(`${process.env.USERS_SERVICE_URL}/api/users/${req.params.id}`),
            axios.get(`${process.env.SCORES_SERVICE_URL}/api/scores?user=${req.params.id}`),
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/quizzes?created_by=${req.params.id}`),
            axios.get(`${process.env.COMMENTS_SERVICE_URL}/api/quizzes-comments?user=${req.params.id}`)
        ]);

        const user = userRes.status === 'fulfilled' ? userRes.value.data : null;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const aggregatedData = {
            ...user,
            scores: scoresRes.status === 'fulfilled' ? scoresRes.value.data : [],
            createdQuizzes: quizzesRes.status === 'fulfilled' ? quizzesRes.value.data : [],
            comments: commentsRes.status === 'fulfilled' ? commentsRes.value.data : [],
            stats: {
                totalScores: scoresRes.status === 'fulfilled' ? scoresRes.value.data.length : 0,
                totalQuizzes: quizzesRes.status === 'fulfilled' ? quizzesRes.value.data.length : 0,
                totalComments: commentsRes.status === 'fulfilled' ? commentsRes.value.data.length : 0,
                averageScore: scoresRes.status === 'fulfilled' && scoresRes.value.data.length > 0
                    ? scoresRes.value.data.reduce((acc, score) => acc + score.score, 0) / scoresRes.value.data.length
                    : 0
            },
            _aggregated: true,
            _cached: false
        };

        await setCachedData(cacheKey, aggregatedData);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Error aggregating user data:', error);
        res.status(500).json({ error: 'Failed to aggregate user data' });
    }
});

app.get('/api/aggregated/category/:id', async (req, res) => {
    try {
        const cacheKey = `category_${req.params.id}`;
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const [categoryRes, quizzesRes, questionsRes] = await Promise.allSettled([
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/categories/${req.params.id}`),
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/quizzes?category=${req.params.id}`),
            axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/questions`)
        ]);

        const category = categoryRes.status === 'fulfilled' ? categoryRes.value.data : null;
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const quizzes = quizzesRes.status === 'fulfilled' ? quizzesRes.value.data : [];
        const questions = questionsRes.status === 'fulfilled' ? questionsRes.value.data : [];

        const aggregatedData = {
            ...category,
            quizzes: quizzes,
            questions: questions.filter(q => quizzes.some(quiz => quiz.questions.includes(q._id))),
            stats: {
                totalQuizzes: quizzes.length,
                totalQuestions: questions.filter(q => quizzes.some(quiz => quiz.questions.includes(q._id))).length,
                averageDifficulty: quizzes.length > 0
                    ? quizzes.reduce((acc, quiz) => acc + (quiz.difficulty || 1), 0) / quizzes.length
                    : 0
            },
            _aggregated: true,
            _cached: false
        };

        await setCachedData(cacheKey, aggregatedData);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Error aggregating category data:', error);
        res.status(500).json({ error: 'Failed to aggregate category data' });
    }
});

app.get('/api/aggregated/search', async (req, res) => {
    try {
        const { q: query, type, page = 1, limit = 20 } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const cacheKey = `search_${query}_${type}_${page}_${limit}`;
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const searchPromises = [];

        if (!type || type === 'quizzes') {
            searchPromises.push(axios.get(`${process.env.QUIZZING_SERVICE_URL}/api/quizzes?search=${query}&pageNo=${page}&limit=${limit}`));
        }
        if (!type || type === 'users') {
            searchPromises.push(axios.get(`${process.env.USERS_SERVICE_URL}/api/users?search=${query}&pageNo=${page}&limit=${limit}`));
        }
        if (!type || type === 'posts') {
            searchPromises.push(axios.get(`${process.env.POSTS_SERVICE_URL}/api/blog-posts?search=${query}&pageNo=${page}&limit=${limit}`));
        }
        if (!type || type === 'courses') {
            searchPromises.push(axios.get(`${process.env.COURSES_SERVICE_URL}/api/courses?search=${query}&pageNo=${page}&limit=${limit}`));
        }

        const results = await Promise.allSettled(searchPromises);

        const aggregatedData = {
            query,
            type: type || 'all',
            results: {
                quizzes: type === 'quizzes' || !type ? (results[0]?.status === 'fulfilled' ? results[0].value.data : []) : [],
                users: type === 'users' || !type ? (results[1]?.status === 'fulfilled' ? results[1].value.data : []) : [],
                posts: type === 'posts' || !type ? (results[2]?.status === 'fulfilled' ? results[2].value.data : []) : [],
                courses: type === 'courses' || !type ? (results[3]?.status === 'fulfilled' ? results[3].value.data : []) : []
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            },
            _aggregated: true,
            _cached: false
        };

        await setCachedData(cacheKey, aggregatedData);
        res.json(aggregatedData);
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

// Enhanced Health Check with Service Status and Metrics
app.get('/api/health', async (req, res) => {
    const services = {
        'Users': process.env.USERS_SERVICE_URL,
        'Quizzing': process.env.QUIZZING_SERVICE_URL,
        'Posts': process.env.POSTS_SERVICE_URL,
        'Schools': process.env.SCHOOLS_SERVICE_URL,
        'Courses': process.env.COURSES_SERVICE_URL,
        'Scores': process.env.SCORES_SERVICE_URL,
        'Downloads': process.env.DOWNLOADS_SERVICE_URL,
        'Contacts': process.env.CONTACTS_SERVICE_URL,
        'Feedbacks': process.env.FEEDBACKS_SERVICE_URL,
        'Comments': process.env.COMMENTS_SERVICE_URL,
        'Statistics': process.env.STATISTICS_SERVICE_URL
    };

    const healthReport = await healthMonitor.getHealthReport(services);
    
    // Add cache information
    healthReport.cache = {
        redis: {
            connected: redisCache.isConnected,
            stats: await redisCache.getStats()
        },
        memory: {
            size: memoryCache.size,
            keys: Array.from(memoryCache.keys())
        }
    };

    res.json(healthReport);
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
    const metrics = healthMonitor.getMetricsSummary();
    const systemMetrics = healthMonitor.getSystemMetrics();
    
    res.json({
        ...metrics,
        system: systemMetrics,
        timestamp: new Date().toISOString()
    });
});

// Users Service
app.use('/api/users', routeToService(process.env.USERS_SERVICE_URL));
app.use('/api/subscribed-users', routeToService(process.env.USERS_SERVICE_URL));

// Quizzing Service
app.use('/api/categories', routeToService(process.env.QUIZZING_SERVICE_URL));
app.use('/api/quizzes', routeToService(process.env.QUIZZING_SERVICE_URL));
app.use('/api/questions', routeToService(process.env.QUIZZING_SERVICE_URL));

// Posts Service
app.use('/api/adverts', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/faqs', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/blog-posts', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/post-categories', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/image-uploads', routeToService(process.env.POSTS_SERVICE_URL));
app.use('/api/blog-posts-views', routeToService(process.env.POSTS_SERVICE_URL));

// Schools Service
app.use('/api/schools', routeToService(process.env.SCHOOLS_SERVICE_URL));
app.use('/api/levels', routeToService(process.env.SCHOOLS_SERVICE_URL));
app.use('/api/faculties', routeToService(process.env.SCHOOLS_SERVICE_URL));

// Courses Service
app.use('/api/course-categories', routeToService(process.env.COURSES_SERVICE_URL));
app.use('/api/courses', routeToService(process.env.COURSES_SERVICE_URL));
app.use('/api/chapters', routeToService(process.env.COURSES_SERVICE_URL));
app.use('/api/notes', routeToService(process.env.COURSES_SERVICE_URL));

// Scores Service
app.use('/api/scores', routeToService(process.env.SCORES_SERVICE_URL));

// Downloads Service
app.use('/api/downloads', routeToService(process.env.DOWNLOADS_SERVICE_URL));

// Contacts Service
app.use('/api/contacts', routeToService(process.env.CONTACTS_SERVICE_URL));
app.use('/api/broadcasts', routeToService(process.env.CONTACTS_SERVICE_URL));
app.use('/api/chat-rooms', routeToService(process.env.CONTACTS_SERVICE_URL));
app.use('/api/room-messages', routeToService(process.env.CONTACTS_SERVICE_URL));

// Feedbacks Service
app.use('/api/feedbacks', routeToService(process.env.FEEDBACKS_SERVICE_URL));

// Comments Service
app.use('/api/quizzes-comments', routeToService(process.env.COMMENTS_SERVICE_URL));
app.use('/api/questions-comments', routeToService(process.env.COMMENTS_SERVICE_URL));

// Statistics Service
app.use('/api/statistics', routeToService(process.env.STATISTICS_SERVICE_URL));

// Health Check Endpoint
app.get('/', (req, res) => {
    res.send({
        status: 'API Gateway is running',
        version: '2.0.0',
        features: ['data-aggregation', 'caching', 'health-monitoring'],
        endpoints: {
            aggregated: [
                '/api/aggregated/quiz/:id',
                '/api/aggregated/quizzes',
                '/api/aggregated/dashboard',
                '/api/aggregated/user/:id',
                '/api/aggregated/category/:id',
                '/api/aggregated/search'
            ],
            health: '/api/health'
        }
    });
});

// 404 Route Not Found
app.use((req, res, next) => {
    res.status(404).send({ error: `Route ${req.url} not found` });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    console.error(err);
    res.status(err.status || 500).send({ error: err.message });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user-specific room for personalized updates
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
    });
    
    // Join quiz room for real-time quiz features
    socket.on('join-quiz-room', (quizId) => {
        socket.join(`quiz-${quizId}`);
        console.log(`Socket ${socket.id} joined quiz room quiz-${quizId}`);
    });
    
    // Handle quiz progress updates
    socket.on('quiz-progress', (data) => {
        socket.to(`quiz-${data.quizId}`).emit('quiz-progress-update', data);
    });
    
    // Handle real-time comments
    socket.on('new-comment', (data) => {
        io.to(`quiz-${data.quizId}`).emit('comment-added', data);
    });
    
    // Handle score updates
    socket.on('score-update', (data) => {
        io.to(`user-${data.userId}`).emit('score-updated', data);
        // Broadcast to dashboard if needed
        io.emit('dashboard-stats-update', { type: 'score', data });
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware to attach socket.io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Port
const PORT = process.env.PORT || 5000;

// Initialize Redis connection and start server
async function startServer() {
    try {
        // Connect to Redis
        await redisCache.connect();

        server.listen(PORT, () => {
            console.log(`🚀 API Gateway with Socket.io running on port ${PORT}`);
            console.log('📡 Ready to route requests to microservices');
            console.log(`📦 Redis cache: ${redisCache.isConnected ? 'Connected' : 'Disconnected'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    io.close();
    await redisCache.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    io.close();
    await redisCache.disconnect();
    process.exit(0);
});
