const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const koaBody = require('koa-body');
const session = require('koa-session');
const path = require('path');
const Pug = require('koa-pug');

const index = require('./routes/index');
const myWork = require('./routes/my-work');
const contactMe = require('./routes/contact-me');
const login = require('./routes/login');

// view engine setup
const app = new Koa();
const router = new Router();

const pug = new Pug({
  viewPath: path.join(__dirname, 'views'),
  basedir: path.join(__dirname, 'views'),
  app: app
});

app.context.render = pug.render;
app.use(serve(path.join(__dirname, 'app')));
app.use(koaBody({
  formidable: {
      uploadDir: path.join(__dirname, 'app/upload') // Директория, куда следует сохранить файл
  },
  multipart: true
}));

// Sessions
app.use(session(app));

// Routes
app.use(index.routes());
app.use(myWork.routes());
app.use(contactMe.routes());
app.use(login.routes());

app.use(router.routes());

app.listen(3000, function() {
  console.log('Server running on https://localhost:3000');
});

module.exports = app;
