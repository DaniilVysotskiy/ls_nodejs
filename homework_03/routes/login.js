const express = require('express');
const router = express.Router();
const db = require('../models/db');

/* GET login page. */
router.get('/', (req, res, next) => {
  res.render('pages/login', { title: 'Авторизация' });
});

router.post('/', (req, res, next) => {
  const login = req.body.login;
  const password = req.body.password;
  
  const dbUser = db.get('users').find({ login: login, password: password }).value();

  if(!dbUser) {
    const err = new Error();
    err.status = 'Error';
    err.mes = 'Логин и/или пароль введены неверно!';
    res.send(err);
  } else {
    const response = {};
    response.status = 'OK';
    response.mes = 'Aвторизация успешна!';
    res.send(response);
  }

});

module.exports = router;
