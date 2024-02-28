const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');

const router = express.Router();

router.put('/', validationRules.accountActivation, async (req, res) => {

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
            return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        }

        // Retrieve user from the database
        let user;
        try {
            user = await controller.getUserById(key.user_id);

        } catch (error) {
            return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        }

        // Activate user
        await controller.patchObject('users', user.id, {activated: true});

        // Delete key
        await controller.deleteObject('activationkeys', key.id);

        res.status(200).json({ message: "Successfully activated user" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;