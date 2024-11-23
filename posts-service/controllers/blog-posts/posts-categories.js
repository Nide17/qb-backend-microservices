const PostsCategory = require("../../models/blog-posts/PostsCategory.js");

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find postsCategory by ID
const findPostsCategoryById = async (id, res, selectFields = '') => {
    try {
        const postsCategory = await PostsCategory.findById(id).select(selectFields);
        if (!postsCategory) return res.status(404).json({ msg: 'No postsCategory found!' });
        return postsCategory;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getPostsCategories = async (req, res) => {
    try {
        const postsCategories = await PostsCategory.find().sort({ createdAt: -1 });
        if (!postsCategories) return res.status(404).json({ msg: 'No postsCategories found!' });
        res.status(200).json(postsCategories);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOnePostsCategory = async (req, res) => {
    const postsCategory = await findPostsCategoryById(req.params.id, res);
    if (postsCategory) res.status(200).json(postsCategory);
};

exports.createPostsCategory = async (req, res) => {

    const { title, answer, created_by } = req.body

    // Simple validation
    if (!title || !created_by || !answer) {
        return res.status(400).json({ msg: 'Please fill required fields' })
    }

    try {
        const newPostsCategory = new PostsCategory({
            title,
            answer,
            created_by
        })

        const savedPostsCategory = await newPostsCategory.save()
        if (!savedPostsCategory) throw Error('Something went wrong during creation!')

        res.status(200).json({
            _id: savedPostsCategory._id,
            title: savedPostsCategory.title,
            created_by: savedPostsCategory.created_by,
            answer: savedPostsCategory.answer,
            createdAt: savedPostsCategory.createdAt
        })

    } catch (err) {
        handleError(res, err);
    }
};

exports.updatePostsCategory = async (req, res) => {
    try {
        const postsCategory = await PostsCategory.findById(req.params.id);
        if (!postsCategory) return res.status(404).json({ msg: 'PostsCategory not found!' });

        const updatedPostsCategory = await PostsCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPostsCategory);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deletePostsCategory = async (req, res) => {
    try {
        const postsCategory = await PostsCategory.findById(req.params.id);
        if (!postsCategory) throw Error('PostsCategory not found!');

        const removedPostsCategory = await PostsCategory.deleteOne({ _id: req.params.id });
        if (removedPostsCategory.deletedCount === 0) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: "Deleted successfully!" });
    } catch (err) {
        handleError(res, err);
    }
};