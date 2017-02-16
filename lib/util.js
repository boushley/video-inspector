const fs = require('fs');

function exit(code, msg) {
  process.nextTick(function() { process.exit(code) });

  if (code === 0) {
    console.log(msg);
  } else {
    console.error(msg);
  }
}

function promiseExit(msg) {
  exit(1, msg);
}


function rateLimit(fn, interval) {
  const queue = [];
  let currentTimeout;

  return (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({args, resolve, reject});
      tryStartQueue();
    });
  };

  function tryStartQueue() {
    if (!currentTimeout) {
      processQueue();
    }
  }

  function processQueue() {
    currentTimeout = null;
    if (queue.length < 1) {
      return;
    }

    let call = queue.shift();
    fn(...call.args).then(call.resolve, call.reject);

    currentTimeout = setTimeout(processQueue, interval);
  }
}

function limitConcurrent(fn, concurrent) {
  const queue = [];
  let running = 0;

  return (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({args, resolve, reject});
      tryStartQueue();
    });
  };

  function tryStartQueue() {
    while (running < concurrent && queue.length > 0) {
      processQueue();
    }
  }

  function processQueue() {
    if (queue.length < 1) {
      return;
    }

    running += 1;

    let call = queue.shift();
    fn(...call.args)
      .then(function(obj) { running -= 1; call.resolve(obj); tryStartQueue(); })
      .catch(function(err) { running -= 1; call.reject(err);  tryStartQueue();});
  }
}

function tryMkdir(dir) {
  try {
    fs.mkdirSync(dir);
  } catch (e) {
    console.log(`Got mkdir error! ${e}`);
  }
}

function createNonCircularPrinter() {
  const cache = [];
  return function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return '[Circular]';
      }
      cache.push(value);
    }
    return value;
  }
}

function createSingleDepthPrinter() {
  let hasPrintedRootObject = false;
  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (hasPrintedRootObject) {
        return '[Object]';
      } else {
        hasPrintedRootObject = true;
      }
    }
    return value;
  }
}

module.exports = {exit, promiseExit, rateLimit, limitConcurrent, tryMkdir, createNonCircularPrinter, createSingleDepthPrinter};
