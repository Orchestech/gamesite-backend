const rateLimit = require("express-rate-limit");

const whitelist = (process.env.GAMESITE_RATELIMIT_WHITELIST ?? "::ffff:127.0.0.1").split(';');

const limiter = rateLimit({
    skip: (req, res) => whitelist.includes(req.ip),
    //handler: (req) => console.log(req.ip, req.headers['x-forwarded-for']),
    windowMs: Number(process.env.GAMESITE_RATE_LIMIT ?? 60) * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: {"message": "Too many requests, please try again later", errors: [{"msg": "Too many requests, please try again later"}]}
})

module.exports = limiter