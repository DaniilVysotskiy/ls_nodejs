const router = require('koa-router')();
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

router.post('/api/saveNewUser', async ctx => {
  try {
    const data = JSON.parse(ctx.request.body);
    const User = mongoose.model('Users');
    const Permissions = mongoose.model('Permissions');
    // rewrite permissions for secure purposes
    const permissionsDefault = {
      chat: {C: false, R: true, U: true, D: false},
      news: {C: false, R: true, U: false, D: false},
      setting: {C: false, R: false, U: false, D: false},
    };
    const newToken = uuidv4();
    let result;

    let newUser = new User(data);
    newUser._id = new mongoose.Types.ObjectId();
    newUser.createdAt = Date.now();
    newUser.access_token = newToken;

    let user = await newUser.save();

    let newUserPermissions = new Permissions({
      _id: new mongoose.Types.ObjectId(),
      rights: permissionsDefault,
      userId: user._id
    });

    let permissions = await newUserPermissions.save();

    await user.update({$set: {permissionId: permissions._id}});
    await User.findOne({_id: user._id})
      .populate({path: 'permissionId', select: 'rights'})
      .exec((error, populatedUser) => {
        if (error) ctx.app.emit('error', error, ctx);

        populatedUser.permission = populatedUser.permissionId.rights;
        result = populatedUser;
      });

    ctx.cookies.set('access_token', newToken);
    ctx.status = 201;
    ctx.response.body = result;
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
