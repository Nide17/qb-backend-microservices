import * as bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import * as crypto from 'crypto';

// Import dependencies



const { S3 } = require("@aws-sdk/client-s3")
const { sendEmail } = require("../utils/emails/sendEmail")
import User from '../models/User.js'
import PswdResetToken from '../models/PswdResetToken.js'
const { handleError } = require("../utils/error")

// Configure S3
const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
})

// Helper functions
const generateToken = (user) => {
    return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' })
}

const updateUserToken = async (user, token) => {
    return await User.findByIdAndUpdate({ _id: user._id }, { $set: { current_token: token } }, { new: true })
}

const sendOtpEmail = async (user, otp) => {
    await sendEmail(user.email,
        "One Time Password (OTP) verification for Quiz Blog account",
        { name: user.name, otp }, "./template/otp.handlebars")
}

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    if (!salt) throw Error('Something went wrong with bcrypt')
    const hash = await bcrypt.hash(password, salt)
    if (!hash) throw Error('Something went wrong hashing the password')
    return hash
}

// Get all users
exports.getUsers = async (req, res) => {
    try {
        let users = await User.find().sort({ register_date: -1 })
        if (!users.length) return res.status(404).json({ msg: 'No users found!' })
        // users = await Promise.all(users.map(async (user) => await user.populateSchoolData()));
        res.status(200).json(users)
    } catch (err) {
        handleError(res, err)
    }
}

// Get 8 latest users
exports.getLatestUsers = async (req, res) => {
    try {
        let users = await User.find().sort({ register_date: -1 }).limit(8)
        if (!users.length) return res.status(404).json({ msg: 'No users found!' })
        users = await Promise.all(users.map(async (user) => await user.populateSchoolData()));
        res.status(200).json(users)
    } catch (err) {
        handleError(res, err)
    }
}

// Get Admin and Creators users
exports.getAdminsCreators = async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['Admin', 'SuperAdmin', 'Creator'] } })
        if (!users.length) return res.status(404).json({ msg: 'No users found!' })
        const adminsCreators = await Promise.all(users.map(async (user) => await user.populateSchoolData()));
        res.status(200).json(adminsCreators)
    } catch (err) {
        handleError(res, err)
    }
}

// Get one user by ID
exports.getOneUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id).select('name email')
        if (!user) return res.status(404).json({ msg: 'No user found!' })
        user = await user.populateSchoolData()
        return res.status(200).json(user)
    } catch (err) {
        return handleError(res, err)
    }
}

// Load user by token
exports.loadUser = async (req, res) => {
    const id = req.user && req.user._id
    if (!id) return res.status(400).json({ msg: 'No token, authorization Denied' })
    try {
        let user = await User.findById(id).select('-password -__v')
        if (!user) return res.status(204).json({ msg: 'No active session!' })
        user = await user.populateSchoolData()
        return res.status(200).json(user)
    } catch (err) {
        handleError(res, err)
    }
}

// Get emails of all admins
exports.getAdminsEmails = async (req, res) => {
    try {
        const admins = await User.find({ role: { $in: ['Admin', 'SuperAdmin'] } }).select('email')
        if (!admins) return res.status(404).json({ msg: 'No admins found!' })
        const adminEmails = admins.map(admin => admin.email)
        return res.status(200).json(adminEmails)
    } catch (err) {
        console.error(err)
        handleError(res, err)
    }
}

// Get daily user registration statistics
exports.getDailyUserRegistration = async (req, res) => {
    try {
        const usersStats = await User.aggregate([
            {
                $project: {
                    register_date_CAT: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $add: ["$register_date", 2 * 60 * 60 * 1000] }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$register_date_CAT",
                    users: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    users: 1
                }
            }
        ]).exec()

        const total = usersStats.reduce((acc, user) => acc + user.users, 0)

        res.status(200).json({ usersStats, total })
    } catch (err) {
        handleError(res, err)
    }
}

// User login
exports.login = async (req, res) => {
    const { email, password, confirmLogin } = req.body
    if (!email || !password) return res.status(400).json({ msg: 'Please fill all fields' })

    try {
        const user = await User.findOne({ email })
        if (!user) throw Error('User does not exist!')

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw Error('Incorrect E-mail or Password!')

        if (!user.verified && new Date(user.register_date) > new Date('2024-12-09')) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString()
            await User.findOneAndUpdate({ email }, { otp })
            await sendOtpEmail(user, otp)
            return res.status(400).json({ msg: 'Account not verified yet, check your email for OTP!' })
        }

        jwt.verify(user.current_token, process.env.JWT_SECRET, async (err, decoded) => {
            if (!user.current_token || err) {
                const token = generateToken(user)
                if (!token) throw Error('Could not sign in, try again!')

                const updatedUser = await updateUserToken(user, token)
                if (!updatedUser) throw Error('Something went wrong updating current token date')

                res.status(200).json({
                    current_token: token,
                    user: {
                        _id: updatedUser._id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        role: updatedUser.role
                    }
                })
            } else {
                if (!confirmLogin) {
                    return res.status(401).json({
                        msg: 'Already logged in, Log out & use here',
                        id: 'CONFIRM_ERR'
                    })
                } else {
                    const token1 = generateToken(user)
                    if (!token1) throw Error('Could not sign in, try again!')

                    const confirmedUser = await updateUserToken(user, token1)
                    if (!confirmedUser) throw Error('Something went wrong updating current token date')

                    res.status(200).json({
                        current_token: token1,
                        user: {
                            _id: confirmedUser._id,
                            name: confirmedUser.name,
                            email: confirmedUser.email,
                            role: confirmedUser.role
                        },
                    })
                }
            }
        })
    } catch (err) {
        handleError(res, err)
    }
}

