const express = require('express');
const crypto = require('crypto');
const {validationRules, validationResult} = require.main.require('../validation/validation');
const {hashPassword} = require.main.require('../auth/password-hasher');
const {tokenSign} = require.main.require('../auth/jwt');
const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');

const nodemailer = require('nodemailer');
const {mailerOptions, mailerFrom} = require.main.require('../smtp/smtp');

const router = express.Router();

router.post('/', validationRules.accountRegistration, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        // Check if username already exists
        const username = req.query.username.trim().toLowerCase();
        const existingUser = await db.any('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Validation Error", errors: [{ msg: 'Username already exists' }] });
        }

        const password = req.query.password;
        const activationKey = crypto.randomUUID();

        const userId = await controller.createUser(username, password);
        const profileId = await controller.createProfile(userId, req.query.first_name, req.query.last_name, req.query.resume);
        const keyId = await controller.createActivationKey(userId, activationKey, false);

        // // Insert new user
        // const userId = await db.one('INSERT INTO users (username, password, admin, activated, activation_deadline) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        //     [username, hashedPassword, false, false, activationDeadline], a => a.id);
        // const newUserProfile = await db.none('INSERT INTO profiles (user_id, first_name, last_name, resume) VALUES ($1, $2, $3, $4)',
        //     [userId, req.query.first_name, req.query.last_name, req.query.resume]);

        // // Insert activation key
        // await db.any('INSERT INTO activationkeys (user_id, key, force_password_change) VALUES ($1, $2, $3) RETURNING id',
        //     [userId, activationKey, false]);

        // Send account activation email
        const transporter = nodemailer.createTransport(mailerOptions);
        await transporter.sendMail({
           from: mailerFrom,
           to: username,
           subject: 'Gamesite registration',
           text: `Hi, ${req.query.first_name} ${req.query.last_name}!\nActivate your account by clicking the link below: https://rukolf.team/account/activate/${activationKey}`
        }, (error) => {
            if (error) {
                console.error(mailerOptions);
                console.error(error);
            }
        });

        res.status(200).json({ message: 'User registered successfully', token: tokenSign(username) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;