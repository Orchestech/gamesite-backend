const username = process.env.GAMESITE_DB_USERNAME ?? "postgres";
const password = process.env.GAMESITE_DB_PASSWORD ?? "example_password";
const host = process.env.GAMESITE_DB_HOST ?? "127.0.0.1";
const port = process.env.GAMESITE_DB_PORT ?? 5432;
const database = process.env.GAMESITE_DB_DATABASE ?? "gamesite";

const initOptions = {
    schema: 'public'
};

const pgp = require('pg-promise')(initOptions);

const db = pgp(`postgres://${username}:${password}@${host}:${port}/${database}`)

module.exports = {db, pgp};