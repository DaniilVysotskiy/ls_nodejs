const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
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
  image: String,
  permission: Object,
  permissionId: { type: Schema.Types.ObjectId, ref: 'Permissions' },
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Users', userSchema);
