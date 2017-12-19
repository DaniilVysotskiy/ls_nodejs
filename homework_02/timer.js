const http = require('http');
const pug = require('pug');
const path = require('path');

const index = path.join(__dirname, '/views/index.pug');

let timerInterval = process.argv[2] || null;
let timerLast = process.argv[3] || null;
// e.g. node timer 1000 10000 -- show time every sec for 10 secs

const stdin = process.stdin;
const stdout = process.stdout;

function ask (question, validate) {
  return new Promise((resolve, reject) => {
    stdin.resume();
    stdout.write(`${question}: `);

    stdin.once('data', data => {
      data = data.toString().trim();

      if (validate.test(data)) {
        resolve(data);
      } else {
        stdout.write(`It should match: ${validate}\n`);
        resolve(ask(question, validate));
      }
    });
  });
}

async function askProcess () {
  try {
    timerInterval = await ask('Write timer interval in miliseconds', /\d*/);
    timerLast = await ask('Write timer lasts in miliseconds', /\d*/);
    startServer();
    console.log('Http server started. Send http request via browser to see the timer.');
  } catch (error) {
    console.error(error);
  }
}

async function initProcess (interval, last) {
  try {
    await timer(interval, last);
    startServer();
    console.log('Http server started. Send http request via browser to see the timer.');
  } catch (error) {
    console.error(error);
  }
}

function timer (interval, last, setTimeoutCb, finalCb) {
  const startTime = new Date().getTime();
  const period = setInterval(() => {
    if (new Date().getTime() - startTime > last) {
      if (finalCb && typeof finalCb === 'function') {
        finalCb();
      }
      clearInterval(period);
    }

    let currentTimeGMT = new Date().toISOString();
    if (setTimeoutCb && typeof setTimeoutCb === 'function') {
      setTimeoutCb(currentTimeGMT);
    }
  }, interval);
}

function startServer () {
  http.createServer((request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    const compiledFunction = pug.compileFile(index);

    if (request.headers.accept.match('text/html')) {
      timer(timerInterval, timerLast, str => {
        console.log('Current time (GMT): ' + str);
        response.write(compiledFunction({f: str}));
      }, () => {
        setTimeout(() => {
          response.end();
        }, 0);
      });
    }
  }).listen(3000);
}

if (!timerInterval && !timerLast) {
  askProcess();
} else {
  initProcess(timerInterval, timerLast);
}
