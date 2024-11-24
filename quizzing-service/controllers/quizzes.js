const axios = require('axios');
const Quiz = require("../models/Quiz");
const Category = require("../models/Category");
const Question = require("../models/Question");

// Helper function to handle errors
const handleError = (res, err, status = 400) => {
    console.error(err);
    res.status(status).json({ msg: err.message });
}

// Helper function to find quiz by ID
const findQuizById = async (id, res, selectFields = '') => {
    try {
        const quiz = await Quiz.findById(id).select(selectFields);
        if (!quiz) return res.status(404).json({ msg: 'No quiz found!' });
        return quiz;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to get quizzes with pagination
const getQuizzesWithPagination = async (query, pageNo, pageSize, res) => {
    const skip = pageSize * (pageNo - 1);
    try {
        const totalQuizzes = await Quiz.countDocuments(query);
        const quizzes = await Quiz.find(query)
            .sort({ creation_date: -1 })
            .populate('category questions')
            .limit(pageSize)
            .skip(skip);

        if (!quizzes.length) throw new Error('No quizzes found');

        res.status(200).json({
            totalPages: Math.ceil(totalQuizzes / pageSize),
            quizzes
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzes = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    try {
        const quizzes = await Quiz.find({})
            .sort({ createdAt: -1 })
            .populate('category questions')
            .limit(limit)
            .skip(skip);

        if (!quizzes) throw new Error('No quizzes found');
        res.status(200).json(quizzes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getPaginatedQuizzes = async (req, res) => {
    const PAGE_SIZE = 12;
    const pageNo = parseInt(req.query.pageNo || "0");

    const query = req.user.role === 'Creator'
        ? { created_by: req.user._id }
        : {};

    await getQuizzesWithPagination(query, pageNo, PAGE_SIZE, res);
};

exports.getOneQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ slug: req.params.quizSlug })
            .populate('category questions').lean();

        if (!quiz) throw new Error('Quiz not found!');

        res.status(200).json(quiz);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzesByCategory = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ category: req.params.id })
            .populate('category questions');
        if (!quizzes.length) throw new Error('No quizzes found');
        res.status(200).json(quizzes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getQuizzesByNotes = async (req, res) => {
    try {
        const categories = await Category.find({ category: req.params.id });
        if (!categories.length) throw new Error('No category found!');

        const quizzes = await Quiz.find({ category: { $in: categories } });
        if (!quizzes.length) throw new Error('No quizzes found!');

        res.status(200).json(quizzes);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createQuiz = async (req, res) => {
    const { title, description, category, created_by } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ msg: 'There are missing info!' });
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

        // Get subscribers from the API Gateway using axios
        const { data: subscribers } = await axios.get(`${process.env.API_GATEWAY_URL}/api/subscribed-users`);

        console.log(subscribers);
        const clientURL = req.headers.origin;
        console.log(clientURL);

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

        res.status(200).json({ msg: 'Deleted!' });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteVideo = async (req, res) => {
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
