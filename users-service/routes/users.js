const express = require("express")
const { getUsers, loadUser, getOneUser, login, register, verifyOTP, logout, updateProfile, updateUser, deleteUser, sendResetLink, sendNewPassword, updateProfileImage
} = require("../controllers/users")
const { auth, authRole } = require("../middlewares/auth")
const { profileUpload } = require('../utils/profileUpload.js')

const router = express.Router()

// GET routes
router.get("/", getUsers)
router.get("/loadUser", auth, loadUser)
router.get("/:id", authRole(['SuperAdmin']), getOneUser)

// POST routes
router.post("/login", login)
router.post("/logout", logout)
router.post("/register", register)
router.post("/verifyOTP", verifyOTP)
router.post("/sendResetLink", sendResetLink)
router.post("/sendNewPassword", sendNewPassword)

// PUT routes
router.put("/updateProfileImage/:id", auth, profileUpload.single("profilePicture"), updateProfileImage)
router.put("/updateProfile/:id", auth, updateProfile)
router.put("/:id", authRole(['SuperAdmin']), updateUser)

// DELETE routes
router.delete("/:id", authRole(['SuperAdmin']), deleteUser)

module.exports = router