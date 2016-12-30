/**
 * Created by rhalvorson on 12/30/16.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var jsforce = require('jsforce');

// GET /auth/forcedotcom
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Force.com authentication will involve
//   redirecting the user to your domain.  After authorization, Force.com will
//   redirect the user back to this application at /auth/forcedotcom/callback
router.get('/auth/forcedotcom', passport.authenticate('forcedotcom'), function(req, res) {
    // The request will be redirected to Force.com for authentication, so this
    // function will not be called.
});

// GET /auth/forcedotcom/callback
//   PS: This MUST match what you gave as 'callback_url' earlier
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/auth/forcedotcom/callback', passport.authenticate('forcedotcom', {
    failureRedirect: '/login'
}), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/');
});

module.exports = router;
