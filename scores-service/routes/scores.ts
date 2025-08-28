import express from "express";


const { getScores, getScoresByTaker, getScoresForQuizCreator, getOneScore, getRanking, getPopularQuizzes, getMonthlyUser, createScore, deleteScore } = require("../controllers/scores")
const { auth, authRole } = require("../middlewares/auth")

const router = express.Router()

// GET routes
router.get("/", getScores)
router.get("/quiz-creator/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), getScoresForQuizCreator)
router.get("/ranking", getRanking)
router.get("/popular-quizes", getPopularQuizzes)
router.get("/monthly-user", getMonthlyUser)
router.get("/taken-by/:id", auth, getScoresByTaker)
router.get("/:id", getOneScore)

// POST routes
router.post("/", createScore)

// DELETE routes
router.delete("/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), deleteScore)

module.exports = router