const express = require("express")
const { getUsers, loadUser, getOneUser, login, register, verifyOTP, logout, updateProfile, updateUser, deleteUser, sendResetLink, sendNewPassword, updateProfileImage
} = require("../controllers/users")
const { auth, authRole } = require("../middlewares/auth")
const { profileUpload } = require('../utils/profileUpload.js')

const router = express.Router()

router.get("/", auth, getUsers)
router.get("/loadUser", auth, loadUser)
router.get("/:id", authRole(['SuperAdmin']), getOneUser)
router.post("/login", login)
router.post("/logout", logout)
router.post("/register", register)
router.post("/verifyOTP", verifyOTP)
router.post("/sendResetLink", sendResetLink)
router.post("/sendNewPassword", sendNewPassword)
router.put("/updateProfileImage/:id", auth, profileUpload.single("profilePicture"), updateProfileImage) // /user-image/:id
router.put("/updateProfile/:id", auth, updateProfile) //user-details/:id
router.put("/:id", authRole(['SuperAdmin']), updateUser)
router.delete("/:id", authRole(['SuperAdmin']), deleteUser)

module.exports = router