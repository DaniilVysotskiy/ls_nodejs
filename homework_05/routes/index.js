const router = require('koa-router')();

/* GET home page. */
router.get('*', async ctx => {
  ctx.body = ctx.render('/index');
});

module.exports = router;
