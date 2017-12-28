const router = require('koa-router')();
const mongoose = require('mongoose');

router.post('/api/login', async ctx => {
  try {
    const data = JSON.parse(ctx.request.body);
    const User = mongoose.model('Users');

    const user = await User.findOne(data);

    if (user) {
      ctx.status = 200;
      ctx.response.body = user;
    } else {
      ctx.status = 404;
      ctx.response.body = {error: 'Неверно указан логин и/или пароль'};
    }
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.response.body = {error: error.message};
    ctx.app.emit('error', error, ctx);
  }
});

module.exports = router;
