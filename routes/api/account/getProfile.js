const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {tokenVerify} = require.main.require('../auth/jwt');
const {db, pgp} = require.main.require('../database/db');

const router = express.Router();

router.get('/', validationRules.accountToken, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    try {

        const username = tokenVerify(req.headers.token).userId;

        if (!username) {
            return res.status(401).json({ message: "Invalid token", errors: [{ msg: 'Invalid token' }] });
        }

        const userId = await db.one('SELECT id FROM users WHERE username = $1', [username], a => a.id);
        const userData = await db.one(`
            SELECT 
                profiles.first_name, 
                profiles.last_name, 
                profiles.resume, 
                users.username, 
                users.activated, 
                users.activation_deadline 
            FROM 
                profiles 
            INNER JOIN 
                users 
            ON 
                profiles.user_id = users.id 
            WHERE 
                users.id = $1`, [userId]);

        console.log(userData);
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;