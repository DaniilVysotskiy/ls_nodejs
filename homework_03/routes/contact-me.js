const express = require('express');
const router = express.Router();

/* GET contact-me page. */
router.get('/', (req, res, next) => {
  res.render('pages/contact-me', { title: 'Контакты' });
});

module.exports = router;
