const router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const db = require('../models/db');

/* GET work page. */
router.get('/my-work', async ctx => {
  const works = db.get('works').value();

  ctx.body = ctx.render('pages/my-work', {
    isAuthorized: ctx.session.isAuthorized,
    works: works
  });
});

router.post('/my-work', async ctx => {
  const data = ctx.request.body;
  const upload = 'app/upload';
  let fileName, imgLink;

  uploadDir = path.resolve(__dirname, '../', upload);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const { projectName, projectUrl, text } = data.fields;
  const files = data.files;

  if (projectName === void 0 || projectUrl === void 0 || text === void 0) {
    const error = new Error();
    error.mes = 'Все поля обязательны для заполнения';
    error.status = 'Error';
    ctx.response.body = error;
  }

  if (files.file.name === '' || files.file.size === 0) {
    const error = new Error();
    error.mes = 'Не загружена картинка проекта';
    error.status = 'Error';
    ctx.response.body = error;
  }

  fileName = path.join(uploadDir, files.file.name);

  fs.rename(files.file.path, fileName, error => {
    if (error) {
      console.error(error);
      fs.unlink(fileName);
      fs.rename(files.file.path, fileName);
    }

    imgLink = path.join('upload', files.file.name);

    db.get('works')
      .push({ name: projectName, link: projectUrl, img: imgLink, desc: text })
      .write();
      
    const response = {};
    response.mes = 'Проект успешно загружен';
    response.status = 'OK';
    ctx.response.body = response;
  });
});


module.exports = router;
