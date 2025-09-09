const PostCategory = require("../../models/blog-posts/PostCategory.js");
const { handleError } = require('../../utils/error');

// Helper function to find postCategory by ID
const findPostCategoryById = async (id, res, selectFields = '') => {
    try {
        const postCategory = await PostCategory.findById(id).select(selectFields);
        if (!postCategory) return res.status(404).json({ message: 'No postCategory found!' });
        return postCategory;
    } catch (err) {
        return handleError(res, err);
    }
};

// Helper function to validate request body
const validateRequestBody = (body, requiredFields) => {
    for (const field of requiredFields) {
        if (!body[field]) return `Please fill required fields: ${field}`;
    }
    return null;
};

exports.getPostCategories = async (req, res) => {
    try {
        const postCategories = await PostCategory.find().sort({ createdAt: -1 });
        if (!postCategories) return res.status(204).json({ message: 'No postCategories found!' });
        res.status(200).json(postCategories);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOnePostCategory = async (req, res) => {
    const postCategory = await findPostCategoryById(req.params.id, res);
    if (postCategory) res.status(200).json(postCategory);
};

exports.createPostCategory = async (req, res) => {
    const { title, answer, created_by } = req.body;

    const validationError = validateRequestBody(req.body, ['title', 'answer', 'created_by']);
    if (validationError) return res.status(400).json({ message: validationError });

    try {
        const newPostCategory = new PostCategory({ title, answer, created_by });
        const savedPostCategory = await newPostCategory.save();
        if (!savedPostCategory) return res.status(500).json({ message: 'Could not save post category, try again!' });

        res.status(200).json({
            _id: savedPostCategory._id,
            title: savedPostCategory.title,
            created_by: savedPostCategory.created_by,
            answer: savedPostCategory.answer,
            createdAt: savedPostCategory.createdAt
        });
    } catch (err) {
        handleError(res, err);
    }
};

exports.updatePostCategory = async (req, res) => {
    try {
        const postCategory = await PostCategory.findById(req.params.id);
        if (!postCategory) return res.status(404).json({ message: 'PostCategory not found!' });

        const updatedPostCategory = await PostCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPostCategory);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deletePostCategory = async (req, res) => {
    try {
        const postCategory = await PostCategory.findById(req.params.id);
        if (!postCategory) throw Error('PostCategory not found!');

        const removedPostCategory = await PostCategory.deleteOne({ _id: req.params.id });
        if (removedPostCategory.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ message: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};