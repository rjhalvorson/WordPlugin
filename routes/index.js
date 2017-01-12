var express = require('express');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');
var dbHelper = new(require('../database/db'))();

/* GET home page. */
router.get('/', function handleRequest(req, res) {
    dbHelper.getUserData(req.sessionID, function callback(error, userData) {
        if (error !== null) {
            throw error;
        } else {
            userData.sessionID = req.sessionID;
            res.render('index', userData);
        }
    });
});

router.get('/index', function(req, res){
    res.render('index', {
    })
});


module.exports = router;
