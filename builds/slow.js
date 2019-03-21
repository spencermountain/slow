/* slow v1.0.0
   github.com/spencermountain/slow
   MIT
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.slow = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var methods = {
  walk: function () {
    var _walk = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(arr, fn, done) {
      var results, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, val, res;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              results = [];
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 4;
              _iterator = arr[Symbol.iterator]();

            case 6:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 15;
                break;
              }

              val = _step.value;
              _context.next = 10;
              return fn(val);

            case 10:
              res = _context.sent;
              results.push(res);

            case 12:
              _iteratorNormalCompletion = true;
              _context.next = 6;
              break;

            case 15:
              _context.next = 21;
              break;

            case 17:
              _context.prev = 17;
              _context.t0 = _context["catch"](4);
              _didIteratorError = true;
              _iteratorError = _context.t0;

            case 21:
              _context.prev = 21;
              _context.prev = 22;

              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }

            case 24:
              _context.prev = 24;

              if (!_didIteratorError) {
                _context.next = 27;
                break;
              }

              throw _iteratorError;

            case 27:
              return _context.finish(24);

            case 28:
              return _context.finish(21);

            case 29:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[4, 17, 21, 29], [22,, 24, 28]]);
    }));

    function walk(_x, _x2, _x3) {
      return _walk.apply(this, arguments);
    }

    return walk;
  }()
};
module.exports = methods;

},{}]},{},[1])(1)
});
