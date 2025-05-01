const express = require('express')
const router = express.Router()

const validateInput = require('../middleware/validateInput')
const authenticateLogin = require('../middleware/authenticateLogin')
const generateToken = require('../utility/generateToken')

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateInput, authenticateLogin, async (req, res) => {

    const token = generateToken(req.user)
    res.json({ message: `Welcome ${req.user.name}!`, token })

})

module.exports = router