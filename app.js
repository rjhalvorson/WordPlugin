//Initalize
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var morgan = require('morgan');
var session = require('express-session');
var jsforce = require('jsforce');
var dbHelper = new(require('./database/db'))();
var cAppConfig = require('./ws-conf').connectedAppConfig;


// Strategy
var ForceDotComStrategy = require('passport-forcedotcom').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

var sfStrategy = new ForceDotComStrategy(cAppConfig, function(accessToken, refreshToken, profile, done) {

    // asynchronous verification, for effect...
    process.nextTick(function() {

        // remove previous tokens on new login and then save new token
        dbHelper.deleteAccessToken(
            profile.id,
            function callback(error){
                if(error){
                    throw error;
                } else {
                    dbHelper.saveAccessToken(

                        profile.id,
                        'to be fixed',
                        profile.displayName,
                        accessToken.params.access_token,
                        refreshToken,
                        accessToken.params.instance_url,
                        function callback(error) {
                            if (error) {
                                throw error;
                            } else {
                                return;
                            }
                        }
                    );
                }
            }
        );
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
var document = require('./routes/document');
var quoteterms = require('./routes/quoteterms');

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
app.use('/document', document);
app.use('/quoteterms', quoteterms);

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
