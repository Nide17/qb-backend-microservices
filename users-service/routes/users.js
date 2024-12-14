const express = require("express")
const { getUsers, loadUser, getOneUser, getAdminsEmails, login, register, verifyOTP, logout, updateProfile, updateUser, deleteUser, sendResetLink, sendNewPassword, updateProfileImage
} = require("../controllers/users")
const { auth, authRole } = require("../middlewares/auth")
const { profileUpload } = require('../utils/profileUpload.js')

const router = express.Router()

// GET routes
router.get("/", auth, getUsers)
router.get("/loadUser", auth, loadUser)
router.get("/admins-emails", getAdminsEmails)
router.get("/:id", getOneUser)

// POST routes
router.post("/login", login)
router.post("/logout", logout)
router.post("/register", register)
router.post("/verify-otp", verifyOTP)
router.post("/forgot-password", sendResetLink)
router.post("/reset-password", sendNewPassword)

// PUT routes
router.put("/user-image/:id", auth, profileUpload.single("profilePicture"), updateProfileImage)
router.put("/user-details/:id", auth, updateProfile)
router.put("/:id", authRole(['SuperAdmin']), updateUser)

// DELETE routes
router.delete("/:id", authRole(['SuperAdmin']), deleteUser)

module.exports = router