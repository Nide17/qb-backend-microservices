const express = require("express")
const { getQuizzes, getPaginatedQuizzes, getOneQuiz, createQuiz, updateQuiz, deleteQuiz, getQuizzesByCategory, getQuizzesByNotes, addVidLink, deleteVideo, notifying, getDatabaseStats } = require("../controllers/quizzes")
const { auth, authRole } = require("../middlewares/auth")

const router = express.Router()

// GET routes
router.get("/", getQuizzes)
router.get("/paginated", getPaginatedQuizzes)
router.get("/category/:id", getQuizzesByCategory)
router.get("/course-notes/:id", getQuizzesByNotes)
router.get("/db-stats", authRole(['Admin', 'SuperAdmin']), getDatabaseStats)
router.get("/:id", getOneQuiz)

// POST routes
router.post("/", authRole(['Admin', 'SuperAdmin']), createQuiz)
router.post("/notifying", notifying)

// PUT routes
router.put("/:id", authRole(['Admin', 'SuperAdmin']), updateQuiz)
router.put("/add-video/:id", auth, addVidLink)

// DELETE routes
router.delete("/:id", authRole(['SuperAdmin']), deleteQuiz)
router.delete("/delete-video/:id", authRole(['SuperAdmin']), deleteVideo)

module.exports = router