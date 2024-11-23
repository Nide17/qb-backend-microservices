const BlogPostsView = require("../../models/blog-posts/BlogPostsView");
const scheduledReportMessage = require('./scheduledReport')
const { S3 } = require("@aws-sdk/client-s3")

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION
})

// SCHEDULED REPORT MESSAGE
scheduledReportMessage()

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

// Helper function to find blogPostsView by ID
const findBlogPostsViewById = async (id, res, selectFields = '') => {
    try {
        const blogPostsView = await BlogPostsView.findById(id).select(selectFields);
        if (!blogPostsView) return res.status(404).json({ msg: 'No blogPostsView found!' });
        return blogPostsView;
    } catch (err) {
        return handleError(res, err);
    }
};

exports.getBlogPostsViews = async (req, res) => {
    try {
        const blogPostsViews = await BlogPostsView.find().sort({ createdAt: -1 });
        if (!blogPostsViews) return res.status(404).json({ msg: 'No blogPostsViews found!' });
        res.status(200).json(blogPostsViews);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneBlogPostsView = async (req, res) => {
    const blogPostsView = await findBlogPostsViewById(req.params.id, res);
    if (blogPostsView) res.status(200).json(blogPostsView);
};

exports.getRecentTenViews = async (req, res) => {
    try {
        const blogPostsViews = await BlogPostsView.find({ postsCategory: req.params.id }).sort({ createdAt: -1 }).limit(10);
        if (!blogPostsViews) return res.status(404).json({ msg: 'No blogPostsViews found!' });
        res.status(200).json(blogPostsViews);
    } catch (err) {
        handleError(res, err);
    }
};

exports.createBlogPostsView = async (req, res) => {

    const bp_image = req.file ? req.file : null
    const { title, markdown, postsCategory, creator, bgColor } = req.body

    // Simple validation
    if (!title || !markdown || !postsCategory || !creator) {
        return res.status(400).json({ msg: title })
    }

    try {
        const newBlogPost = new BlogPost({
            title,
            post_image: bp_image && bp_image.location,
            markdown,
            postsCategory,
            creator,
            bgColor
        })

        const savedBlogPost = await newBlogPost.save()

        if (!savedBlogPost) throw Error('Something went wrong during creation! file size should not exceed 1MB')

        res.status(200).json({
            _id: savedBlogPost._id,
            title: savedBlogPost.title,
            post_image: savedBlogPost.post_image,
            markdown: savedBlogPost.markdown,
            postsCategory: savedBlogPost.postsCategory,
            creator: savedBlogPost.creator,
            bgColor: savedBlogPost.bgColor,
            slug: savedBlogPost.slug
        })

    } catch (err) {
        handleError(res, err);
    }
};

exports.updateBlogPostsView = async (req, res) => {
    try {
        const blogPostsView = await BlogPostsView.findById(req.params.id);
        if (!blogPostsView) return res.status(404).json({ msg: 'BlogPostsView not found!' });

        const updatedBlogPostsView = await BlogPostsView.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBlogPostsView);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteBlogPostsView = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id)
        if (!blogPost) throw Error('BlogPost is not found!')

        if (blogPost.post_image) {
            const params = {
                Bucket: process.env.S3_BUCKET || config.get('S3Bucket'),
                Key: blogPost.post_image.split('/').pop() //if any sub folder-> path/of/the/folder.ext
            }

            try {
                s3Config.deleteObject(params, (err, data) => {
                    if (err) {
                        res.status(400).json({ msg: err.message })
                        console.log(err, err.stack) // an error occurred
                    }
                    else {
                        res.status(200).json({ msg: 'deleted!' })
                        console.log(params.Key + ' deleted from ' + params.Bucket)
                    }
                })

            }
            catch (err) {
                console.log('ERROR in file Deleting : ' + JSON.stringify(err))
                res.status(400).json({
                    msg: 'Failed to delete! ' + err.message,
                    success: false
                })
            }
        }

        const removedBlogPost = await blogPost.deleteOne()

        if (!removedBlogPost)
            throw Error('Something went wrong while deleting!')
    } catch (err) {
        handleError(res, err);
    }
};