//Initalize
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var morgan = require('morgan');
var session = require('express-session');
var jsforce = require('jsforce');


// Strategy
var ForceDotComStrategy = require('passport-forcedotcom').Strategy;
var conn = new jsforce.Connection();

// Set Force.com app's clientID
var CF_CLIENT_ID = '3MVG9szVa2RxsqBa..NzsCLuTNnUVDZMg4h.a617U_9CgLRcSUzURWxbqhokMToCceYg4IqNdfDFKm6EiVPbR';
var CF_CLIENT_SECRET = '5528941850908566996';
var CF_CALLBACK_URL = 'http://localhost:3000/connect/auth/forcedotcom/callback';
var SF_AUTHORIZE_URL = 'https://login.salesforce.com/services/oauth2/authorize';
var SF_TOKEN_URL = 'https://login.salesforce.com/services/oauth2/token';

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

var sfStrategy = new ForceDotComStrategy({
    clientID: CF_CLIENT_ID,
    clientSecret: CF_CLIENT_SECRET,
    callbackURL: CF_CALLBACK_URL,
    authorizationURL: SF_AUTHORIZE_URL,
    tokenURL: SF_TOKEN_URL
}, function(accessToken, refreshToken, profile, done) {

    // asynchronous verification, for effect...
    process.nextTick(function() {

        conn = new jsforce.Connection({
            oauth2 : {
                clientId : '3MVG9szVa2RxsqBa..NzsCLuTNnUVDZMg4h.a617U_9CgLRcSUzURWxbqhokMToCceYg4IqNdfDFKm6EiVPbR',
                clientSecret : '5528941850908566996',
                redirectUri : 'http://localhost:3000/connect/auth/forcedotcom/callback'
            },
            instanceUrl: accessToken.params.instance_url,
            accessToken: accessToken.params.access_token,
            refreshToken: refreshToken
        });
        console.log(accessToken);
        console.log(conn);
        console.log(refreshToken);

        var records = [];
        conn.query("SELECT Id, Name FROM Account", function(err, result) {
            if (err) { return console.error(err); }
            console.log("total : " + result.totalSize);
            console.log("fetched : " + result.records.length);
        });

        // To keep the example simple, the user's forcedotcom profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the forcedotcom account with a user record in your database,
        // and return that user instead.
        //
        // We'll remove the raw profile data here to save space in the session store:
        delete profile._raw;
        return done(null, profile);
    });
});

passport.use(sfStrategy);


var index = require('./routes/index');
var users = require('./routes/users');
var connect = require('./routes/connect');
var quotes = require('./routes/quotes');

// Initialize Express
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/connect', connect);
app.use('/quotes', quotes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
