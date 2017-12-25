const router = require('koa-router')();

/* GET home page. */
router.get('/', async ctx => {
  ctx.body = ctx.render('pages/index');
});

module.exports = router;
