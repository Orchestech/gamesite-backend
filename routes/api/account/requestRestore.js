const express = require('express');
const crypto = require('crypto');
const {validationRules, validationResult} = require.main.require('../validation/validation');
const controller = require.main.require('../database/controller');

const limiter = require.main.require('../ratelimit/ratelimit');

const {restorationEmail} = require.main.require('../smtp/sysmails')

const router = express.Router();

router.use(limiter);
router.post('/', validationRules.accountRequestRestoration, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        // Check if username already exists
        const username = req.query.username.trim().toLowerCase();
        let user;
        if (!(user = await controller.isQuerySuccess(controller.getUserByUsername, username))) {
            return res.status(404).json({ message: "Username not found", errors: [{ msg: 'Username does not exist' }] });
        }

        let existingActivationKey = await controller.isQuerySuccess(controller.getActivationKeyByUserId, user.id);
        if (existingActivationKey && !existingActivationKey.force_password_change)
        {
            return res.status(403).json({ message: "Account not activated", errors: [{ msg: 'This account is not activated' }] });
        }

        console.log(`${new Date().getTime()} - ${existingActivationKey.date} = ${new Date().getTime() -existingActivationKey.date}`)
        if (existingActivationKey && existingActivationKey.force_password_change && new Date().getTime()-existingActivationKey.date < 360000 )
        {
            return res.status(427).json({ message: "To many attempts, try again later", errors: [{ msg: 'Too many attempts, try again later' }] });
        }

        // Should have just made a method for updating the key in controller, but I'm not in mood for that
        await controller.deleteObject('activationkeys', existingActivationKey.id);

        const activationKey = crypto.randomUUID();
        const keyId = await controller.createActivationKey(user.id, activationKey, true);

        // Send account activation email
        await restorationEmail(user.id);

        res.status(200).json({ message: 'Account restoration email request' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;