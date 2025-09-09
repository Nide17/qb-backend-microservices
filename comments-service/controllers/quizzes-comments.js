const QuizComment = require("../models/QuizComment");
const axios = require("axios");
const { handleError } = require('../utils/error');

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;
const QUIZZING_SERVICE_URL = process.env.QUIZZING_SERVICE_URL;

// Helper function to populate sender and quiz fields
const populateSenderAndQuiz = async (quizComment) => {
    try {
        const fetchPromises = [
            quizComment.sender ? axios.get(`${USERS_SERVICE_URL}/api/users/${quizComment.sender}`, { 
                headers: { 'x-internal-service': 'true' }
            }) : Promise.resolve(null),
            quizComment.quiz ? axios.get(`${QUIZZING_SERVICE_URL}/api/quizzes/${quizComment.quiz}`, { 
                headers: { 'x-internal-service': 'true' }
            }) : Promise.resolve(null)
        ];

        const [senderResult, quizResult] = await Promise.allSettled(fetchPromises);

        quizComment = quizComment.toObject();
        quizComment.sender = senderResult.status === 'fulfilled' && senderResult.value ? senderResult.value.data : null;
        quizComment.quiz = quizResult.status === 'fulfilled' && quizResult.value ? quizResult.value.data : null;

        return quizComment;
    } catch (error) {
        console.log('Error in populateSenderAndQuiz:', error.message);
        return quizComment.toObject ? quizComment.toObject() : quizComment;
    }
};

// Helper function to find quizComment by ID
const findQuizCommentById = async (id, res, selectFields = '') => {
    try {
        let quizComment = await QuizComment.findById(id).select(selectFields);
        if (!quizComment) return res.status(404).json({ message: 'No quizComment found!' });

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
            res.status(400).json({ message: `Please fill required field: ${field.name}` });
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
        if (!savedQuizComment) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong during creation!'
            });
        }

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
        if (!quizComment) return res.status(404).json({ message: 'QuizComment not found!' });

        const updatedQuizComment = await QuizComment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedQuizComment);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteQuizComment = async (req, res) => {
    try {
        const quizComment = await QuizComment.findById(req.params.id);
        if (!quizComment) {
            return res.status(404).json({
                success: false,
                message: 'QuizComment not found!'
            });
        }

        const removedQuizComment = await QuizComment.deleteOne({ _id: req.params.id });
        if (removedQuizComment.deletedCount === 0) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong while deleting!'
            });
        }

        res.status(200).json({ message: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
