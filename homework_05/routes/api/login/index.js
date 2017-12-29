const router = require('koa-router')();
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

router.post('/api/login', async ctx => {
  try {
    const data = JSON.parse(ctx.request.body);
    const User = mongoose.model('Users');
    const newToken = uuidv4();

    let user = await User.findOneAndUpdate(data, {$set: {access_token: newToken}}, {new: true});

    if (user) {
      ctx.cookies.set('access_token', newToken);
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
