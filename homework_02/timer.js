const http = require('http');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const INTERVAL = process.env.TIME_INTERVAL || 1000;
const TIMEOUT = process.env.TIMEOUT || 5000;
const PORT = process.env.PORT || 3000;

http.createServer(function (request, response) {
  let linkInterval = setInterval(() => {
    const currentTime = new Date().toUTCString();

    console.log(currentTime);
    response.write(currentTime + '\n');
  }, INTERVAL);

  setTimeoutPromise(TIMEOUT).then(() => {
    console.log('DONE');
    clearInterval(linkInterval);
    response.end();
  });
}).listen(PORT).on('listening', function() {
  console.log('HTTP listening:' + PORT);
});
