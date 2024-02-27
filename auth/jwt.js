const crypto = require("crypto");
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.GAMESITE_JWT_SECRET ?? crypto.randomUUID();
const jwtExpireTime = process.env.GAMESITE_JWT_EXPIREIN ?? "1h";

function tokenSign(userId) {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpireTime });
}

function tokenVerify(token) {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (error) {
        return false;
    }
}

module.exports = {tokenSign, tokenVerify}