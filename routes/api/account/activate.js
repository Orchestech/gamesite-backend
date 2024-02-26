const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {db, pgp} = require.main.require('../database/db');

const router = express.Router();

router.post('/', validationRules.accountActivation, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        // Check if activation key exists
        const activationKey = req.query.code;
        const keys = await db.any('SELECT * FROM activationkeys WHERE key = $1', [activationKey]);
        if (keys.length === 0) {
            return res.status(401).json({ message: "Activation key is invalid", errors: [{ msg: 'Invalid activation key' }] });
        }

        // Activate user and remove activation key
        const userId = await db.one('SELECT user_id FROM activationkeys WHERE key = $1', [activationKey]);
        await db.none('UPDATE users SET activated = true WHERE id = $1', [userId]);
        await db.none('DELETE FROM activationkeys WHERE key = $1', [activationKey]);

        res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;