const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');
const {tokenSign, tokenVerify} = require.main.require('../auth/jwt');
const {hashPassword, verifyPassword} = require.main.require('../auth/password-hasher');

const router = express.Router();

router.put('/', validationRules.accountChangePassword, async (req, res) => {

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

        const oldPassword = req.query.old_password;
        const newPassword = req.query.new_password;

        const user = await controller.getUserById(userId);
        const hashedPassword = user.password;

        if (!await verifyPassword(oldPassword, hashedPassword)) {
            return res.status(401).json({ message: "Old password is invalid", errors: [{ msg: 'Invalid old password' }] });
        }

        const newPasswordHashed = await hashPassword(newPassword);

        await controller.patchObject('users', user.id, {password: newPasswordHashed, last_password_change: new Date().getTime()});
        const newToken = tokenSign(user.id);

        res.status(200).json({ message: "Successfully updated password", token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;