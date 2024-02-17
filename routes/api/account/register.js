var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    res.statusCode = 501
    res.send("Not implemented");
});

module.exports = router;
