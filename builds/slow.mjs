/* slow 1.1.0 MIT */
//only do foo promises at a time.
var rateLimit = function rateLimit(arr, fn) {
  var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
  return new Promise(function (resolve, reject) {
    //some validation
    if (!arr || !fn) {
      reject('Error: missing required parameters to rate-limit function');
      return;
    }

    if (arr.length === 0) {
      resolve([]);
      return;
    }

    var results = [];
    var n = limit - 1;
    var pending = 0; //simple recursion, but with then/finally

    var go = function go(i) {
      pending += 1;
      var p = fn(arr[i]);

      if (!p.then) {
        reject('Error: function must return a promise');
        return;
      }

      p.then(function (r) {
        results[i] = r;
      });
      p["catch"](function (e) {
        console.error(e);
        results[i] = null;
      });
      p["finally"](function () {
        pending -= 1;
        n += 1; //should we keep going?

        if (arr.length >= n + 1) {
          go(n);
        } else if (pending <= 0) {
          //no more to start - are we the last to finish?
          resolve(results);
        }
      });
    }; //fire-off first-n items


    var init = arr.length < limit ? arr.length : limit;

    for (var i = 0; i < init; i += 1) {
      go(i);
    }
  });
};

var rateLimit_1 = rateLimit;

var methods = {
  one: function one(arr, fn) {
    return rateLimit_1(arr, fn, 1);
  },
  two: function two(arr, fn) {
    return rateLimit_1(arr, fn, 2);
  },
  three: function three(arr, fn) {
    return rateLimit_1(arr, fn, 3);
  },
  four: function four(arr, fn) {
    return rateLimit_1(arr, fn, 4);
  },
  five: function five(arr, fn) {
    return rateLimit_1(arr, fn, 5);
  },
  ten: function ten(arr, fn) {
    return rateLimit_1(arr, fn, 10);
  },
  fifteen: function fifteen(arr, fn) {
    return rateLimit_1(arr, fn, 15);
  }
};
methods.serial = methods.one;
methods.linear = methods.one;
methods.crawl = methods.three;
methods.walk = methods.five;
methods.run = methods.ten;
methods.sprint = methods.fifteen;
var src = methods;

export default src;
