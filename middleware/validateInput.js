module.exports = function validateInput(req, res, next) {
    const { name, password } = req.body

    if (!name || !password) {
        return res.status(400).json({ message: 'Name and password are required.' })
    }

    next() 
}