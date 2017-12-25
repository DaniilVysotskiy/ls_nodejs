const router = require('koa-router')();
const nodemailer = require('nodemailer');
const config = require('../config/mail.json');

/* GET contact-me page. */
router.get('/contact-me', async ctx => {
  ctx.body = ctx.render('pages/contact-me');
});

router.post('/contact-me', async ctx => {
  const name = ctx.request.body.name;
  const email = ctx.request.body.email;
  const message = ctx.request.body.message;

  if (!name || !email || !message) {
    const error = new Error();
    error.mes = 'Все поля нужно заполнить!';
    error.status = 'Error';
    ctx.response.body = error;
  }
  // инициализируем модуль для отправки писем и указываем данные из конфига
  const transporter = nodemailer.createTransport(config.mail.smtp);
  const mailOptions = {
    from: config.mail.smtp.auth.user, // здесь должен быть оригинальный отправитель, иначе яндекс ругается
    to: config.mail.smtp.auth.user,
    subject: config.mail.subject,
    text:
      message.trim().slice(0, 500) +
      `\n Отправитель: <${email}>`
  };

  // отправляем почту
  const sendMail = () => {
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, error => {
        if (error) {
          reject(error);
        }
        resolve();
      });
    });
  };

  const error = await sendMail(name, email, message);
  if (error) {
    ctx.response.body = {
      mes: `При отправке письма произошла ошибка!: ${error}`,
      status: "Error"
    };
  }

  ctx.response.body = {
    mes: "Сообщение отправлено!",
    status: "OK"
  };
});

module.exports = router;
