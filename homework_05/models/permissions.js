const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  _id: Schema.Types.ObjectId,
  rights: {
    type: Object,
    required: true
  },
  userId: {type: Schema.Types.ObjectId, ref: 'Users'}
});

module.exports = mongoose.model('Permissions', permissionSchema);
