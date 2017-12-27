const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  access_token: String,
  username: {
    type: String,
    required: [true, 'Укажите имя пользователя'],
    index: {unique: true}
  },
  password: {
    type: String,
    required: [true, 'Укажите пароль пользователя']
  },
  surName: String,
  firstName: String,
  middleName: String,
  permissionId: Number,
  image: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Users', userSchema);
