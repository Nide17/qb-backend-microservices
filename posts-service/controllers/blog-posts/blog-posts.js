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
        let blogPosts = await BlogPost.find().sort({ createdAt: -1 })
            .populate('postsCategory');
        if (!blogPosts) return res.status(404).json({ msg: 'No blogPosts found!' });

        blogPosts = await Promise.all(blogPosts.map(async (post) => await post.populateCreator()));
        res.status(200).json(blogPosts);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getOneBlogPost = async (req, res) => {
    try {
        let blogPost = await BlogPost.findOne({ slug: req.params.slug })
            .populate('postsCategory');
        if (!blogPost) return res.status(404).json({ msg: 'BlogPost not found!' });

        blogPost = await blogPost.populateCreator();
        res.status(200).json(blogPost);
    } catch (err) {
        handleError(res, err);
    }
};

exports.getBlogPostsByCategory = async (req, res) => {
    try {
        let blogPosts = await BlogPost.find({ postsCategory: req.params.id }).sort({ createdAt: -1 })
            .populate('postsCategory');
        if (!blogPosts) return res.status(404).json({ msg: 'No blogPosts found!' });

        blogPosts = await Promise.all(blogPosts.map(async (post) => await post.populateCreator()));
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
        return res.status(400).json({ msg: 'Please provide all required fields' })
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
                Bucket: process.env.S3_BUCKET,
                Key: blogPost.post_image.split('/').pop()
            }

            try {
                await s3Config.deleteObject(params).promise();
                console.log(params.Key + ' deleted from ' + params.Bucket);
            } catch (err) {
                console.log('ERROR in file Deleting : ' + JSON.stringify(err));
                return res.status(400).json({ msg: 'Failed to delete! ' + err.message });
            }
        }

        const removedBlogPost = await blogPost.deleteOne()
        if (!removedBlogPost) throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: 'BlogPost deleted successfully!' });
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
