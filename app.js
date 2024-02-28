var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

//Stock routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//RESTful API
var accountRegister = require('./routes/api/account/register');
var accountActivate = require('./routes/api/account/activate');
var accountRestore = require('./routes/api/account/restore');
var accountLogin = require('./routes/api/account/login');
var accountStatus = require('./routes/api/account/status');
var accountGetProfile = require('./routes/api/account/getProfile');
var accountChangePassword = require('./routes/api/account/changePassword');
var accountUpdateProfile = require('./routes/api/account/updateProfile');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/api/account/register', accountRegister);
app.use('/api/account/activate', accountActivate);
app.use('/api/account/restore', accountRestore);
app.use('/api/account/login', accountLogin);
app.use('/api/account/status', accountStatus);
app.use('/api/account/getProfile', accountGetProfile);
app.use('/api/account/changePassword', accountChangePassword);
app.use('/api/account/updateProfile', accountUpdateProfile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return res.status(404).json({message: "Not found", errors: [{ msg: `Method ${req.method} ${req.path} not found` }] });
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
