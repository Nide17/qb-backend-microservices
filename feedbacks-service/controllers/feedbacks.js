const Feedback = require("../models/Feedback");
const { handleError } = require('../utils/error');

// Helper function to find feedback by ID
const findFeedbackById = async (id, res, selectFields = '') => {
    try {
        let feedback = await Feedback.findById(id).select(selectFields);
        if (!feedback) return res.status(404).json({ msg: 'No feedback found!' });

        feedback = await feedback.populateDetails();
        return feedback;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function for pagination
const getPagination = (pageNo, pageSize) => {
    const limit = pageSize;
    const skip = pageSize * (pageNo - 1);
    return { limit, skip };
};

exports.getFeedbacks = async (req, res) => {

    const totalPages = await Feedback.countDocuments({});
    const PAGE_SIZE = 20;
    const pageNo = parseInt(req.query.pageNo || "0");
    const query = getPagination(pageNo, PAGE_SIZE);

    try {
        const feedbacks = pageNo > 0 ?
            await Feedback.find({}, {}, query).sort({ createdAt: -1 }).exec() :
            await Feedback.find().sort({ createdAt: -1 }).exec();

        if (!feedbacks) throw Error('No feedbacks exist');

        const feedbacksWithDetails = await Promise.all(feedbacks.map(async (feedback) => await feedback.populateDetails()));

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
