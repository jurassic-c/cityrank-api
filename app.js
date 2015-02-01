var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var config = require('./config');

var routes = require('./routes/index');
var users = require('./routes/users');
var token = require('./routes/token');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.options('*', cors());

app.use(function(req, res, next) {
    req.mongoose = mongoose;
    next();
});
mongoose.connect('mongodb://'+process.env.MONGO_PORT_27017_TCP_ADDR+'/commander', {server: { keepAlive: 1, auto_reconnect: true }});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    var User = require('./models/user')(mongoose);
    User.findOne({username: 'admin'}, function(err, user) {
        if(user == null) {
            var admin = new User({
                name: "System Administrator",
                username: "admin",
                email: "admin@"+config.domain,
                password: "wifiadmin123"
            });
            admin.save(function(err, user) {
                if(err) return next(err);
                console.log("CREATING ADMIN USER");
            });
        }
    });
});

app.use('/', routes);
app.use('/users', users);
app.use('/token', token);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
