/* slow v1.0.0
   github.com/spencermountain/slow
   MIT
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.slow = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";

var rate = _dereq_('./rate-limit');

var methods = {
  crawl: function crawl(arr, fn) {
    return rate(arr, fn, 3);
  },
  walk: function walk(arr, fn) {
    return rate(arr, fn, 5);
  },
  run: function run(arr, fn) {
    return rate(arr, fn, 10);
  },
  sprint: function sprint(arr, fn) {
    return rate(arr, fn, 15);
  }
};
module.exports = methods;

},{"./rate-limit":2}],2:[function(_dereq_,module,exports){
"use strict";

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

module.exports = rateLimit;

},{}]},{},[1])(1)
});
