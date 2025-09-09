const express = require("express")
const { getDownloads, getDownloadsByUser, getDownloadsForNotesCreator, getTopUsersByDownloads, createDownload, deleteDownload, getDatabaseStats } = require("../controllers/downloads")
const { auth, authRole } = require("../middlewares/auth")
const { validateObjectId } = require("../middlewares/validation")

const router = express.Router()

// GET routes
router.get("/", getDownloads)
router.get("/top-users", getTopUsersByDownloads)
router.get("/notes-creator/:id", validateObjectId(), authRole(['Creator', 'Admin', 'SuperAdmin']), getDownloadsForNotesCreator)
router.get("/downloaded-by/:id", validateObjectId(), auth, getDownloadsByUser)
router.get("/db-stats", getDatabaseStats)

// POST routes
router.post("/", createDownload)

// DELETE routes
router.delete("/:id", validateObjectId(), authRole(['Creator', 'Admin', 'SuperAdmin']), deleteDownload)

module.exports = router