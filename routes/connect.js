/**
 * Created by rhalvorson on 12/30/16.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var cookie = require('cookie');
var authenticationOptions = {};
var dbHelper = new(require('../database/db'))();
var cookieParser = require('cookie-parser');
var io = require('../app');
var util = require('../utility');

authenticationOptions = {display: "popup"};

io.on('connection', function onConnection(socket) {
    var jsonCookie = cookie.parse(socket.handshake.headers.cookie);
    var sessionID = cookieParser.signedCookie(jsonCookie.nodecookie, 'keyboard cat');
    socket.join(sessionID);

    console.log('connected on 3002');
    console.log(sessionID);
    console.log(jsonCookie);

    socket.on('downloadDoc',
        function download(docId) {
        console.log("received request to download ");
        util.getBase64File(docId, sessionID, function sendDoc(myDoc){
            io.to(sessionID).emit('doc_ready', myDoc);
        });
    });

    socket.on('searchTerms',
        function download(searchDom) {
            console.log("received request to search ");
        });

});


router.use(csrf());

// GET /auth/forcedotcom
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Force.com authentication will involve
//   redirecting the user to your domain.  After authorization, Force.com will
//   redirect the user back to this application at /auth/forcedotcom/callback
router.get('/auth/forcedotcom/:sessionID',
    function handleRequest(req, res, next){
        authenticationOptions.state = req.params.sessionID + '|' + req.csrfToken();
        res.cookie('CSRF-TOKEN', req.csrfToken());
        next();
},
    passport.authenticate('forcedotcom', authenticationOptions)
);

// GET /auth/forcedotcom/callback
//   PS: This MUST match what you gave as 'callback_url' earlier
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

router.get('/auth/forcedotcom/callback', function handleRequest(req, res) {
    // At the end of the OAuth flow we need to verify that csrfToken in the cookies
    // matches the one returned by the OAuth flow
     var state = req.query.state;
     var parts = state.split('|');
     var sessionID = parts[0];
     var csrfToken = parts[1];

    if (req.cookies['CSRF-TOKEN'] !== csrfToken) {
        res.render('error', {
            error: {
                status: 403
            },
            message: 'Bad or missing CSRF value'
        });
        return;
    }

    // remove previous tokens on new login and then save new token
    dbHelper.deleteAccessToken(
        req.user.profileId,
        function callback(error) {
            if (error) {
                throw error;
            } else {
                dbHelper.saveAccessToken(
                    req.user.profileId,
                    req.sessionID,
                    req.user.displayName,
                    req.user.accessToken.params.access_token,
                    req.user.refreshToken,
                    req.user.accessToken.params.instance_url,
                    function callback(error) {
                        if (error) {
                            throw error;
                        } else {
                            io.to(req.sessionID).emit('auth_success', req.user);
                            console.log('This is the Emitting ID: ' + req.sessionID);
                            res.render('auth_complete');
                        }
                    }
                );
            }
        }
    );
});

router.get('/logout', function(req, res) {
    dbHelper.deleteAccessToken(
        req.user.profileId,
        function callback(error) {
            if (error) {
                throw error;
            } else {
                req.session.destroy();
                req.logout();
                res.redirect('/');
            }
        })
});

module.exports = router;
