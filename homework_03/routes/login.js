const router = require('koa-router')();
const db = require('../models/db');

/* GET login page. */
router.get('/login', async ctx => {
  ctx.body = ctx.render('pages/login');
});

router.post('/login', async ctx => {
  const login = ctx.request.body.login;
  const password = ctx.request.body.password;
  
  const dbUser = db.get('users').find({ login: login, password: password }).value();

  if(!dbUser) {
    const error = new Error();
    error.status = 'Error';
    error.mes = 'Логин и/или пароль введены неверно!';
    ctx.response.body = error;
  } else {
    const response = {};
    response.status = 'OK';
    response.mes = 'Aвторизация успешна!';
    ctx.response.body = response;
  }

});

module.exports = router;
