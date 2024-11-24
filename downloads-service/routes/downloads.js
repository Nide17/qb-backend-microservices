const express = require("express")
const { getDownloads, getDownloadsByUser, getDownloadsForNotesCreator, createDownload, deleteDownload } = require("../controllers/downloads")
const { auth, authRole } = require("../middlewares/auth")

const router = express.Router()

// GET routes
router.get("/", authRole(['Creator', 'Admin', 'SuperAdmin']), getDownloads)
router.get("/notes-creator/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), getDownloadsForNotesCreator)
router.get("/downloaded-by/:id", auth, getDownloadsByUser)

// POST routes
router.post("/", createDownload)

// DELETE routes
router.delete("/:id", authRole(['Creator', 'Admin', 'SuperAdmin']), deleteDownload)

module.exports = router