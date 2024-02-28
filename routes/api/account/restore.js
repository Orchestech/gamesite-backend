const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');
const {hashPassword} = require.main.require('../auth/password-hasher');
const {tokenSign} = require.main.require('../auth/jwt');

const router = express.Router();

router.put('/', validationRules.accountRestoration, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        // Check if activation key exists
        const activationKey = req.query.code;

        // Retrieve key object from the database
        let key;
        try {
            key = await controller.getActivationKeyByKey(activationKey);
        } catch (error) {
            return res.status(400).json({ message: "Restoration key is invalid", errors: [{ msg: 'Invalid restoration key' }] });
        }

        // Check if key is unintended to be used for account restoration
        if (!key.force_password_change)
        {
            return res.status(409).json({ message: "Use account/activate instead", errors: [{ msg: 'This key does not require password' }] });
        }

        // Retrieve user from the database
        let user;
        try {
            user = await controller.getUserById(key.user_id);

        } catch (error) {
            return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        }

        // Activate user and change password
        const newPassword = await hashPassword(req.query.password);
        const lastPasswordChange = new Date()-5;
        await controller.patchObject('users', user.id, {activated: true, password: newPassword, last_password_change: lastPasswordChange});

        // Delete key
        await controller.deleteObject('activationkeys', key.id);

        // Give user their new token
        const newToken = await tokenSign(user.id);
        res.status(200).json({ message: "Successfully restored account", token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;