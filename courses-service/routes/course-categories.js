const express = require("express")
const { getCategories, getOneCategory, createCategory, updateCategory, deleteCategory } = require("../controllers/course-categories")
const { auth, authRole } = require("../middlewares/auth")

const router = express.Router()

// GET routes
router.get("/", getCategories)
router.get("/:id", auth, getOneCategory)

// POST routes
router.post("/", authRole(['Creator', 'Admin', 'SuperAdmin']), createCategory)

// PUT routes
router.put("/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), updateCategory)

// DELETE routes
router.delete("/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), deleteCategory)

module.exports = router