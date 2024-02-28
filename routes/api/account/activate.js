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

        let key;
        try {
            key = await controller.getActivationKeyByKey(activationKey);
        } catch (error) {
            return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        }

        let user;
        try {
            user = await controller.getUserById(key.user_id);

        } catch (error) {
            return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        }

        await controller.patchObject('users', user.id, {activated: true});

        //const key = await db.any('SELECT * FROM activationkeys WHERE key = $1', [activationKey]);

        // if (keys.length === 0) {
        //     return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        // }

        // Activate user and remove activation key
        // const userId = await db.one('SELECT user_id FROM activationkeys WHERE key = $1', [activationKey], a => a.user_id);

        //await db.none('UPDATE users SET activated = true WHERE id = $1', [user.id]);
        //await db.none('DELETE FROM activationkeys WHERE key = $1', [activationKey]);

        res.status(200).json({ message: "Successfully activated user" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;