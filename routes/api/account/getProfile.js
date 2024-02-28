const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {tokenVerify} = require.main.require('../auth/jwt');
const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');

const router = express.Router();

router.get('/', validationRules.accountToken, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        const requestedUser = await tokenVerify(req.headers.token);
        const userId = requestedUser.userId;
        if (!userId) {
            return res.status(401).json({ message: "Invalid token", errors: [{ msg: 'Invalid token' }] });
        }

        const user = await controller.getUserById(userId);
        const profile = await controller.getProfileByUserId(user.id);

        const userData = {
            first_name: profile.first_name,
            last_name: profile.last_name,
            resume: profile.resume,
            username: user.username,
            activated: user.activated,
            activation_deadline: user.activation_deadline
        }

        console.log(userData);
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;