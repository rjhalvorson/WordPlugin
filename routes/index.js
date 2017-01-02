var express = require('express');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');

router.get('/', function(req, res) {
    if(!req.user) {
        req.session.destroy();
        req.logout();
        return res.redirect('/index');
    }
    res.render('home', {
        user: req.user
    });
});

router.get('/index', function(req, res){
    res.render('index', {
    })
});


module.exports = router;
