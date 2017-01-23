var express = require('express');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');
var dbHelper = new(require('../database/db'))();

/* GET home page. */
router.get('/', function handleRequest(req, res) {
    dbHelper.getUserDataSessionID(req.sessionID, function callback(error, userData) {
        if (error !== null) {
            throw error;
        } else {
            if(userData.dts.length > 0){
                res.redirect('/home');
            }else{
                res.redirect('/index');
            }
        }
    });
                    });

router.get('/index', function(req, res){
    res.render('index', {
    })
});

router.get('/home', function(req, res){
    res.render('home', {
        user : req.user
    })
});


module.exports = router;
