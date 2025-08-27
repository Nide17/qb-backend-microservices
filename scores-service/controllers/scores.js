const axios = require('axios');
const Score = require("../models/Score");
const { handleError } = require('../utils/error');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

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

const handleScoresPopulation = async (scores) => {
    return await Promise.all(scores.map(async score => {
        const scoreInstance = new Score(score);
        return await scoreInstance.populateQuizDetails();
    }));
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

        if (!scores || scores.length === 0) throw Error('No scores found');

        scores = await handleScoresPopulation(scores);

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
            if (!scores || scores.length === 0) throw Error('No scores found');

            scores = await handleScoresPopulation(scores);
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
        if (!scores) throw Error('No scores found');

        scores = await handleScoresPopulation(scores);

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
            score = await score.populateQuizDetails();
        } else {
            score = await Score.findOne({ _id: id }).exec();
        }

        if (!score) throw Error('No score found');
        res.status(200).json(score);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getRanking = async (req, res) => {
    let id = req.params.id;
    const cacheKey = `ranking_${id}`;
    
    try {
        // Check cache first
        let scores = getCachedData(cacheKey);
        
        if (!scores) {
            scores = await Score.find({ quiz: id }).sort({ marks: -1 }).limit(20).exec();
            if (!scores || scores.length === 0) throw Error('No scores found');

            scores = await handleScoresPopulation(scores);
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
                const quizzes = await axios.get(`${API_GATEWAY_URL}/api/quizzes`, { 
                    params: { ids: quizIds },
                    timeout: 5000
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
                    const user = await axios.get(`${API_GATEWAY_URL}/api/users/${monthlyUser[0]._id}`, {
                        timeout: 5000
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
        return res.status(400).json({ msg: missing + '!' })
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
                    msg: 'Score duplicate! You have already saved this score!'
                })
            }

            if (recentScoreExist.length > 0) {
                // Check if the score was saved within 60 seconds
                let testDate = new Date(recentScoreExist[0].test_date)
                let seconds = Math.round((now - testDate) / 1000)

                if (seconds < 60) {
                    return res.status(400).json({
                        msg: 'Score duplicate! You took this quiz in less than a minute ago!'
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

            if (!savedScore) throw Error('Something went wrong during creation!')

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
        //Find the Score to delete by id first
        const score = await Score.findOne({ _id: req.params.id })

        if (!score) throw Error('No score found!')

        // Delete the Score
        const removedScore = await Score.deleteOne({ _id: req.params.id })

        if (!removedScore) throw Error('Something went wrong while deleting!')

        res.status(200).json(removedScore)
    }

    catch (err) {
        console.log('Error deleting score: ', err);
        handleError(res, err);
    }
}

