const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {

  const token = req.header('x-auth-token')

  // Check for token: if no: No token, authorization denied
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization Denied' })

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Add user from payload
    req.user = decoded
    next()

  } catch (e) {
    res.status(400).json({ msg: 'Session Expired, login again!' })
  }

}

// ROLE
const authRole = (roles) => (req, res, next) => {

  const token = req.header('x-auth-token')

  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization Denied' })

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Add user from payload
    req.user = decoded

    if (!req.user) {
      return res.status(401).json({ message: 'Session expired' })
    }

    //if user has a role that is required to access any API
    const allowedUser = roles.find(rol => rol === req.user.role)

    if (allowedUser === req.user.role) {
      return next()
    }

    return res.status(401).json({ msg: 'Unauthorized' })
  }
  catch (e) {
    res.status(400).json({ msg: 'Session Expired, login again!' })
  }
}

module.exports = { auth, authRole }