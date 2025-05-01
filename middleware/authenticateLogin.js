const bcrypt = require('bcrypt')
const User = require('../models/User')

module.exports = async function authenticateUser(req, res, next) {
    const user = await User.findOne({ name: req.body.name })
    
    if (!user ) {
        return res.status(400).send('Login credential incorrect. Try again.')
    }

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) {
        return res.status(400).send('Login credential incorrect. Try again.')
    }

    req.user = user
    next()
}