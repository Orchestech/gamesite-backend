const express = require('express');
const {validationRules, validationResult} = require.main.require('../validation/validation');

const {tokenVerify} = require.main.require('../auth/jwt');
const {db, pgp} = require.main.require('../database/db');

const router = express.Router();

router.post('/', validationRules.accountActivation, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({message: "Validation error", errors: errors.array()});
    }

    return res.status(501).json({ message: "Not implemented" });

    // try {
    //     res.status(200).json({ message: "Success" });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Error occurred", errors: [{ msg: 'Server error' }] });
    // }
});

module.exports = router;