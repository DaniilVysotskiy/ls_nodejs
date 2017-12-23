const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const db = require('../models/db');

/* GET work page. */
router.get('/', (req, res, next) => {
  const works = db.get('works').value();

  res.render('pages/my-work', {
    isAuthorized: req.session.isAuthorized,
    works: works
  });
});

router.post('/', (req, res, next) => {
  const form = new formidable.IncomingForm();
  const upload = 'app/upload';
  let fileName;

  form.uploadDir = path.resolve(__dirname, '../', upload);

  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir);
  }

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    const { projectName, projectUrl, text } = fields;

    if (projectName === void 0 || projectUrl === void 0 || text === void 0) {
      const error = new Error();
      error.mes = 'Все поля обязательны для заполнения';
      error.status = 'Error';
      res.send(error);
    }

    if (files.file.name === '' || files.file.size === 0) {
      const error = new Error();
      error.mes = 'Не загружена картинка проекта';
      error.status = 'Error';
      return res.send(error);
    }

    fileName = path.join(form.uploadDir, files.file.name);

    fs.rename(files.file.path, fileName, error => {
      if (error) {
        console.error(error);
        fs.unlink(fileName);
        fs.rename(files.file.path, fileName);
      }

      let imgLink = path.join('img/work', files.file.name);

      db.get('works')
        .push({ name: projectName, link: projectUrl, img: imgLink, desc: text })
        .write();

      const response = {};
      response.mes = 'Проект успешно загружен';
      response.status = 'OK';
      res.send(response);
    });
  });
});

module.exports = router;
