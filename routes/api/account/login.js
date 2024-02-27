const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {db, pgp} = require.main.require('../database/db');
const {tokenSign} = require.main.require('../auth/jwt');
const {hashPassword, verifyPassword} = require.main.require('../auth/password-hasher');

const router = express.Router();

router.post('/', validationRules.accountLogin, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        const username = req.query.username.trim().toLowerCase();
        const password = req.query.password;

        const hash = await db.one('SELECT password FROM users WHERE username = $1', [username], a => a);

        if (!await verifyPassword(password, hash.password)) {
            return res.status(401).json({ message: "Invalid username or password", errors: [{ msg: 'Invalid username or password' }] });
        }

        res.status(200).json({ message: "Successfully activated user", token: tokenSign(username) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;