const axios = require('axios');
const mongoose = require('mongoose');
const Score = require("../models/Score");
const { handleError } = require('../utils/error');

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:5001';
const QUIZZING_SERVICE_URL = process.env.QUIZZING_SERVICE_URL || 'http://localhost:5002';

// Cache for frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

// Simple direct API call helper
const callService = async (url, timeout = 5000) => {
    try {
        const response = await axios.get(url, {
            timeout,
            headers: { 'x-internal-service': 'true' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.status !== 404) {
            console.error(`Service call failed: ${url}`, error.message);
        }
        return null;
    }
};

// Simple population function - direct and clear
const populateScore = async (score) => {
    if (!score) return score;

    // Create populated score with all original properties
    const populatedScore = {
        _id: score._id,
        id: score.id,
        marks: score.marks,
        out_of: score.out_of,
        questionsAttempted: score.questionsAttempted,
        percentage: score.percentage,
        passed: score.passed,
        test_date: score.test_date,
        review: score.review,
        category: score.category,
        quiz: score.quiz,
        taken_by: score.taken_by
    };

    // Populate category if exists
    if (score.category) {
        const category = await callService(`${QUIZZING_SERVICE_URL}/api/categories/${score.category}`);
        if (category) {
            populatedScore.category = {
                _id: category._id,
                title: category.title
            };
        }
    }

    // Populate quiz if exists
    if (score.quiz) {
        const quiz = await callService(`${QUIZZING_SERVICE_URL}/api/quizzes/${score.quiz}`);
        if (quiz) {
            populatedScore.quiz = {
                _id: quiz._id,
                title: quiz.title,
                slug: quiz.slug,
                description: quiz.description
            };
        }
    }

    // Populate user if exists
    if (score.taken_by) {
        const user = await callService(`${USERS_SERVICE_URL}/api/users/${score.taken_by}`);
        if (user) {
            populatedScore.taken_by = {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role
            };
        }
    }

    return populatedScore;
};

// Populate array of scores
const populateScores = async (scores) => {
    if (!scores || scores.length === 0) return scores;
    
    const populatedScores = [];
    for (const score of scores) {
        const populated = await populateScore(score);
        populatedScores.push(populated);
    }
    
    return populatedScores;
};

exports.getScores = async (req, res) => {
    // Pagination
    const totalPages = await Score.countDocuments({})
    var PAGE_SIZE = 20
    var pageNo = parseInt(req.query.pageNo || "0")
    var query = {}

    query.limit = PAGE_SIZE
    query.skip = PAGE_SIZE * (pageNo - 1)

    try {
        let scores = pageNo > 0 ?
            await Score.find({}, {}, query).sort({ test_date: -1 }).exec() :
            await Score.find().sort({ test_date: -1 }).exec();

        if (!scores || scores.length === 0) return res.status(204).json({ message: 'No scores found' });

        // Direct population - simple and clear
        scores = await populateScores(scores);

        if (pageNo > 0) {
            return res.status(200).json({
                totalPages: Math.ceil(totalPages / PAGE_SIZE),
                scores
            });
        } else {
            return res.status(200).json({ scores });
        }
    } catch (err) {
        handleError(res, err);
    }
}

exports.getScoresByTaker = async (req, res) => {
    let id = req.params.id;
    const cacheKey = `scores_user_${id}`;

    try {
        // Check cache first
        let scores = getCachedData(cacheKey);
        
        if (!scores) {
            scores = await Score.find({ taken_by: id }).sort({ test_date: -1 }).exec();
            if (!scores || scores.length === 0) return res.status(404).json({ message: 'No scores found' });

            // Direct population - simple and clear
            scores = await populateScores(scores);
            setCachedData(cacheKey, scores);
        }

        res.status(200).json(scores);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getScoresForQuizCreator = async (req, res) => {
    try {
        let scores = await Score.find().exec();
        if (!scores) return res.status(404).json({ message: 'No scores found' });

        // Direct population - simple and clear
        scores = await populateScores(scores);

        res.status(200).json(scores);
    } catch (err) {
        console.log('Error retrieving scores for quiz creator: ', err);
        handleError(res, err);
    }
}

exports.getOneScore = async (req, res) => {
    let id = req.params.id;

    try {
        let score = await Score.findOne({ id }).exec();

        if (score) {
            // Direct population - simple and clear
            score = await populateScore(score);
        } else {
            // Validate ObjectId format before querying by _id
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid ID format provided',
                    code: 'INVALID_ID_FORMAT'
                });
            }
            
            score = await Score.findOne({ _id: id }).exec();
            if (score) {
                // Direct population - simple and clear
                score = await populateScore(score);
            }
        }

        if (!score) return res.status(404).json({ message: 'No scores found' });
        res.status(200).json(score);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getQuizRanking = async (req, res) => {
    let id = req.params.id;
    const cacheKey = `ranking_${id}`;
    
    try {
        // Check cache first
        let scores = getCachedData(cacheKey);
        
        if (!scores) {
            scores = await Score.find({ quiz: id }).sort({ marks: -1 }).limit(20).exec();
            if (!scores || scores.length === 0) {
                console.warn(`No scores found for the ${id} quiz`);
                res.status(404).json({
                    success: false,
                    error: 'Scores Not Found',
                    message: `No scores found for the ${id} quiz`,
                    code: 'SCORES_NOT_FOUND',
                    timestamp: new Date().toISOString()
                });
                return;
            }

            // Direct population - simple and clear
            scores = await populateScores(scores);
            setCachedData(cacheKey, scores);
        }

        res.status(200).json(scores);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getPopularQuizzes = async (req, res) => {
    const cacheKey = 'popular_quizzes';
    
    try {
        // Check cache first
        let popularQuizzes = getCachedData(cacheKey);
        
        if (!popularQuizzes) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const topQuizzes = await Score.aggregate([
                { $match: { test_date: { $gte: startOfDay, $lte: endOfDay } } },
                { $group: { _id: "$quiz", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 3 }
            ]).exec();

            if (topQuizzes.length > 0) {
                const quizIds = topQuizzes.map(q => q._id);
                const quizzes = await axios.get(`${QUIZZING_SERVICE_URL}/api/quizzes`, { 
                    params: { ids: quizIds },
                });

                popularQuizzes = topQuizzes.map(pq => ({
                    _id: pq._id,
                    qTitle: quizzes.data.find(q => q._id === pq._id)?.title || 'Unknown Quiz',
                    slug: quizzes.data.find(q => q._id === pq._id)?.slug || '',
                    count: pq.count
                }));
            } else {
                popularQuizzes = [];
            }
            
            setCachedData(cacheKey, popularQuizzes);
        }

        res.json(popularQuizzes);
    } catch (error) {
        console.log('Error retrieving popular quizzes: ', error);
        handleError(res, error);
    }
}

exports.getMonthlyUser = async (req, res) => {
    const cacheKey = 'monthly_user';
    
    try {
        // Check cache first
        let monthlyUserData = getCachedData(cacheKey);
        
        if (!monthlyUserData) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date();
            endOfMonth.setHours(23, 59, 59, 999);

            const monthlyUser = await Score.aggregate([
                { $match: { test_date: { $gte: startOfMonth, $lte: endOfMonth } } },
                { $group: { _id: "$taken_by", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]).exec();

            if (monthlyUser.length > 0) {
                try {
                    const user = await axios.get(`${USERS_SERVICE_URL}/api/users/${monthlyUser[0]._id}`, {

                    });
                    monthlyUserData = {
                        uName: user.data.name,
                        uPhoto: user.data.image,
                        count: monthlyUser[0].count
                    };
                } catch (userError) {
                    console.log('Error fetching user data:', userError);
                    monthlyUserData = null;
                }
            } else {
                monthlyUserData = null;
            }
            
            setCachedData(cacheKey, monthlyUserData);
        }

        res.json(monthlyUserData);
    } catch (error) {
        console.log('Error retrieving monthly user: ', error);
        handleError(res, error);
    }
}

exports.createScore = async (req, res) => {
    const { id, out_of, category, quiz, review, taken_by } = req.body
    const marks = req.body.marks ? req.body.marks : 0
    var now = new Date()

    // Simple validation
    if (!id || !out_of || !review || !taken_by) {
        const missing = !id ? 'Error' : !out_of ? 'No total' : !review ? 'No review' : !taken_by ? 'Not logged in' : 'Wrong'
        return res.status(400).json({ message: missing + '!' })
    }

    else {
        try {
            // Use Promise.all for parallel queries to improve performance
            const [existingScore, recentScoreExist] = await Promise.all([
                Score.find({ id: id }),
                Score.find({ taken_by }, {}, { sort: { 'test_date': -1 }, limit: 1 })
            ]);

            if (existingScore.length > 0) {
                return res.status(400).json({
                    message: 'Score duplicate! You have already saved this score!'
                })
            }

            if (recentScoreExist.length > 0) {
                // Check if the score was saved within 60 seconds
                let testDate = new Date(recentScoreExist[0].test_date)
                let seconds = Math.round((now - testDate) / 1000)

                if (seconds < 60) {
                    return res.status(400).json({
                        message: 'Score duplicate! You took this quiz in less than a minute ago!'
                    })
                }
            }

            const newScore = new Score({
                id,
                marks,
                out_of,
                test_date: now,
                category,
                quiz,
                review,
                taken_by
            })

            const savedScore = await newScore.save()

            if (!savedScore) return res.status(500).json({ message: 'Could not save score, try again!' })

            // Clear relevant cache entries
            const cacheKeysToDelete = [`scores_user_${taken_by}`, `ranking_${quiz}`, 'popular_quizzes', 'monthly_user'];
            cacheKeysToDelete.forEach(key => cache.delete(key));

            // Emit real-time update if socket.io is available
            if (req.io) {
                req.io.to(`user-${taken_by}`).emit('score-updated', {
                    score: savedScore,
                    type: 'new_score'
                });
                
                // Broadcast to quiz room for leaderboard updates
                req.io.to(`quiz-${quiz}`).emit('leaderboard-update', {
                    quizId: quiz,
                    newScore: {
                        userId: taken_by,
                        marks,
                        out_of,
                        test_date: now
                    }
                });

                // Broadcast dashboard stats update
                req.io.emit('dashboard-stats-update', {
                    type: 'new_score',
                    data: { quiz, marks, out_of, taken_by }
                });
            }

            res.status(200).json({
                _id: savedScore._id,
                id: savedScore.id,
                marks: savedScore.marks,
                out_of: savedScore.out_of,
                test_date: savedScore.test_date,
                category: savedScore.category,
                quiz: savedScore.quiz,
                review: savedScore.review,
                taken_by: savedScore.taken_by
            })
        } catch (err) {
            console.log('Error creating score: ', err);
            handleError(res, err);
        }
    }
}

exports.deleteScore = async (req, res) => {
    try {
        // Validate ObjectId format before querying
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid ID format provided',
                code: 'INVALID_ID_FORMAT'
            });
        }

        //Find the Score to delete by id first
        const score = await Score.findOne({ _id: req.params.id })

        if (!score) return res.status(404).json({ message: 'No scores found' });

        // Delete the Score
        const removedScore = await Score.deleteOne({ _id: req.params.id })

        if (!removedScore) return res.status(500).json({ message: 'Could not delete score, try again!' });

        res.status(200).json(removedScore)
    }

    catch (err) {
        console.log('Error deleting score: ', err);
        handleError(res, err);
    }
}

// Get database statistics
// Get top users by quiz activity (for statistics service)
exports.getTopUsersByQuizzes = async (req, res) => {
    const cacheKey = 'top_users_quizzes';
    
    try {
        // Check cache first
        let topUsers = getCachedData(cacheKey);
        
        if (!topUsers) {
            const topUsersData = await Score.aggregate([
                { $group: { _id: "$taken_by", totalQuizzes: { $sum: 1 }, totalMarks: { $sum: "$marks" }, avgMarks: { $avg: "$marks" } } },
                { $sort: { totalQuizzes: -1 } },
                { $limit: 10 }
            ]).exec();

            if (topUsersData.length > 0) {
                const userIds = topUsersData.map(u => u._id.toString());
                
                try {
                    // Fetch user details
                    const usersResponse = await axios.post(`${USERS_SERVICE_URL}/api/users/batch`, 
                        { userIds }, 
                        {
                            headers: { 'x-internal-service': 'true' }
                        }
                    );
                    
                    const users = usersResponse.data.users || [];
                    
                    topUsers = topUsersData.map(userData => {
                        const user = users.find(u => u._id === userData._id.toString()) || {};
                        return {
                            _id: userData._id,
                            name: user.name || 'Unknown User',
                            email: user.email || '',
                            image: user.image || '',
                            totalQuizzes: userData.totalQuizzes,
                            totalMarks: userData.totalMarks,
                            avgMarks: Math.round(userData.avgMarks * 10) / 10
                        };
                    });
                } catch (userError) {
                    console.log('Error fetching user details for top users:', userError);
                    // Return data without user details if API call fails
                    topUsers = topUsersData.map(userData => ({
                        _id: userData._id,
                        name: 'Unknown User',
                        email: '',
                        image: '',
                        totalQuizzes: userData.totalQuizzes,
                        totalMarks: userData.totalMarks,
                        avgMarks: Math.round(userData.avgMarks * 10) / 10
                    }));
                }
            } else {
                topUsers = [];
            }
            
            setCachedData(cacheKey, topUsers);
        }

        res.json(topUsers);
    } catch (error) {
        console.log('Error retrieving top users by quizzes:', error);
        handleError(res, error);
    }
};

exports.getDatabaseStats = async (req, res) => {
    try {
        const db = Score.db;
        const collection = db.collection('scores');
        
        // Get basic document count
        const documentCount = await collection.countDocuments();
        
        // Get estimated document size by sampling
        const sampleDocs = await collection.find({}).limit(50).toArray();
        const avgDocSize = sampleDocs.length > 0 ? 
            sampleDocs.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0) / sampleDocs.length : 0;
        const estimatedDataSize = documentCount * avgDocSize;
        
        // Get aggregated data
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalScores: { $sum: 1 },
                    avgScore: { $avg: "$score" },
                    maxScore: { $max: "$score" },
                    minScore: { $min: "$score" },
                    recentScores: {
                        $sum: {
                            $cond: [
                                { $gte: ["$takenDate", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ];
        
        const aggregatedStats = await collection.aggregate(pipeline).toArray();
        const scoreStats = aggregatedStats[0] || {};

        const dbStats = {
            service: 'scores',
            timestamp: new Date().toISOString(),
            documents: documentCount,
            totalDocuments: documentCount,
            dataSize: estimatedDataSize,
            totalDataSize: estimatedDataSize,
            storageSize: Math.round(estimatedDataSize * 1.2),
            totalStorageSize: Math.round(estimatedDataSize * 1.2),
            indexSize: Math.round(estimatedDataSize * 0.1),
            totalIndexSize: Math.round(estimatedDataSize * 0.1),
            indexes: 1,
            avgDocumentSize: avgDocSize,
            scoreMetrics: {
                totalScores: scoreStats.totalScores || 0,
                avgScore: Math.round((scoreStats.avgScore || 0) * 10) / 10,
                maxScore: scoreStats.maxScore || 0,
                minScore: scoreStats.minScore || 0,
                recentScores: scoreStats.recentScores || 0
            }
        };

        res.status(200).json(dbStats);
    } catch (error) {
        console.log('Error getting database stats:', error);
        handleError(res, error);
    }
}

