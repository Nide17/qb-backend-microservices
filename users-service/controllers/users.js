const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { S3 } = require("@aws-sdk/client-s3")
const { sendEmail } = require("../utils/emails/sendEmail")
const User = require("../models/User")
const PswdResetToken = require("../models/PswdResetToken")

const s3Config = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
})

// Helper function to handle errors
const handleError = (res, err, status = 400) => res.status(status).json({ msg: err.message })

// Helper function to find user by ID
const findUserById = async (id, res, selectFields = '') => {
    try {
        const user = await User.findById(id).select(selectFields)
        if (!user) return res.status(404).json({ msg: 'No user found!' })
        return user
    } catch (err) {
        return handleError(res, err)
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 })
        if (!users) return res.status(404).json({ msg: 'No users found!' })
        res.status(200).json(users)
    } catch (err) {
        handleError(res, err)
    }
}

exports.getUser = async (req, res) => {
    const user = await findUserById(req.user._id, res, '-password -__v')
    if (user) res.json(user)
}

exports.loadUser = async (req, res) => {
    const user = await findUserById(req.user._id, res, '-password -__v')
    if (user) res.json(user)
}

exports.getOneUser = async (req, res) => {
    const user = await findUserById(req.params.id, res)
    if (user) res.status(200).json(user)
}

exports.login = async (req, res) => {
    const { email, password, confirmLogin } = req.body
    if (!email || !password) return res.status(400).json({ msg: 'Please fill all fields' })

    try {
        const user = await User.findOne({ email })
        if (!user) throw Error('User does not exist!')

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw Error('Incorrect E-mail or Password!')

        if (!user.verified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString()
            await User.findOneAndUpdate({ email }, { otp })
            console.log(email, otp)
            // await sendEmail(user.email,
            //   "One Time Password (OTP) verification for Quiz Blog account",
            //   { name: user.name, otp }, "./template/otp.handlebars")
            return res.status(400).json({ msg: 'Account not verified yet, check your email for OTP!' })
        }

        jwt.verify(user.current_token, process.env.JWT_SECRET, async (err, decoded) => {
            if (!user.current_token || err) {
                const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' })
                if (!token) throw Error('Could not sign in, try again!')

                const updatedUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { current_token: token } }, { new: true })
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
                        msg: 'You are already logged in from another device or browser. Do you want to log them out to use here?',
                        status: 401
                    })
                } else {
                    const token1 = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' })
                    if (!token1) throw Error('Could not sign in, try again!')

                    const confirmedUser = await User.findByIdAndUpdate({ _id: user._id }, { $set: { current_token: token1 } }, { new: true })
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

exports.logout = async (req, res) => {
    try {
        const loggedOutUser = await User.findByIdAndUpdate(
            { _id: req.body.userId },
            { $set: { current_token: null } },
            { new: true }
        )
        if (!loggedOutUser) throw Error('Something went wrong updating current token date')
        res.status(200).json({ msg: 'Good Bye!', status: 200 })
    } catch (err) {
        handleError(res, err)
    }
}

exports.register = async (req, res) => {
    const { name, email, password } = req.body
    const emailTest = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    if (!name || !email || !password) return res.status(400).json({ msg: 'Please fill all fields' })
    if (!emailTest.test(email)) return res.status(400).json({ msg: 'Please provide a valid email!' })

    try {
        const user = await User.findOne({ email })
        if (user && (user.verified || user.verified === undefined || user.verified === null)) {
            return res.status(400).json({ msg: 'User already exists, login instead!' })
        }

        const salt = await bcrypt.genSalt(10)
        if (!salt) throw Error('Something went wrong with bcrypt')

        const hash = await bcrypt.hash(password, salt)
        if (!hash) throw Error('Something went wrong hashing the password')

        if (user && user.verified === false) {
            await User.findOneAndUpdate({ email }, { name, password: hash, otp })
            console.log("Existing: ", email, otp)
            // await sendEmail(user.email,
            //     "One Time Password (OTP) verification for Quiz Blog account",
            //     { name: user.name, otp }, "./template/otp.handlebars")
        } else {
            const newUser = new User({ name, email, password: hash, otp, verified: false })
            const savedUser = await newUser.save()
            if (!savedUser) throw Error('Something went wrong saving the user')
            console.log(email, otp)
            // await sendEmail(savedUser.email,
            //     "One Time Password (OTP) verification for Quiz Blog account",
            //     { name: savedUser.name, otp }, "./template/otp.handlebars")
        }

        res.status(200).json({ msg: 'Registration successful! Please verify your email to login.', email })
    } catch (err) {
        handleError(res, err)
    }
}

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ msg: "Email and OTP required!" })

    try {
        const usr = await User.findOne({ email }).select('-password')
        if (!usr) return res.status(400).json({ msg: "User does not exist" })
        if (otp !== usr.otp) return res.status(400).json({ msg: "Invalid OTP." })

        await User.findOneAndUpdate({ email }, { verified: true })
        const token = jwt.sign({ _id: usr._id, role: usr.role }, process.env.JWT_SECRET, { expiresIn: '2h' })

        const updatedUser = await User.findByIdAndUpdate(
            { _id: usr._id },
            { $set: { current_token: token } },
            { new: true }
        )
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

exports.sendResetLink = async (req, res) => {
    const email = req.body.email
    try {
        const userToReset = await User.findOne({ email })
        if (!userToReset) throw Error('User with that email does not exist!')

        let token = await PswdResetToken.findOne({ userId: userToReset._id })
        if (token) await token.deleteOne()

        let resetToken = crypto.randomBytes(32).toString("hex")
        const salt = await bcrypt.genSalt(10)
        if (!salt) throw Error('Something went wrong with bcrypt')

        const hash = await bcrypt.hash(resetToken, salt)
        await new PswdResetToken({
            userId: userToReset._id,
            token: hash,
            createdAt: Date.now(),
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

exports.sendNewPassword = async (req, res) => {
    try {
        const { userId, token, password } = req.body
        let passwordResetToken = await PswdResetToken.findOne({ userId })
        if (!passwordResetToken) throw Error("Invalid or expired link, try resetting again!")

        const isValid = await bcrypt.compare(token, passwordResetToken.token)
        if (!isValid) throw Error("Invalid link, try resetting again!")

        const salt = await bcrypt.genSalt(10)
        if (!salt) throw Error('Something went wrong with bcrypt')

        const hash = await bcrypt.hash(password, salt)
        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true })

        const resetUser = await User.findById({ _id: userId })
        console.log(resetUser)

        // sendEmail(
        //     resetUser.email,
        //     "Password reset for your Quiz-Blog account is successful!",
        //     {
        //         name: resetUser.name,
        //     },
        //     "./template/resetPassword.handlebars")

        await passwordResetToken.deleteOne()
        res.status(200).json({ msg: "Password reset successful!", status: 200 })
    } catch (err) {
        handleError(res, err)
    }
}

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

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json({ user, msg: 'Profile updated successfully!' })
    } catch (error) {
        handleError(res, error)
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true })
        res.status(200).json(user)
    } catch (error) {
        handleError(res, error)
    }
}

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
