const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const controller = require.main.require('../database/controller');

const jwtSecret = process.env.GAMESITE_JWT_SECRET ?? crypto.randomUUID();
const jwtExpireTime = process.env.GAMESITE_JWT_EXPIREIN ?? "1h";

function tokenSign(userId) {
    return jwt.sign({ userId:userId, time: new Date().getTime() }, jwtSecret, { expiresIn: jwtExpireTime });
}

async function tokenVerify(token) {
    try {
        const data = jwt.verify(token, jwtSecret);
        const user = await controller.getUserById(data.userId);
        return (user.password_change_time < data.time) || !user.password_change_time ? data : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {tokenSign, tokenVerify}