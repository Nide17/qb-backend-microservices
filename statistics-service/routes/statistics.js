const express = require("express")
const { get50NewUsers, getAllUsers, getUsersWithImage, getUsersWithSchool, getUsersWithLevel, getUsersWithFaculty, getUsersWithInterests, getUsersWithAbout, getTop100Quizzing, getTop100Downloaders, getTop20Quizzes, getQuizzesStats, getTop20Notes, getNotesStats, getQuizCategoriesStats, getNotesCategoriesStats, getDailyUserRegistration, getDashboardStats, updateDashboardStats, getLiveAnalytics, clearStatsCache, getSystemMetrics, getDatabaseMetrics, getPerformanceMetrics } = require("../controllers/statistics")
const { authRole } = require("../middlewares/auth")

const router = express.Router()

router.get("/all-users", authRole(['Admin', 'SuperAdmin']), getAllUsers)
router.get("/50-new-users", authRole(['Admin', 'SuperAdmin']), get50NewUsers)
router.get("/users-with-image", authRole(['Admin', 'SuperAdmin']), getUsersWithImage)
router.get("/users-with-school", authRole(['Admin', 'SuperAdmin']), getUsersWithSchool)
router.get("/users-with-level", authRole(['Admin', 'SuperAdmin']), getUsersWithLevel)
router.get("/users-with-faculty", authRole(['Admin', 'SuperAdmin']), getUsersWithFaculty)
router.get("/users-with-interests", authRole(['Admin', 'SuperAdmin']), getUsersWithInterests)
router.get("/users-with-about", authRole(['Admin', 'SuperAdmin']), getUsersWithAbout)
router.get("/top-100-quizzing", getTop100Quizzing)
router.get("/top-100-downloaders", authRole(['Admin', 'SuperAdmin']), getTop100Downloaders)
router.get("/top-20-quizzes", authRole(['Admin', 'SuperAdmin']), getTop20Quizzes)
router.get("/quizzes-stats", authRole(['Admin', 'SuperAdmin']), getQuizzesStats)
router.get("/top-20-notes", authRole(['Admin', 'SuperAdmin']), getTop20Notes)
router.get("/notes-stats", authRole(['Admin', 'SuperAdmin']), getNotesStats)
router.get("/quiz-categories-stats", authRole(['Admin', 'SuperAdmin']), getQuizCategoriesStats)
router.get("/notes-categories-stats", authRole(['Admin', 'SuperAdmin']), getNotesCategoriesStats)
router.get("/daily-user-registration", authRole(['Admin', 'SuperAdmin']), getDailyUserRegistration)

// New enhanced endpoints
router.get("/dashboard-stats", getDashboardStats)
router.post("/update-dashboard-stats", authRole(['Admin', 'SuperAdmin']), updateDashboardStats)
router.get("/live-analytics", authRole(['Admin', 'SuperAdmin']), getLiveAnalytics)
router.delete("/clear-cache", authRole(['SuperAdmin']), clearStatsCache)

// System performance endpoints
router.get("/system-metrics", authRole(['Admin', 'SuperAdmin']), getSystemMetrics)
router.get("/database-metrics", authRole(['Admin', 'SuperAdmin']), getDatabaseMetrics)
router.get("/performance-metrics", authRole(['Admin', 'SuperAdmin']), getPerformanceMetrics)

module.exports = router