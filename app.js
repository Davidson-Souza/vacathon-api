const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const analyzeRouter = require('./routes/analyze');
const usersRouter = require('./routes/users');
const files = require("./routes/files")

const log = require("./log")
const app = express();
app.disable('etag');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/** Routes */
app.use('/api/v1/analyze/', analyzeRouter);
app.use('/', indexRouter);
app.use('/api/v1/users/', usersRouter);
app.use('/images/', files);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ok:false, err:"404 not found!"});
});
app.on("error", (e)=>
{
  log(e)
})
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});
module.exports = app;
