const express = require("express")
const mongoose = require('mongoose')
const { getBlogPosts, getOneBlogPost, getBlogPostsByCategory, createBlogPost, updateBlogPost, deleteBlogPost } = require("../../controllers/blog-posts/blog-posts")
const { authRole } = require("../../middlewares/auth")
const { blogPostUpload } = require("../../middlewares/blogPostUpload")

const router = express.Router()

// ObjectId validation middleware
const validateObjectId = (paramName = 'id') => (req, res, next) => {
    const id = req.params[paramName];
    
    // For getOneBlogPost, allow both ObjectId and slug formats
    if (paramName === 'id' && req.route.path === '/:id') {
        // This is the getOneBlogPost route, allow both formats
        return next();
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Invalid id format',
            code: 'INVALID_OBJECT_ID',
            timestamp: new Date().toISOString()
        });
    }
    next();
};

// GET routes
router.get("/", getBlogPosts)
router.get("/post-category/:id", validateObjectId('id'), getBlogPostsByCategory)
router.get("/:id", getOneBlogPost)  // Special case - handles both slug and ObjectId

// POST routes
router.post("/", authRole(['Creator', 'Admin', 'SuperAdmin']), blogPostUpload.single("post_image"), createBlogPost)

// PUT routes
router.put("/:id", validateObjectId('id'), authRole(['Creator', 'Admin', 'SuperAdmin']), updateBlogPost)

// DELETE routes
router.delete("/:id", validateObjectId('id'), authRole(['Creator', 'Admin', 'SuperAdmin']), deleteBlogPost)

module.exports = router