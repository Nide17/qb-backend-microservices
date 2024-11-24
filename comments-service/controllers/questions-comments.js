const QuestionComment = require("../models/QuestionComment");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find questionComment by ID
const findQuestionCommentById = async (id, res, selectFields = '') => {
    try {
        const questionComment = await QuestionComment.findById(id).select(selectFields);
        if (!questionComment) return res.status(404).json({ msg: 'No questionComment found!' });
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
        const questionComments = await QuestionComment.find();
        res.status(200).json(questionComments);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getPaginatedComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const questionComments = await QuestionComment.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await QuestionComment.countDocuments();
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
        const questionComments = await QuestionComment.find({ status: 'Pending' });
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
    const questionComment = await findQuestionCommentById(req.params.id, res);
    if (questionComment) res.status(200).json(questionComment);
};

exports.getCommentsByQuiz = async (req, res) => {
    try {
        const questionComments = await QuestionComment.find({ quiz: req.params.quizId });
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
