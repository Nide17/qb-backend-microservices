const express = require("express")
const { getPostsCategories, getOnePostsCategory, createPostsCategory, updatePostsCategory, deletePostsCategory } = require("../../controllers/blog-posts/posts-categories")
const { authRole } = require("../../middlewares/auth")

const router = express.Router()

// GET routes
router.get("/", getPostsCategories)
router.get("/:id", getOnePostsCategory)

// POST routes
router.post("/", authRole(['Creator', 'Admin', 'SuperAdmin']), createPostsCategory)

// PUT routes
router.put("/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), updatePostsCategory)

// DELETE routes
router.delete("/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), deletePostsCategory)

module.exports = router