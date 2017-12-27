const Koa = require('koa');
const body = require('koa-body');
const compose = require('koa-compose');
const favicon = require('koa-favicon');
const logger = require('koa-logger');
const Router = require('koa-router');
const serve = require('koa-static');
const session = require('koa-session');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const staticRoot = path.join(projectRoot, '/public');

// Engine
const app = new Koa();
const router = new Router();

// DB
const db = require(projectRoot + '/models/db');

let middlewareStack = [
  body(),
  favicon(staticRoot + '/favicon.png'),
  logger(),
  session({}, app),
  serve(staticRoot)
];

app.use(compose(middlewareStack));

// Routes
app.use(require(projectRoot + '/routes/api/save-new-user').routes());
app.use(router.routes());

app.listen(3000, () => {
  console.log('Server running on https://localhost:3000');
});

module.exports = app;
