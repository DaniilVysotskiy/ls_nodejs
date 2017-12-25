const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const koaBody = require('koa-body');
const session = require('koa-session');
const path = require('path');
const Pug = require('koa-pug');

const index = require('./routes/index');
const myWork = require('./routes/my-work');
// const contactMe = require('./routes/contact-me');
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
app.use(login.routes());
app.use(router.routes());

// app.use('/', index);
// app.use('/my-work', myWork);
// app.use('/contact-me', contactMe);
// app.use('/login', login);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('pages/error');
// });

app.listen(3000, function() {
  console.log('Server running on https://localhost:3000');
});

module.exports = app;
