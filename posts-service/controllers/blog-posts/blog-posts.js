const axios = require('axios');
const { S3 } = require("@aws-sdk/client-s3")
const BlogPost = require("../../models/blog-posts/BlogPost.js");
const { handleError, asyncHandler } = require('../../utils/error');

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL;

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION
})

// Helper function to call other services
const callService = async (url) => {
    try {
        const response = await axios.get(url, { 
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data?.data || response.data;
    } catch (error) {
        // Enhanced error logging with more context
        const errorDetails = {
            url,
            service: 'posts-service',
            timestamp: new Date().toISOString(),
            errorType: error.code || error.name || 'Unknown',
            message: error.message,
            statusCode: error.response?.status,
            responseData: error.response?.data
        };
        
        // Log different error types with appropriate levels
        if (error.code === 'ECONNREFUSED') {
            console.error('🔴 SERVICE DOWN - Target service not responding:', errorDetails);
        } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            console.error('🔴 CONNECTION ERROR - Network issue:', errorDetails);
        } else if (error.code === 'ECONNABORTED') {
            console.warn('⏱️  TIMEOUT - Service took too long to respond:', errorDetails);
        } else {
            console.warn('⚠️  SERVICE CALL FAILED:', errorDetails);
        }
        
        return null;
    }
};

// Simple population function for users
const populateUser = async (userId) => {
    if (!userId) return null;
    const userData = await callService(`${USERS_SERVICE_URL}/api/users/${userId}`);
    return userData ? {
        _id: userData._id,
        name: userData.name,
        email: userData.email
    } : { _id: userId, name: 'Unknown User' };
};

// Populate multiple blog posts
const populateBlogPosts = async (blogPosts) => {
    if (!blogPosts || blogPosts.length === 0) return blogPosts;
    
    // Convert to plain objects to avoid mongoose issues
    const plainPosts = blogPosts.map(post => post.toObject ? post.toObject() : post);
    
    for (let blogPost of plainPosts) {
        if (blogPost.creator) {
            blogPost.creator = await populateUser(blogPost.creator);
        }
    }
    return plainPosts;
};

// Populate single blog post
const populateBlogPost = async (blogPost) => {
    if (!blogPost) return blogPost;
    
    // Convert to plain object to avoid mongoose issues
    const plainPost = blogPost.toObject ? blogPost.toObject() : blogPost;
    
    if (plainPost.creator) {
        plainPost.creator = await populateUser(plainPost.creator);
    }
    return plainPost;
};

exports.getBlogPosts = asyncHandler(async (req, res) => {
    let blogPosts = await BlogPost.find().sort({ createdAt: -1 })
        .populate('postCategory', 'title');
    
    if (!blogPosts || blogPosts.length === 0) {
        return res.status(204).json({
            success: false,
            error: 'No Blog Posts Found',
            message: 'No blog posts found',
            code: 'NO_POSTS_FOUND',
            timestamp: new Date().toISOString()
        });
    }

    // Populate creator data for each blog post
    blogPosts = await populateBlogPosts(blogPosts);
    res.status(200).json({
        success: true,
        data: blogPosts,
        count: blogPosts.length,
        timestamp: new Date().toISOString()
    });
});

exports.getOneBlogPost = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    let blogPost = await BlogPost.findOne(query)
        .populate('postCategory', 'title');

    if (!blogPost) {
        return res.status(404).json({
            success: false,
            error: 'Blog Post Not Found',
            message: 'Blog post not found',
            code: 'BLOG_POST_NOT_FOUND',
            timestamp: new Date().toISOString()
        });
    }

    // Populate creator data for the blog post
    blogPost = await populateBlogPost(blogPost);
    res.status(200).json({
        success: true,
        data: blogPost,
        timestamp: new Date().toISOString()
    });
});

exports.getBlogPostsByCategory = asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Category id not provided',
            code: 'MISSING_CATEGORY_ID',
            timestamp: new Date().toISOString()
        });
    }

    let blogPosts = await BlogPost.find({ postCategory: id }).sort({ createdAt: -1 })
        .populate('postCategory', 'title');
    
    if (!blogPosts || blogPosts.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'Blog Posts Not Found For This Category',
            message: 'No blog posts found for this category',
            code: 'NO_POSTS_IN_CATEGORY',
            timestamp: new Date().toISOString()
        });
    }

    // Populate creator data for each blog post
    blogPosts = await populateBlogPosts(blogPosts);
    res.status(200).json({
        success: true,
        data: blogPosts,
        count: blogPosts.length,
        timestamp: new Date().toISOString()
    });
});

exports.getCreatedBy = async (req, res) => {
    try {
        const blogPosts = await BlogPost.find({ owner: req.params.id }).sort({ createdAt: -1 });
        if (!blogPosts) return res.status(404).json({ message: 'No blogPosts found!' });
        res.status(200).json(blogPosts);
    } catch (err) {
        handleError(res, err);
    }
}

exports.createBlogPost = async (req, res) => {
    const bp_image = req.file ? req.file : null
    const { title, markdown, postCategory, creator, bgColor } = req.body

    // Simple validation
    if (!title || !markdown || !postCategory || !creator) {
        return res.status(400).json({ message: 'Please provide all required fields' })
    }

    try {
        const newBlogPost = new BlogPost({
            title,
            post_image: bp_image && bp_image.location,
            markdown,
            postCategory,
            creator,
            bgColor
        })

        const savedBlogPost = await newBlogPost.save()

        if (!savedBlogPost) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong during creation! file size should not exceed 1MB'
            });
        }

        res.status(200).json({
            _id: savedBlogPost._id,
            title: savedBlogPost.title,
            post_image: savedBlogPost.post_image,
            markdown: savedBlogPost.markdown,
            postCategory: savedBlogPost.postCategory,
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
        if (!blogPost) return res.status(404).json({ message: 'BlogPost not found!' });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateBlogPostStatus = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) return res.status(404).json({ message: 'BlogPost not found!' });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteBlogPost = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id)
        if (!blogPost) {
            return res.status(404).json({
                success: false,
                message: 'BlogPost is not found!'
            });
        }

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
                return res.status(400).json({ message: 'Failed to delete! ' + err.message });
            }
        }

        const removedBlogPost = await blogPost.deleteOne()
        if (!removedBlogPost) {
            return res.status(500).json({
                success: false,
                message: 'Something went wrong while deleting!'
            });
        }

        res.status(200).json({ message: 'BlogPost deleted successfully!' });
    } catch (err) {
        handleError(res, err);
    }
};

exports.deleteBlogPostImage = async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);
        if (!blogPost) return res.status(404).json({ message: 'BlogPost not found!' });

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, { blogPost_image: '' }, { new: true });
        res.status(200).json(updatedBlogPost);
    } catch (error) {
        handleError(res, error);
    }
};
