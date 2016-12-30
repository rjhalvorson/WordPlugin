/**
 * Created by rhalvorson on 12/30/16.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;


app.get('/', function(req, res) {
    console.log(req.user);
    if(!req.user) {
        req.session.destroy();
        req.logout();
        return res.redirect('/login');
    }
    res.render('index', {
        user: req.user
    });
});


app.get('/login', function(req, res) {
    req.logout();
    req.session.destroy();

    res.render('login', {
        user: req.user
    });
});

// GET /auth/forcedotcom
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Force.com authentication will involve
//   redirecting the user to your domain.  After authorization, Force.com will
//   redirect the user back to this application at /auth/forcedotcom/callback
app.get('/auth/forcedotcom', passport.authenticate('forcedotcom'), function(req, res) {
    // The request will be redirected to Force.com for authentication, so this
    // function will not be called.
});

// GET /auth/forcedotcom/callback
//   PS: This MUST match what you gave as 'callback_url' earlier
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/forcedotcom/callback', passport.authenticate('forcedotcom', {
    failureRedirect: '/login'
}), function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res) {
    res.redirect('/login');
});

module.exports = router;
