const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');
const {tokenVerify} = require.main.require('../auth/jwt');

const controller = require.main.require('../database/controller');

const router = express.Router();

router.get('/', validationRules.accountToken, async (req, res) => {

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

        const tester = await controller.isQuerySuccess(controller.getActiveTesterByUserId, userId);
        if (!tester)
        {
            return res.status(403).json({ message: "Account has no beta-access", errors: [{ msg: 'Account has no beta-access' }] });
        }
        const downloadLink = await controller.isQuerySuccess(controller.getDownloadLinkByActivetesterId, tester.id);
        await controller.patchObject('downloadlinks', downloadLink.id, {uses: downloadLink.uses + 1});

        res.status(200).sendFile("/var/www/data/archive.zip");
        //res.status(200).json({ message: "Used link "+downloadLink.uses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    }
});

module.exports = router;