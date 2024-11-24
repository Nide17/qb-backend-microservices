const express = require("express")
const { getQuestionsComments, getPaginatedComments, getPendingComments, getOneQuestionComment, getCommentsByQuiz, getCommentsByQuestion, createQuestionComment, updateQuestionComment, approveQuestionsComment, rejectQuestionsComment, deleteQuestionComment } = require("../controllers/questions-comments")
const { auth, authRole } = require("../middlewares/auth")

const router = express.Router()

// GET routes
router.get("/", getQuestionsComments)
router.get("/paginated", authRole(['Admin', 'SuperAdmin']), getPaginatedComments)
router.get("/pending", authRole(['Admin', 'SuperAdmin']), getPendingComments)
router.get("/quiz/:quizId", getCommentsByQuiz)
router.get("/question/:questionId", auth, getCommentsByQuestion)
router.get("/:id", getOneQuestionComment)

// POST routes
router.post("/", auth, createQuestionComment)

// PUT routes
router.put("/approve/:id/", authRole(['Admin', 'SuperAdmin']), approveQuestionsComment)
router.put("/reject/:id/", authRole(['Admin', 'SuperAdmin']), rejectQuestionsComment)
router.put("/:id", authRole(['Admin', 'SuperAdmin']), updateQuestionComment)

// DELETE routes
router.delete("/:id", authRole(['Admin', 'SuperAdmin']), deleteQuestionComment)

module.exports = router