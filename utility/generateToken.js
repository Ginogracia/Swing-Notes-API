const jwt = require('jsonwebtoken')

function generateToken(user) {
    return jwt.sign(
        { userId: user.userId, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )
}

module.exports = generateToken