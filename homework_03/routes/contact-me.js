const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const config = require('../config/mail.json');

/* GET contact-me page. */
router.get('/', (req, res, next) => {
  res.render('pages/contact-me', { title: 'Обратная связь' });
});

router.post('/', (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.message) {
    const error = new Error();
    error.mes = 'Все поля нужно заполнить!';
    error.status = 'Error';
    return res.send(error);
  }
  // инициализируем модуль для отправки писем и указываем данные из конфига
  const transporter = nodemailer.createTransport(config.mail.smtp);
  const mailOptions = {
    from: config.mail.smtp.auth.user, // здесь должен быть оригинальный отправитель, иначе яндекс ругается
    to: config.mail.smtp.auth.user,
    subject: config.mail.subject,
    text:
      req.body.message.trim().slice(0, 500) +
      `\n Отправитель: <${req.body.email}>`
  };

  // отправляем почту
  transporter.sendMail(mailOptions, (error, info) => {
    // если есть ошибки при отправке - сообщаем об этом
    if (error) {
      error.mes = `При отправке письма произошла ошибка!: ${error}`;
      error.status = 'Error';
      return res.send(error);
    }
    const response = {};
    response.mes = 'Письмо успешно отправлено!';
    response.status = 'OK';
    res.send(response);
  });
});

module.exports = router;
