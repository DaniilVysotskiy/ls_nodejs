const router = require('koa-router')();
const { createReadStream } = require('fs');
const koaRequest = require('koa-http-request');

/* GET home page. */
router.get('*', async (ctx, next) => {
  ctx.type = 'html';
  ctx.body = createReadStream(`${__dirname}/../public/main.html`);
  next();
});

router.use(koaRequest({
  json: true,
  timeout: 3000,
  host: 'http://localhost:3000'
}));

router.use(async ctx => {
  let response = await ctx.post('/api/authFromToken', null, {
    'User-Agent': 'koa-http-request'
  });

  ctx.response.body = response;
});

module.exports = router;
