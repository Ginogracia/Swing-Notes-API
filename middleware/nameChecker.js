const User = require('../models/User')

module.exports = async function nameChecker(req, res, next) {
    const existingUser = await User.findOne({ name: req.body.name })
    if (existingUser) {
        return res.status(400).json({ message: 'Name is already taken.' })
    }
    next()
}