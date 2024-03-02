const express = require('express');
const crypto = require("crypto");
const {validationRules, validationResult} = require.main.require('../validation/validation');

const controller = require.main.require('../database/controller');
const {tokenVerify} = require.main.require('../auth/jwt');
const limiter = require.main.require('../ratelimit/ratelimit');

const router = express.Router();

router.use(limiter);

router.put('/', validationRules.accountToken, async (req, res) => {

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

        const activetester = await controller.isQuerySuccess(controller.getActiveTesterByUserId, userId);
        if (!activetester) {
            return res.status(403).json({ message: "Account has no beta-access", errors: [{ msg: 'Account has no beta-access' }] });
        }

        const linkCode = crypto.randomUUID();
        const downloadLinkId = await controller.createDownloadLinkWithActivetesterId(activetester.id, linkCode);
        res.status(200).json({message: "Successfully generated a new link", linkCode: linkCode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;