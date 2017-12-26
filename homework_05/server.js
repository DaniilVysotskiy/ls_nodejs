const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const koaBody = require('koa-body');
const session = require('koa-session');
const path = require('path');

const index = require('./routes/index');

// view engine setup
const app = new Koa();
const router = new Router();

app.use(serve(path.join(__dirname, 'public')));

// Sessions
app.use(session(app));

// Routes
app.use(index.routes());
app.use(router.routes());

app.listen(3000, function() {
  console.log('Server running on https://localhost:3000');
});

module.exports = app;
