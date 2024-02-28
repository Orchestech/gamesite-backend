const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {tokenVerify} = require.main.require('../auth/jwt');

const router = express.Router();

router.get('/', validationRules.accountToken, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        const username = tokenVerify(req.headers.token);

        if (!username) {
            return res.status(401).json({ message: "Invalid username or password", errors: [{ msg: 'Invalid username or password' }] });
        }

        res.status(200).json({ message: "Logged in", username: username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;