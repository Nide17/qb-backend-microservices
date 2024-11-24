const Feedback = require("../models/Feedback");
const axios = require('axios');

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find feedback by ID
const findFeedbackById = async (id, res, selectFields = '') => {
    try {
        const feedback = await Feedback.findById(id).select(selectFields);
        if (!feedback) return res.status(404).json({ msg: 'No feedback found!' });
        return feedback;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getFeedbacks = async (req, res) => {

    // Pagination
    const totalPages = await Feedback.countDocuments({})
    var PAGE_SIZE = 20
    var pageNo = parseInt(req.query.pageNo || "0")
    var query = {}

    query.limit = PAGE_SIZE
    query.skip = PAGE_SIZE * (pageNo - 1)

    try {
        const feedbacks = pageNo > 0 ?
            await Feedback.find({}, {}, query).sort({ createdAt: -1 }).exec() :
            await Feedback.find().sort({ createdAt: -1 }).exec();

        if (!feedbacks) throw Error('No feedbacks exist');

        const feedbacksWithDetails = await Promise.all(feedbacks.map(async feedback => {

            // Will fetch quiz, score and user details for each feedback using api gateway later
            const quiz = await axios.get(`${API_GATEWAY_URL}/quizzes/${feedback.quiz}`);
            const score = await axios.get(`${API_GATEWAY_URL}/scores/${feedback.score}`);
            const user = score && await axios.get(`${API_GATEWAY_URL}/users/${score.data.taken_by}`);

            return {
                ...feedback.toObject(),
                quiz: quiz.data,
                score: score && {
                    ...score.data,
                    taken_by: user && user.data
                }
            };
        }));

        if (pageNo > 0) {
            res.status(200).json({
                feedbacks: feedbacksWithDetails,
                totalPages: Math.ceil(totalPages / PAGE_SIZE)
            });
        } else {
            res.status(200).json(feedbacksWithDetails);
        }
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneFeedback = async (req, res) => {
    const feedback = await findFeedbackById(req.params.id, res);
    if (feedback) res.status(200).json(feedback);
};

exports.createFeedback = async (req, res) => {

    try {
        const newFeedback = new Feedback(req.body);
        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (err) {
        handleError(res, err);
    }
};

exports.updateFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ msg: 'Feedback not found!' });

        const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedFeedback);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) throw Error('Feedback not found!');

        const removedFeedback = await Feedback.deleteOne({ _id: req.params.id });
        if (removedFeedback.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};
