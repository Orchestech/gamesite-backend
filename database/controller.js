const {db, pgp} = require.main.require('../database/db');
const crypto = require('crypto');
const {hashPassword, verifyPassword} = require.main.require('../auth/password-hasher');

async function createUser(username, password) {

    const hashedPassword = await hashPassword(password);
    const activationDeadline = new Date().getTime() + 172800;

    // Insert new user
    return await db.one('INSERT INTO users (username, password, admin, activated, activation_deadline) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, hashedPassword, false, false, activationDeadline], a => a.id);
}

async function getUserById(id) {
    return await db.one('SELECT * FROM users WHERE id = $1', [id]);
}
async function getUserByUsername(username) {
    return await db.one('SELECT * FROM users WHERE username = $1', [username]);
}

async function createProfile(user_id, first_name, last_name, resume) {
    return await db.one('INSERT INTO profiles (user_id, first_name, last_name, resume) VALUES ($1, $2, $3, $4) RETURNING id',
            [user_id, first_name, last_name, resume], a => a.id);
}

async function getProfileByUserId (user_id) {
    return await db.one('SELECT * FROM profiles WHERE user_id = $1', [user_id]);
}

async function createActivationKey(user_id, key, force_password_change) {
    return await db.one('INSERT INTO activationkeys (user_id, key, force_password_change) VALUES ($1, $2, $3) RETURNING id',
            [user_id, key, force_password_change], a => a.id);
}

async function getActivationKeyById(key) {
    return await db.one('SELECT * FROM activationkeys WHERE key = $1', [key]);
}

async function getActivationKeyByUserId(user_id) {
    return await db.one('SELECT * FROM activationkeys WHERE user_id = $1', [user_id]);
}

async function getActivationKeyByKey(key) {
    return await db.one('SELECT * FROM activationkeys WHERE key = $1', [key]);
}

async function patchObject(table, id, object) {
    return await db.none(`UPDATE ${table} SET ${Object.keys(object).map(key => `${key} = $${Object.keys(object).indexOf(key) + 2}`)} WHERE id = $1`, [id, ...Object.values(object)]);
}

async function deleteObject(table, id) {
    return await db.none(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

module.exports = {
    createUser, getUserById, getUserByUsername,
    createProfile, getProfileByUserId,
    createActivationKey, getActivationKeyById, getActivationKeyByUserId, getActivationKeyByKey,
    patchObject, deleteObject
}