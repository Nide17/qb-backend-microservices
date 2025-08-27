const QuizComment = require("../models/QuizComment");
const axios = require('axios');
const { handleError } = require('../utils/error');
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:5000';

// Helper function to populate sender and quiz fields
const populateSenderAndQuiz = async (quizComment) => {
    try {
        const sender = quizComment.sender ? await axios.get(`${API_GATEWAY_URL}/api/users/${quizComment.sender}`) : null;
        const quiz = quizComment.quiz ? await axios.get(`${API_GATEWAY_URL}/api/quizzes/${quizComment.quiz}`) : null;

        quizComment = quizComment.toObject();
        quizComment.sender = sender ? sender.data : null;
        quizComment.quiz = quiz ? quiz.data : null;

        return quizComment;
    } catch (error) {
        // console.error('Error fetching sender and quiz:', error);
        return quizComment;
    }
};

// Helper function to find quizComment by ID
const findQuizCommentById = async (id, res, selectFields = '') => {
    try {
        let quizComment = await QuizComment.findById(id).select(selectFields);
        if (!quizComment) return res.status(404).json({ msg: 'No quizComment found!' });

        quizComment = await populateSenderAndQuiz(quizComment);

        return quizComment;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate required fields
const validateRequiredFields = (fields, res) => {
    for (const field of fields) {
        if (!field.value) {
            res.status(400).json({ msg: `Please fill required field: ${field.name}` });
            return false;
        }
    }
    return true;
};

exports.getQuizzesComments = async (req, res) => {
    try {
        let quizComments = await QuizComment.find();
        
        for (let i = 0; i < quizComments.length; i++) {
            quizComments[i] = await populateSenderAndQuiz(quizComments[i]);
        }

        res.status(200).json(quizComments);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneQuizComment = async (req, res) => {
    const quizComment = await findQuizCommentById(req.params.id, res);
    if (quizComment) res.status(200).json(quizComment);
};

exports.getCommentsByQuiz = async (req, res) => {
    try {
        let quizComments = await QuizComment.find({ quiz: req.params.quizId });
        
        for (let i = 0; i < quizComments.length; i++) {
            quizComments[i] = await populateSenderAndQuiz(quizComments[i]);
        }

        res.status(200).json(quizComments);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createQuizComment = async (req, res) => {
    const { comment, quiz, sender } = req.body;

    // Simple validation
    if (!validateRequiredFields([{ name: 'comment', value: comment }, { name: 'quiz', value: quiz }, { name: 'sender', value: sender }], res)) return;

    try {
        const newQuizComment = new QuizComment({ comment, quiz, sender });
        const savedQuizComment = await newQuizComment.save();
        if (!savedQuizComment) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedQuizComment._id,
            comment: savedQuizComment.comment,
            sender: savedQuizComment.sender,
            quiz: savedQuizComment.quiz
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateQuizComment = async (req, res) => {
    try {
        const quizComment = await QuizComment.findById(req.params.id);
        if (!quizComment) return res.status(404).json({ msg: 'QuizComment not found!' });

        const updatedQuizComment = await QuizComment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedQuizComment);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteQuizComment = async (req, res) => {
    try {
        const quizComment = await QuizComment.findById(req.params.id);
        if (!quizComment) throw Error('QuizComment not found!');

        const removedQuizComment = await QuizComment.deleteOne({ _id: req.params.id });
        if (removedQuizComment.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
