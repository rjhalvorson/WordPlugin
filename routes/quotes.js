/**
 * Created by rhalvorson on 12/30/16.
 */
var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/viewQuotes', function(req, res){
    res.render('quotes', {

    })
});


module.exports = router;