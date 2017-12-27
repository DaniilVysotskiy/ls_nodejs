const router = require('koa-router')();
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

router.post('/api/saveNewUser', async ctx => {
  try {
    const data = JSON.parse(ctx.request.body);
    const User = mongoose.model('Users');

    let newUser = new User(data);
    newUser.createdAt = Date.now();
    newUser.access_token = uuidv4();

    const user = await newUser.save();

    ctx.status = 201;
    ctx.response.body = user;
  } catch (error) {
    ctx.status = error.status || 500;
    if (error.message.match('E11000')) {
      ctx.response.body = {error: 'Пользователь с таким именем уже есть!'};
    } else {
      ctx.response.body = {error: error.message};
    }
    ctx.app.emit('error', error, ctx);
  }
});

module.exports = router;
