
import BlogPostsView from '../../models/blog-posts/BlogPostsView.js';
import scheduledReportMessage from './scheduledReport.js';
const { S3 } = require("@aws-sdk/client-s3");
const { handleError } = require('../../utils/error');

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION
});

// SCHEDULED REPORT MESSAGE
scheduledReportMessage();

// Helper function to find blogPostsView by ID
const findBlogPostsViewById = async (id, res, selectFields = '') => {
    try {
        let blogPostsView = await BlogPostsView.findById(id).select(selectFields);
        if (!blogPostsView) return res.status(404).json({ msg: 'No blogPostsView found!' });

        blogPostsView = await blogPostsView.populateViewer();
        return blogPostsView;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getBlogPostsViews = async (req, res) => {
    try {
        let blogPostsViews = await BlogPostsView.find().sort({ createdAt: -1 });
        if (!blogPostsViews) return res.status(404).json({ msg: 'No blogPostsViews found!' });

        blogPostsViews = await Promise.all(blogPostsViews.map(async (post) => await post.populateViewer()));
        res.status(200).json(blogPostsViews);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneBlogPostsView = async (req, res) => {
    let blogPostsView = await findBlogPostsViewById(req.params.id, res);
    if (blogPostsView) res.status(200).json(blogPostsView);
};

exports.getRecentTenViews = async (req, res) => {
    try {
        let blogPostsViews = await BlogPostsView.find({ postCategory: req.params.id }).sort({ createdAt: -1 }).limit(10);
        if (!blogPostsViews) return res.status(404).json({ msg: 'No blogPostsViews found!' });

        blogPostsViews = await Promise.all(blogPostsViews.map(async (post) => await post.populateViewer()));
        res.status(200).json(blogPostsViews);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createBlogPostsView = async (req, res) => {
    const { blogPost, viewer, device, country } = req.body;

    if (!blogPost) {
        return res.status(400).json({ msg: 'Blog post does not exist.' });
    }

    try {
        const newBlogPostView = new BlogPostsView({ blogPost, viewer, device, country });
        const savedBlogPost = await newBlogPostView.save();

        if (!savedBlogPost) throw Error('Something went wrong during creation! File size should not exceed 1MB');

        res.status(200).json({
            _id: savedBlogPost._id,
            blogPost: savedBlogPost.blogPost,
            viewer: savedBlogPost.viewer,
            device: savedBlogPost.device,
            country: savedBlogPost.country
        });

    } catch (err) {
        handleError(res, err);
    }
};

exports.updateBlogPostsView = async (req, res) => {
    try {
        let blogPostsView = await BlogPostsView.findById(req.params.id);
        if (!blogPostsView) return res.status(404).json({ msg: 'BlogPostsView not found!' });

        const updatedBlogPostsView = await BlogPostsView.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBlogPostsView);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteBlogPostsView = async (req, res) => {
    try {
        const blogPost = await BlogPostsView.findById(req.params.id);
        if (!blogPost) throw Error('BlogPost is not found!');

        if (blogPost.post_image) {
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: blogPost.post_image.split('/').pop() // if any sub folder -> path/of/the/folder.ext
            };

            try {
                await s3Config.deleteObject(params).promise();
                console.log(params.Key + ' deleted from ' + params.Bucket);
            } catch (err) {
                console.log('ERROR in file Deleting: ' + JSON.stringify(err));
                return res.status(400).json({
                    msg: 'Failed to delete! ' + err.message,
                    success: false
                });
            }
        }

        const removedBlogPost = await blogPost.deleteOne();

        if (!removedBlogPost) throw Error('Something went wrong while deleting!');

        res.status(200).json({ msg: 'Deleted successfully!' });
    } catch (err) {
        handleError(res, err);
    }
};