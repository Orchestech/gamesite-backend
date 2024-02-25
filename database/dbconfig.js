const username = process.env.GAMESITE_DB_USERNAME;
const password = process.env.GAMESITE_DB_PASSWORD;
const host = process.env.GAMESITE_DB_HOST;
const port = process.env.GAMESITE_DB_PORT;
const database = process.env.GAMESITE_DB_DATABASE;

const initOptions = {
    schema: 'public'
};

module.exports = {username, password, host, port, database, initOptions};