// asyncToGenerator

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

// ===============================================

// set-interval-async/dynamic

const MAX_INTERVAL_MS = Math.pow(2, 31) - 1;

function clearIntervalAsync(_x) {
  return _clearIntervalAsync.apply(this, arguments);
}

function _clearIntervalAsync() {
  _clearIntervalAsync = _asyncToGenerator(function* (timer) {
    timer.stopped = true;

    for (var _i = 0, _Object$values = Object.values(timer.timeouts); _i < _Object$values.length; _i++) {
      const timeout = _Object$values[_i];
      clearTimeout(timeout);
    }

    const noop = () => {};

    const promises = Object.values(timer.promises).map(promise => {
      promise.catch(noop);
    });
    const noopInterval = setInterval(noop, MAX_INTERVAL_MS);
    yield Promise.all(promises);
    clearInterval(noopInterval);
  });
  return _clearIntervalAsync.apply(this, arguments);
}

class SetIntervalAsyncError extends Error {}

Object.defineProperty(SetIntervalAsyncError.prototype, 'name', {
  value: 'SetIntervalAsyncError'
});

const MIN_INTERVAL_MS = 10;

function validateHandler(handler) {
  if (!(typeof handler === 'function')) {
    throw new SetIntervalAsyncError('Invalid argument: "handler". Expected a function.');
  }
}

function validateInterval(interval) {
  if (!(typeof interval === 'number' && MIN_INTERVAL_MS <= interval)) {
    throw new SetIntervalAsyncError(`Invalid argument: "interval". Expected a number greater than or equal to ${MIN_INTERVAL_MS}.`);
  }
}

class SetIntervalAsyncTimer {
  constructor() {
    this.stopped = false;
    this.id = 0;
    this.timeouts = {};
    this.promises = {};
  }

}

function setIntervalAsync(handler, interval, ...args) {
  validateHandler(handler);
  validateInterval(interval);
  const timer = new SetIntervalAsyncTimer();
  const id = timer.id;
  timer.timeouts[id] = setTimeout(timeoutHandler, interval, timer, handler, interval, ...args);
  return timer;
}

function timeoutHandler(timer, handler, interval, ...args) {
  const id = timer.id;
  timer.promises[id] = _asyncToGenerator(function* () {
    const startTime = new Date();

    try {
      yield handler(...args);
    } catch (err) {
      console.error(err);
    }

    const endTime = new Date();

    if (!timer.stopped) {
      const executionTime = endTime - startTime;
      const timeout = interval > executionTime ? interval - executionTime : 0;
      timer.timeouts[id + 1] = setTimeout(timeoutHandler, timeout, timer, handler, interval, ...args);
    }

    delete timer.timeouts[id];
    delete timer.promises[id];
  })();
  timer.id = id + 1;
}

export { SetIntervalAsyncError, SetIntervalAsyncTimer, clearIntervalAsync, setIntervalAsync };
