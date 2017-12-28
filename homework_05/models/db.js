const mongoose = require('mongoose');
const config = require('../config/db');

mongoose.Promise = global.Promise;

mongoose.connect(
  `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`,
  {useMongoClient: true}
).catch(error => {
  console.log(error);
  throw error;
});

mongoose.connection.on('connected', () => {
  console.log(`Mongoose default connection open mongodb://${config.db.host}:${config.db.port}/${config.db.name}`);
});

// If the connection throws an error
mongoose.connection.on('error', error => {
  console.log('Mongoose default connection error: ' + error);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

require('./users');
require('./permissions');
