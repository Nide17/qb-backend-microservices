const QuestionComment = require("../models/QuestionComment");
const axios = require('axios');
const { handleError } = require('../utils/error');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

// Helper function to populate sender and quiz fields
const populateSenderAndQuiz = async (questionComment) => {
    try {
        const sender = questionComment.sender ? await axios.get(`${API_GATEWAY_URL}/api/users/${questionComment.sender}`) : null;
        const question = questionComment.question ? await axios.get(`${API_GATEWAY_URL}/api/questions/${questionComment.question}`) : null;
        const quiz = questionComment.quiz ? await axios.get(`${API_GATEWAY_URL}/api/quizzes/${questionComment.quiz}`) : null;

        questionComment = questionComment.toObject();
        questionComment.sender = sender ? sender.data : null;
        questionComment.question = question ? question.data : null;
        questionComment.quiz = quiz ? quiz.data : null;

        return questionComment;
    } catch (error) {
        console.error('Error fetching sender and quiz:', error);
        return questionComment;
    }
};

// Helper function to find questionComment by ID
const findQuestionCommentById = async (id, res, selectFields = '') => {
    try {
        let questionComment = await QuestionComment.findById(id).select(selectFields);
        if (!questionComment) return res.status(404).json({ msg: 'No questionComment found!' });

        questionComment = await populateSenderAndQuiz(questionComment);

        return questionComment;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to update questionComment status
const updateQuestionCommentStatus = async (id, status, res) => {
    try {
        const questionComment = await QuestionComment.findById(id);
        if (!questionComment) return res.status(404).json({ msg: 'QuestionComment not found!' });

        const updatedQuestionComment = await QuestionComment.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json(updatedQuestionComment);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getQuestionsComments = async (req, res) => {
    try {
        let questionComments = await QuestionComment.find();

        for (let i = 0; i < questionComments.length; i++) {
            questionComments[i] = await populateSenderAndQuiz(questionComments[i]);
        }

        res.status(200).json(questionComments);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getPaginatedComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let questionComments = await QuestionComment.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await QuestionComment.countDocuments();

        for (let i = 0; i < questionComments.length; i++) {
            questionComments[i] = await populateSenderAndQuiz(questionComments[i]);
        }

        res.json({
            questionComments,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.getPendingComments = async (req, res) => {
    try {
        let questionComments = await QuestionComment.find({ status: 'Pending' });

        for (let i = 0; i < questionComments.length; i++) {
            questionComments[i] = await populateSenderAndQuiz(questionComments[i]);
        }

        res.status(200).json(questionComments);

    } catch (err) {
        handleError(res, err);
    }
};

exports.getCommentsByQuestion = async (req, res) => {
    try {
        const questionComments = await QuestionComment.find({ question: req.params.questionId });
        res.status(200).json(questionComments);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneQuestionComment = async (req, res) => {
    let questionComment = await findQuestionCommentById(req.params.id, res);

    questionComment = await populateSenderAndQuiz(questionComment);

    res.status(200).json(questionComment);
};

exports.getCommentsByQuiz = async (req, res) => {
    try {
        let questionComments = await QuestionComment.find({ quiz: req.params.quizId });

        for (let i = 0; i < questionComments.length; i++) {
            questionComments[i] = await populateSenderAndQuiz(questionComments[i]);
        }

        res.status(200).json(questionComments);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createQuestionComment = async (req, res) => {
    const { comment, sender, question, quiz } = req.body;

    // Simple validation
    if (!comment || !sender || !quiz || !question) {
        return res.status(400).json({ msg: 'There are empty fields' });
    }

    try {
        const newQuestionComment = new QuestionComment({
            comment,
            sender,
            question,
            quiz
        });

        const savedQuestionComment = await newQuestionComment.save();
        if (!savedQuestionComment) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedQuestionComment._id,
            comment: savedQuestionComment.comment,
            sender: savedQuestionComment.sender,
            question: savedQuestionComment.question,
            quiz: savedQuestionComment.quiz
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.approveQuestionsComment = async (req, res) => {
    await updateQuestionCommentStatus(req.params.id, 'Approved', res);
};

exports.rejectQuestionsComment = async (req, res) => {
    await updateQuestionCommentStatus(req.params.id, 'Rejected', res);
};

exports.updateQuestionComment = async (req, res) => {
    try {
        const questionComment = await QuestionComment.findById(req.params.id);
        if (!questionComment) return res.status(404).json({ msg: 'QuestionComment not found!' });

        const updatedQuestionComment = await QuestionComment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedQuestionComment);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteQuestionComment = async (req, res) => {
    try {
        const questionComment = await QuestionComment.findById(req.params.id);
        if (!questionComment) throw Error('QuestionComment not found!');

        const removedQuestionComment = await QuestionComment.deleteOne({ _id: req.params.id });
        if (removedQuestionComment.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
