const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');
const controller = require.main.require('../database/controller');
const {tokenVerify} = require.main.require('../auth/jwt');

const router = express.Router();

router.patch('/', validationRules.accountToken, async (req, res) => {

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

        const newData = {
            first_name: req.query.first_name,
            last_name: req.query.last_name,
            resume: req.query.resume
        }

        await controller.patchObject('profiles', userId, newData);

        res.status(200).json({ message: "Successfully updated profile data" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;