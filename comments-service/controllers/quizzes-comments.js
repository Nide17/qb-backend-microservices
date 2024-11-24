const QuizComment = require("../models/QuizComment");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find quizComment by ID
const findQuizCommentById = async (id, res, selectFields = '') => {
    try {
        const quizComment = await QuizComment.findById(id).select(selectFields);
        if (!quizComment) return res.status(404).json({ msg: 'No quizComment found!' });
        return quizComment;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getQuizzesComments = async (req, res) => {

    try {
        const quizComments = await QuizComment.find();
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
        const quizComments = await QuizComment.find({ quiz: req.params.quizId });
        res.status(200).json(quizComments);
    } catch (err) {
        handleError(res, err);
    }
}

exports.createQuizComment = async (req, res) => {

    const { comment, quiz, sender } = req.body

    // Simple validation
    if (!comment || !sender || !quiz) {
        return res.status(400).json({ msg: 'Please fill required fields' })
    }

    try {
        const newQuizComment = new QuizComment({
            comment,
            quiz,
            sender
        })

        const savedQuizComment = await newQuizComment.save()
        if (!savedQuizComment) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedQuizComment._id,
            comment: savedQuizComment.comment,
            sender: savedQuizComment.sender,
            quiz: savedQuizComment.quiz
        })

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
