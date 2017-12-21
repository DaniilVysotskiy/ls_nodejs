var express = require('express');
var router = express.Router();

/* GET my-work page. */
router.get('/', (req, res, next) => {
  res.render('pages/my-work', { title: 'Мои работы' });
});

module.exports = router;
