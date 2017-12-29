const router = require('koa-router')();
const mongoose = require('mongoose');

router.post('/api/authFromToken', async ctx => {
  try {
    const data = ctx.cookie;
    const User = mongoose.model('Users');

    let user = await User.findOne(data);

    if (user) {
      ctx.status = 200;
      ctx.response.body = user;
    } else {
      ctx.status = 404;
      ctx.response.body = {error: 'Нет пользователя с таким токеном'};
    }
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.response.body = {error: error.message};
    ctx.app.emit('error', error, ctx);
  }
});

module.exports = router;
