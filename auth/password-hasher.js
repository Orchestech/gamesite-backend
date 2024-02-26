const bcrypt = require("bcrypt");

const salt = Number(process.env.GAMESITE_SALT) ?? 10;

async function hashPassword(password) {
    return await bcrypt.hash(password, salt);
}

async function verifyPassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {hashPassword, verifyPassword};