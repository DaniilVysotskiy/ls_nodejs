var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', (req, res, next) => {
  res.render('pages/login', { title: 'Авторизация' });
});

module.exports = router;
