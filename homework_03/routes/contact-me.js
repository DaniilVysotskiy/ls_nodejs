var express = require('express');
var router = express.Router();

/* GET contact-me page. */
router.get('/', (req, res, next) => {
  res.render('pages/contact-me', { title: 'Контакты' });
});

module.exports = router;
