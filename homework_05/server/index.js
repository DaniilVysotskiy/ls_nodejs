const Koa = require('koa');
const compose = require('koa-compose');
const static = require('koa-static');
const Router = require('koa-router');
const session = require('koa-session');
const logger = require('koa-logger');
const favicon = require('koa-favicon');
const path = require('path');

const projectRoot = __dirname;
const staticRoot = path.join(projectRoot, '../public');

// Engine setup
const app = new Koa();
const router = new Router();
app.use(router.routes());

let middlewareStack = [
  session({}, app), // расширяет контекст свойством session
  logger(), // логирует все http запросы
  favicon(staticRoot + '/favicon.png'), // фавиконка
  static(staticRoot) // отдает статику
];

app.use(compose(middlewareStack));

app.listen(3000, () => {
  console.log('Server running on https://localhost:3000');
});

module.exports = app;
