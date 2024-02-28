const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');
const {tokenSign} = require.main.require('../auth/jwt');
const {hashPassword, verifyPassword} = require.main.require('../auth/password-hasher');
const limiter = require.main.require('../ratelimit/ratelimit');

const router = express.Router();

router.use(limiter);
router.post('/', validationRules.accountLogin, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        const username = req.query.username.trim().toLowerCase();
        const password = req.query.password;

        let user;
        try {
            user = await controller.getUserByUsername(username);
        } catch (error) {
            return res.status(404).json({ message: "Invalid username or password", errors: [{ msg: 'Invalid username or password' }] });
        }

        const hashedPassword = user.password;

        if (!await verifyPassword(password, hashedPassword)) {
            return res.status(401).json({ message: "Invalid username or password", errors: [{ msg: 'Invalid username or password' }] });
        }

        const newToken = tokenSign(user.id);

        res.status(200).json({ message: "Successfully logged in", token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;