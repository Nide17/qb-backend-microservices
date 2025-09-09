const express = require("express")
const mongoose = require("mongoose")
const { getUsers, getLatestUsers, getAdminsCreators, loadUser, getOneUser, getAdminsEmails, login, register, verifyOTP, logout, updateProfile, updateUser, deleteUser, sendResetLink, sendNewPassword, updateProfileImage, getDailyUserRegistration, getDatabaseStats
} = require("../controllers/users")
const { auth, authRole } = require("../middlewares/auth")
const { profileUpload } = require('../utils/profileUpload.js')

const router = express.Router()

// Simple ObjectId validation middleware
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`,
                code: 'INVALID_OBJECT_ID',
                timestamp: new Date().toISOString()
            });
        }
        next();
    };
};

// GET routes
router.get("/", auth, getUsers)
router.get("/latest", getLatestUsers)
router.get("/admins-creators", getAdminsCreators)
router.get("/loadUser", auth, loadUser)
router.get("/admins-emails", getAdminsEmails)
router.get("/daily-user-registration", getDailyUserRegistration)
router.get("/db-stats", authRole(['Creator', 'Admin', 'SuperAdmin']), getDatabaseStats)
router.get("/:id", validateObjectId('id'), getOneUser)

// POST routes
router.post("/login", login)
router.post("/register", register)
router.post("/verify-otp", verifyOTP)
router.post("/forgot-password", sendResetLink)
router.post("/reset-password", sendNewPassword)

// PUT routes
router.put("/user-image/:id", auth, validateObjectId('id'), profileUpload.single("profilePicture"), updateProfileImage)
router.put("/user-details/:id", auth, validateObjectId('id'), updateProfile)
router.put("/logout", logout)
router.put("/:id", authRole(['SuperAdmin']), validateObjectId('id'), updateUser)

// DELETE routes
router.delete("/:id", authRole(['SuperAdmin']), validateObjectId('id'), deleteUser)

module.exports = router