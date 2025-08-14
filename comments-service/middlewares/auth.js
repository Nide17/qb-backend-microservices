const jwt = require("jsonwebtoken")

const verifyToken = (req, res) => {
  const token = req.header('x-auth-token')
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization Denied' })
    return null
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return decoded
  } catch (e) {
    console.error("\n\nToken error: ", e, "\n\n")
    res.status(400).json({ msg: 'Token is not valid' })
    return null
  }
}

const auth = async (req, res, next) => {
  if (verifyToken(req, res)) {
    next()
  }
}

const authRole = (roles) => (req, res, next) => {
  const decoded = verifyToken(req, res)
  if (!decoded) return

  if (!req.user) {
    return res.status(401).json({ msg: 'Session expired' })
  }

  const allowedUser = roles.find(rol => rol === req.user.role)
  if (allowedUser === req.user.role) {
    return next()
  }

  return res.status(401).json({ msg: 'Unauthorized' })
}

module.exports = { auth, authRole }