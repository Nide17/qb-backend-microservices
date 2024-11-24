const Faq = require("../models/Faq");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find faq by ID
const findFaqById = async (id, res, selectFields = '') => {
    try {
        const faq = await Faq.findById(id).select(selectFields);
        if (!faq) return res.status(404).json({ msg: 'No faq found!' });
        return faq;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to handle findByIdAndUpdate operations
const handleFindByIdAndUpdate = async (id, update, res) => {
    try {
        const faq = await Faq.findById(id);
        if (!faq) return res.status(404).json({ msg: 'Faq not found!' });

        const updatedFaq = await Faq.findByIdAndUpdate(id, update, { new: true });
        res.status(200).json(updatedFaq);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find().sort({ createdAt: -1 });
        if (!faqs) return res.status(404).json({ msg: 'No faqs found!' });
        res.status(200).json(faqs);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneFaq = async (req, res) => {
    const faq = await findFaqById(req.params.id, res);
    if (faq) res.status(200).json(faq);
};

exports.getCreatedBy = async (req, res) => {
    try {
        const faqs = await Faq.find({ created_by: req.params.id }).sort({ createdAt: -1 });
        if (!faqs) return res.status(404).json({ msg: 'No faqs found!' });
        res.status(200).json(faqs);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createFaq = async (req, res) => {
    const { title, answer, created_by } = req.body;

    // Simple validation
    if (!title || !created_by || !answer) {
        return res.status(400).json({ msg: 'Please fill required fields' });
    }

    try {
        const newFaq = new Faq({ title, answer, created_by });
        const savedFaq = await newFaq.save();
        if (!savedFaq) throw Error('Something went wrong during creation!');

        res.status(200).json({
            _id: savedFaq._id,
            title: savedFaq.title,
            created_by: savedFaq.created_by,
            answer: savedFaq.answer,
            createdAt: savedFaq.createdAt
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.addFaqVidLink = async (req, res) => {
    await handleFindByIdAndUpdate(req.params.id, { $push: { video_links: req.body } }, res);
};

exports.updateFaq = async (req, res) => {
    await handleFindByIdAndUpdate(req.params.id, req.body, res);
};

exports.deleteFaq = async (req, res) => {
    try {
        const faq = await Faq.findById(req.params.id);
        if (!faq) throw Error('Faq not found!');

        const removedFaq = await Faq.deleteOne({ _id: req.params.id });
        if (removedFaq.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteFaqVideo = async (req, res) => {
    await handleFindByIdAndUpdate(req.params.id, { $pull: { video_links: req.body } }, res);
};