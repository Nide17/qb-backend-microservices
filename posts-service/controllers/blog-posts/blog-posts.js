const { S3 } = require("@aws-sdk/client-s3")
const BlogPost = require("../../models//blog-posts/BlogPost.js");

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION
})

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message });

exports.getBlogPosts = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find().sort({ createdAt: -1 })
            .populate('postsCategory creator')
        if (!blogPosts) return res.status(404).json({ msg: 'No blogPosts found!' });
        res.status(200).json(blogPosts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneBlogPost = async (req, res) => {
    const blogPost = await BlogPost.findOne({ slug: req.params.slug })
        .populate('postsCategory creator')
    if (blogPost) res.status(200).json(blogPost);
};

exports.getBlogPostsByCategory = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find({ category: req.params.id }).sort({ createdAt: -1 })
            .populate('postsCategory creator')
        if (!blogPosts) return res.status(404).json({ msg: 'No blogPosts found!' });
        res.status(200).json(blogPosts);
    } catch (err) {
        handleError(res, err);
    }
}

exports.getCreatedBy = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find({ owner: req.params.id }).sort({ createdAt: -1 });
        if (!blogPosts) return res.status(404).json({ msg: 'No blogPosts found!' });
        res.status(200).json(blogPosts);
    } catch (err) {
        handleError(res, err);
    }
}

exports.createBlogPost = async (req, res) => {

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
}

exports.updateBlogPost = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) return res.status(404).json({ msg: 'BlogPost not found!' });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateBlogPostStatus = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) return res.status(404).json({ msg: 'BlogPost not found!' });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteBlogPost = async (req, res) => {
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

exports.deleteBlogPostImage = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) return res.status(404).json({ msg: 'BlogPost not found!' });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, { blogPost_image: '' }, { new: true });
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        handleError(res, error);
    }
};
