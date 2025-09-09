const axios = require('axios');
const Quiz = require("../models/Quiz");
const Category = require("../models/Category");
const Question = require("../models/Question");
const { handleError } = require('../utils/error');
const mongoose = require('mongoose');

// Simple validation helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

// Helper function to call other services
const callService = async (url) => {
    try {
        const response = await axios.get(url, { 
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data?.data || response.data;
    } catch (error) {
        // Enhanced error logging with more context
        const errorDetails = {
            url,
            service: 'quizzing-service',
            timestamp: new Date().toISOString(),
            errorType: error.code || error.name || 'Unknown',
            message: error.message,
            statusCode: error.response?.status,
            responseData: error.response?.data
        };
        
        // Log different error types with appropriate levels
        if (error.code === 'ECONNREFUSED') {
            console.error('🔴 SERVICE DOWN - Target service not responding:', errorDetails);
        } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            console.error('🔴 CONNECTION ERROR - Network issue:', errorDetails);
        } else if (error.code === 'ECONNABORTED') {
            console.warn('⏱️  TIMEOUT - Service took too long to respond:', errorDetails);
        } else {
            console.warn('⚠️  SERVICE CALL FAILED:', errorDetails);
        }
        
        return null;
    }
};

// Simple population function for users
const populateUser = async (userId) => {
    if (!userId) return null;
    const userData = await callService(`${USERS_SERVICE_URL}/api/users/${userId}`);
    return userData ? {
        _id: userData._id,
        name: userData.name,
        email: userData.email
    } : { _id: userId, name: 'Unknown User' };
};

// Populate single quiz
const populateQuiz = async (quiz) => {
    if (!quiz) return quiz;
    
    // Convert to plain object to avoid mongoose issues
    const plainQuiz = quiz.toObject ? quiz.toObject() : quiz;
    
    if (plainQuiz.created_by) {
        plainQuiz.created_by = await populateUser(plainQuiz.created_by);
    }
    
    if (plainQuiz.last_updated_by) {
        plainQuiz.last_updated_by = await populateUser(plainQuiz.last_updated_by);
    }
    
    return plainQuiz;
};

// Populate array of quizzes
const populateQuizzes = async (quizzes) => {
    if (!quizzes || quizzes.length === 0) return quizzes;
    
    // Convert to plain objects to avoid mongoose issues
    const plainQuizzes = quizzes.map(quiz => quiz.toObject ? quiz.toObject() : quiz);
    
    for (let quiz of plainQuizzes) {
        if (quiz.created_by) {
            quiz.created_by = await populateUser(quiz.created_by);
        }
        
        if (quiz.last_updated_by) {
            quiz.last_updated_by = await populateUser(quiz.last_updated_by);
        }
    }
    
    return plainQuizzes;
};

// Helper function to find quiz by ID
const findQuizById = async (id, res, selectFields = '') => {

    if (!isValidObjectId(id)) {
        console.log('\n\nInvalid quiz ID');
        return res.status(400).json({ message: 'Invalid quiz ID' });
    }

    try {
        let quiz = await Quiz.findById(id).select(selectFields)
            .populate('category questions');

        if (!quiz) return res.status(404).json({ message: 'No quiz found!' });

        // Populate user data using simple direct calls
        quiz = await populateQuiz(quiz);

        console.log('\n\nQuiz found:', quiz);
        return quiz;
    } catch (err) {
        console.log('\n\nError finding quiz:', err.message);
        return handleError(res, err);
    }
};

// Helper function to get quizzes with pagination
const getQuizzesWithPagination = async (query, pageNo, pageSize, res) => {

    const skip = pageSize * (pageNo - 1);
    try {
        const totalQuizzes = await Quiz.countDocuments(query);
        let quizzes = await Quiz.find(query)
            .sort({ creation_date: -1 })
            .populate('category questions')
            .limit(pageSize)
            .skip(skip);

        if (!quizzes.length) {
            return res.status(204).json({ message: 'No quizzes found!' });
        }

        // Populate user data using simple direct calls
        quizzes = await populateQuizzes(quizzes);

        res.status(200).json({
            totalPages: Math.ceil(totalQuizzes / pageSize),
            quizzes
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzes = async (req, res) => {
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip) || 0;

    try {
        let quizzes = await Quiz.find({})
            .sort({ creation_date: -1 })
            .populate('category questions')
            .limit(limit)
            .skip(skip);

        if (!quizzes.length) {
            return res.status(204).json({ message: 'No quizzes found!' });
        }
        
        // Populate user data using simple direct calls
        quizzes = await populateQuizzes(quizzes);
        
        res.status(200).json(quizzes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getPaginatedQuizzes = async (req, res) => {
    const PAGE_SIZE = 12;
    const pageNo = parseInt(req.query.pageNo || "1");

    const query = req.user && req.user.role === 'Creator'
        ? { created_by: req.user._id }
        : {};

    await getQuizzesWithPagination(query, pageNo, PAGE_SIZE, res);
};

exports.getOneQuiz = async (req, res) => {
    try {

        const id = req.params.id;
        const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

        const quiz = await Quiz.findOne(query).populate('category questions');
        if (!quiz) {
            return res.status(404).json({ message: `Quiz with id ${id} not found` });
        }

        // Populate user data using simple direct calls
        const populatedQuiz = await populateQuiz(quiz);
        res.status(200).json(populatedQuiz);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzesByCategory = async (req, res) => {
    try {
        let quizzes = await Quiz.find({ category: req.params.id })
            .populate('category questions');
        if (!quizzes.length) {
            return res.status(204).json({ message: 'No quizzes found' });
        }

        quizzes = await populateQuizzes(quizzes);
        res.status(200).json(quizzes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzesByNotes = async (req, res) => {
    try {
        const categories = await Category.find({ category: req.params.id });
        if (!categories.length) {
            return res.status(204).json({ message: 'No categories found!' });
        }

        let quizzes = await Quiz.find({ category: { $in: categories } }).populate('category questions');
        if (!quizzes.length) {
            return res.status(204).json({ message: 'No quizzes found!' });
        }

        quizzes = await populateQuizzes(quizzes);

        res.status(200).json(quizzes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createQuiz = async (req, res) => {
    const { title, description, category, created_by } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ message: 'There are missing info!' });
    }

    try {
        const existingQuiz = await Quiz.findOne({ title });
        if (existingQuiz) throw new Error('Quiz already exists!');

        const newQuiz = new Quiz({ title, description, category, created_by });
        const savedQuiz = await newQuiz.save();
        if (!savedQuiz) throw new Error('Something went wrong during creation!');

        await Category.updateOne(
            { "_id": category },
            { $addToSet: { "quizzes": savedQuiz._id } }
        );

        res.status(200).json(savedQuiz);
    } catch (err) {
        handleError(res, err);
    }
};

exports.notifying = async (req, res) => {
    try {
        const { slug, title, category, created_by } = req.body;

        let subscribers = [];

        try {
            const { data } = await axios.get(`${USERS_SERVICE_URL}/api/subscribed-users`);
            subscribers = data;
        } catch (error) {
            console.error('Error fetching subscribers:', error.message);
        }

        const clientURL = req.headers.origin;

        subscribers.forEach(sub => {
            sendEmail(
                sub.email,
                `Updates!! new ${category} quiz that may interest you`,
                {
                    name: sub.name,
                    author: created_by,
                    newQuiz: title,
                    quizzesLink: `${clientURL}/view-quiz/${slug}`,
                    unsubscribeLink: `${clientURL}/unsubscribe`
                },
                "./template/newquiz.handlebars"
            );
        });

        res.status(200).json({ slug, title, category, created_by });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await findQuizById(req.params.id, res);
        if (!quiz) return;

        Object.assign(quiz, req.body);
        await quiz.save();

        await Category.updateOne(
            { _id: req.body.oldCategoryID },
            { $pull: { quizzes: quiz._id } }
        );

        await Category.updateOne(
            { _id: req.body.category },
            { $addToSet: { "quizzes": quiz._id } }
        );

        res.status(200).json(quiz);
    } catch (err) {
        handleError(res, err);
    }
};

exports.addVidLink = async (req, res) => {
    try {
        const quiz = await findQuizById(req.params.id, res);
        if (!quiz) return;

        quiz.video_links.push(req.body);
        await quiz.save();

        res.status(200).json(quiz);
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await findQuizById(req.params.id, res);
        if (!quiz) return;

        await Category.updateOne(
            { _id: quiz.category },
            { $pull: { quizzes: quiz._id } }
        );

        await Question.deleteMany({ quiz: quiz._id });

        await quiz.remove();

        res.status(200).json({ message: 'Deleted!' });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteVideo = async (req, res) => {
    if (!isValidObjectId(req.body.qID)) {
        return res.status(400).json({ message: 'Invalid quiz ID' });
    }
    try {
        const quiz = await findQuizById(req.body.qID, res);
        if (!quiz) return;

        quiz.video_links.id(req.body.vId).remove();
        await quiz.save();

        res.status(200).json(quiz);
    } catch (err) {
        handleError(res, err);
    }
};

// Get database statistics
exports.getDatabaseStats = async (req, res) => {
    try {
        const db = Quiz.db;
        
        // Get stats for quizzes collection using simpler approach
        const quizzesCollection = db.collection('quizzes');
        const quizzesCount = await quizzesCollection.countDocuments();
        const quizSample = await quizzesCollection.find({}).limit(50).toArray();
        const avgQuizSize = quizSample.length > 0 ? 
            quizSample.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0) / quizSample.length : 0;
        const estimatedQuizDataSize = quizzesCount * avgQuizSize;
        
        // Get stats for questions collection
        const questionsCollection = db.collection('questions');
        const questionsCount = await questionsCollection.countDocuments().catch(() => 0);
        const estimatedQuestionDataSize = questionsCount * 200; // Estimate
        
        // Get stats for categories collection
        const categoriesCollection = db.collection('categories');
        const categoriesCount = await categoriesCollection.countDocuments().catch(() => 0);
        const estimatedCategoryDataSize = categoriesCount * 100; // Estimate
        
        // Get aggregated quiz data
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalQuizzes: { $sum: 1 },
                    activeQuizzes: {
                        $sum: {
                            $cond: [
                                { $gte: ["$creation_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    },
                    avgQuestionsPerQuiz: { $avg: { $size: "$questions" } }
                }
            }
        ];
        
        const aggregatedStats = await quizzesCollection.aggregate(pipeline).toArray();
        const quizStats = aggregatedStats[0] || {};

        const dbStats = {
            service: 'quizzes',
            timestamp: new Date().toISOString(),
            documents: quizzesCount + questionsCount + categoriesCount,
            totalDocuments: quizzesCount + questionsCount + categoriesCount,
            dataSize: estimatedQuizDataSize + estimatedQuestionDataSize + estimatedCategoryDataSize,
            totalDataSize: estimatedQuizDataSize + estimatedQuestionDataSize + estimatedCategoryDataSize,
            storageSize: Math.round((estimatedQuizDataSize + estimatedQuestionDataSize + estimatedCategoryDataSize) * 1.2),
            totalStorageSize: Math.round((estimatedQuizDataSize + estimatedQuestionDataSize + estimatedCategoryDataSize) * 1.2),
            indexSize: Math.round((estimatedQuizDataSize + estimatedQuestionDataSize + estimatedCategoryDataSize) * 0.1),
            totalIndexSize: Math.round((estimatedQuizDataSize + estimatedQuestionDataSize + estimatedCategoryDataSize) * 0.1),
            collections: {
                quizzes: {
                    documents: quizzesCount,
                    dataSize: estimatedQuizDataSize,
                    avgDocumentSize: avgQuizSize
                },
                questions: {
                    documents: questionsCount,
                    dataSize: estimatedQuestionDataSize,
                    avgDocumentSize: 200
                },
                categories: {
                    documents: categoriesCount,
                    dataSize: estimatedCategoryDataSize,
                    avgDocumentSize: 100
                }
            },
            quizMetrics: {
                totalQuizzes: quizStats.totalQuizzes || 0,
                activeQuizzes: quizStats.activeQuizzes || 0,
                avgQuestionsPerQuiz: Math.round(quizStats.avgQuestionsPerQuiz || 0)
            }
        };

        res.status(200).json(dbStats);
    } catch (error) {
        console.log('Error getting database stats:', error);
        handleError(res, error);
    }
};