// User logout
exports.logout = async (req, res) => {
    try {
        const loggedOutUser = await User.findByIdAndUpdate(
            req.body.userId,
            { $set: { current_token: null } },
            { new: true }
        )
        if (!loggedOutUser) return res.status(404).json({ msg: 'User not found!' })
        res.status(200).json({ msg: 'Good Bye!', status: 200 })
    } catch (err) {
        handleError(res, err)
    }
}

// User registration
exports.register = async (req, res) => {
    const { name, email, password } = req.body
    const emailTest = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    if (!name || !email || !password) return res.status(400).json({ msg: 'Please fill all fields' })
    if (!emailTest.test(email)) return res.status(400).json({ msg: 'Please provide a valid email!' })

    try {
        const user = await User.findOne({ email })
        const hash = await hashPassword(password)

        if (user && (user.verified || user.verified === undefined || user.verified === null)) {
            return res.status(400).json({ msg: 'User already exists, login instead!' })
        }

        if (user && user.verified === false) {
            await User.findOneAndUpdate({ email }, { name, password: hash, otp })
            await sendOtpEmail(user, otp)
        } else {
            const newUser = new User({ name, email, password: hash, otp, verified: false })
            const savedUser = await newUser.save()
            if (!savedUser) throw Error('Something went wrong saving the user')
            await sendOtpEmail(savedUser, otp)
        }

        res.status(200).json({ msg: 'Registration successful! Please verify your email to login.', email })
    } catch (err) {
        handleError(res, err)
    }
}

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ msg: "Email and OTP required!" })

    try {
        const usr = await User.findOne({ email }).select('-password')
        if (!usr) return res.status(400).json({ msg: "User does not exist" })
        if (otp !== usr.otp) return res.status(400).json({ msg: "Invalid OTP." })

        await User.findOneAndUpdate({ email }, { verified: true })
        const token = generateToken(usr)

        const updatedUser = await updateUserToken(usr, token)
        if (!updatedUser) throw Error('Something went wrong updating current token date')

        res.status(200).json({
            current_token: updatedUser.current_token,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            },
            msg: "Account verified now!", status: 200
        })
    } catch (err) {
        handleError(res, err, 500)
    }
}

// Send password reset link
exports.sendResetLink = async (req, res) => {
    const email = req.body.email
    try {
        const userToReset = await User.findOne({ email })
        if (!userToReset) throw Error('User with that email does not exist!')

        let token = await PswdResetToken.findOne({ userId: userToReset._id })
        if (token) await token.deleteOne()

        let resetToken = crypto.randomBytes(32).toString("hex")
        const hash = await hashPassword(resetToken)
        await new PswdResetToken({
            userId: userToReset._id,
            token: hash,
            register_date: Date.now(),
        }).save()

        const clientURL = req.headers.origin
        const link = `${clientURL}/reset-password?token=${resetToken}&id=${userToReset._id}`

        sendEmail(
            userToReset.email,
            "Password reset for your Quiz-Blog account!",
            { name: userToReset.name, link: link },
            "./template/requestResetPassword.handlebars"
        ).then(() => {
            res.status(200).json({ msg: 'Reset email sent successfully', status: 200 })
        }).catch((error) => {
            console.error(error)
            res.status(500).json({ msg: 'Failed to send reset link to your email!', status: 500 })
        })
    } catch (err) {
        handleError(res, err)
    }
}

// Send new password
exports.sendNewPassword = async (req, res) => {
    try {
        const { userId, token, password } = req.body
        let passwordResetToken = await PswdResetToken.findOne({ userId })
        if (!passwordResetToken) throw Error("Invalid or expired link, try resetting again!")

        const isValid = await bcrypt.compare(token, passwordResetToken.token)
        if (!isValid) throw Error("Invalid link, try resetting again!")

        const hash = await hashPassword(password)
        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true })

        const resetUser = await User.findById({ _id: userId })
        sendEmail(
            resetUser.email,
            "Password reset for your Quiz-Blog account is successful!",
            { name: resetUser.name },
            "./template/resetPassword.handlebars"
        )

        await passwordResetToken.deleteOne()
        res.status(200).json({ msg: "Password reset successful!", status: 200 })
    } catch (err) {
        handleError(res, err)
    }
}

// Update profile image
exports.updateProfileImage = async (req, res) => {
    if (!req.file) throw Error('FILE_MISSING')

    const img_file = req.file
    try {
        const profile = await User.findOne({ _id: req.params.id })
        if (!profile) throw Error('Failed! profile not exists!')

        if (profile.image) {
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: profile.image.split('/').pop()
            }
            s3Config.deleteObject(params, (err, data) => {
                if (err) console.log(err, err.stack)
                else console.log(params.Key + ' deleted!')
            })
        }

        const updatedUserProfile = await User.findByIdAndUpdate({ _id: req.params.id }, { image: img_file.location }, { new: true })
        res.status(200).json(updatedUserProfile)
    } catch (err) {
        handleError(res, err)
    }
}

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json({ user, msg: 'Profile updated successfully!' })
    } catch (error) {
        handleError(res, error)
    }
}

// Update user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(user)
    } catch (error) {
        handleError(res, error)
    }
}

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) throw Error('User is not found!')

        const removedUser = await User.deleteOne({ _id: req.params.id })
        if (!removedUser) throw Error('Something went wrong while deleting!')

        res.status(200).json({ msg: "Deleted successfully!" })
    } catch (err) {
        handleError(res, err)
    }
}
