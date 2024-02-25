const express = require('express');
const {query,validationResult} = require('express-validator')
const crypto = require('crypto');
const {db, pgp} = require.main.require('../database/db');
const router = express.Router();

router.use(express.json());

const registerValidationRules = [
      query('username').trim().isEmail(),
      query('password').isLength({min: 6, max: 32}),
      query('first_name').trim().notEmpty(),
      query('last_name').trim().notEmpty(),
      query('resume').trim().isLength({ min: 25, max: 2000 })
];

router.post('/', registerValidationRules, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const username = req.query.username.trim().toLowerCase();

        // Check if username already exists
        const existingUser = await db.any('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ errors: [{ msg: 'Username already exists' }] });
        }

        const activationDeadline = new Date().getTime() + 172800;
        const activationKey = crypto.randomUUID();

        // Insert new user
        const newUser = await db.one('INSERT INTO users (username, password, admin, activated, activation_deadline) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, req.query.password, false, false, activationDeadline]);

        const userId = newUser.id;
        //console.log(`Registered account with id: ${userId}`);

        // Insert activation key
        await db.any('INSERT INTO activationkeys (user_id, key, force_password_change) VALUES ($1, $2, $3) RETURNING id',
            [userId, activationKey, false]);

        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;