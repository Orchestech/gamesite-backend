var dbcfg = require('./dbconfig');
const pgp = require('pg-promise')(dbcfg.initOptions);

const db = pgp(`postgres://${dbcfg.username}:${dbcfg.password}@${dbcfg.host}:${dbcfg.port}/${dbcfg.database}`)

module.exports = {db, pgp};