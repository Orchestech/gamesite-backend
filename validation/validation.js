const {query, body, param, cookie, header, check, validationResult} = require('express-validator')

const validationRules = {
    accountRegistration:
    [
      query('username').trim().isEmail(),
      query('password').isLength({min: 6, max: 32}),
      query('first_name').trim().notEmpty(),
      query('last_name').trim().notEmpty(),
      query('resume').trim().isLength({ min: 25, max: 2000 })
    ],
    accountActivation:
    [
      query('code').notEmpty()
    ],
    accountLogin:
    [
      query('username').trim().notEmpty(),
      query('password').trim().notEmpty()
    ],
    accountChangePassword:
    [
      query('old_password').notEmpty(),
      query('new_password').notEmpty().isLength({min: 6, max: 32})
    ],
    accountToken:
    [
      header('token').notEmpty()
    ]
};

module.exports = {validationRules, validationResult};