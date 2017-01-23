//Initalize
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var certConf = require('./certconf');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var morgan = require('morgan');
var session = require('express-session');
var jsforce = require('jsforce');
var cAppConfig = require('./models/ws-conf').connectedAppConfig;
var ONE_DAY_MILLIS = 86400000;

var app = express();
// create the socket server
var socketServer = require('https').createServer(certConf, app);
// bind it to socket.io
var io = require('socket.io')(socketServer);
socketServer.listen(3002);
module.exports = io;

// Strategy
var ForceDotComStrategy = require('passport-forcedotcom').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


function verifySFDC(accessToken, refreshToken, profile, done) {
        var user = {};
        user.profileId = profile.id;
        user.displayName = profile.displayName;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        delete profile._raw;
        return done(null, user);
}

passport.use(new ForceDotComStrategy(cAppConfig, verifySFDC));


var index = require('./routes/index');
var users = require('./routes/users');
var connect = require('./routes/connect');
var quotes = require('./routes/quotes');
var document = require('./routes/document');
var quoteterms = require('./routes/quoteterms');


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
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(morgan('dev'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    name: 'nodecookie',
    cookie: {
        path: '/',
        httpOnly: false,
        secure: false,
        maxAge: 7 * ONE_DAY_MILLIS,
        expires: 7 * ONE_DAY_MILLIS
    },
    saveUninitialized: true
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
