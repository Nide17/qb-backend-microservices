const jwt = require("jsonwebtoken")

const verifyToken = (req, res) => {
  const token = req.header('x-auth-token')
  if (!token) {
    res.status(401).json({ message: 'No token, authorization Denied' })
    return null
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return decoded
  } catch (e) {
    res.status(400).json({ message: 'Session Expired, login again!' })
    return null
  }
}

const auth = async (req, res, next) => {
  if (verifyToken(req, res)) {
    next()
  }
}

module.exports = { auth }