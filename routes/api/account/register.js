const express = require('express');
const crypto = require('crypto');
const {validationRules, validationResult} = require.main.require('../validation/validation');
const {hashPassword} = require.main.require('../auth/password-hasher');
const {tokenSign} = require.main.require('../auth/jwt');
const {db, pgp} = require.main.require('../database/db');
const controller = require.main.require('../database/controller');

const limiter = require.main.require('../ratelimit/ratelimit');

const nodemailer = require('nodemailer');
const {registrationEmail} = require.main.require('../smtp/sysmails')
const {mailerOptions, mailerFrom} = require.main.require('../smtp/smtp');

const router = express.Router();

router.use(limiter);
router.post('/', validationRules.accountRegistration, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        // Check if username already exists
        const username = req.query.username.trim().toLowerCase();

        if (await controller.isQuerySuccess(controller.getUserByUsername, username)) {
            return res.status(409).json({ message: "Username conflict", errors: [{ msg: 'Username already exists' }] });
        }

        const password = req.query.password;
        const activationKey = crypto.randomUUID();

        const userId = await controller.createUser(username, password);
        const profileId = await controller.createProfile(userId, req.query.first_name, req.query.last_name, req.query.resume);
        const keyId = await controller.createActivationKey(userId, activationKey, false);

        // Send account activation email
        // const transporter = nodemailer.createTransport(mailerOptions);
        // await transporter.sendMail({
        //    from: mailerFrom,
        //    to: username,
        //    subject: 'Gamesite registration',
        //    text: `Hi, ${req.query.first_name} ${req.query.last_name}!\nActivate your account by clicking the link below: https://rukolf.team/account/activate/${activationKey}`
        // }, (error) => {
        //     if (error) {
        //         console.error(mailerOptions);
        //         console.error(error);
        //     }
        // });
        await registrationEmail(userId);

        const user = await controller.getUserById(userId);
        const newToken = tokenSign(user.id);

        res.status(200).json({ message: 'User registered successfully', token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;