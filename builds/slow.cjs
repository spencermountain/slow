/* slow 1.1.0 MIT */
'use strict';

/**
 * Map promise-returning callbacks with a bounded number of active operations.
 * Callback failures become null; invalid arguments reject the operation.
 * @template T, R
 * @param {readonly T[]} arr
 * @param {(value: T) => PromiseLike<R>} fn
 * @param {number} [limit=5]
 * @returns {Promise<(Awaited<R> | null)[]>}
 */
async function rateLimit(arr, fn, limit = 5) {
  if (!Array.isArray(arr)) throw new TypeError('Expected an array')
  if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError('Concurrency must be a positive safe integer')
  }

  const length = arr.length;
  const results = new Array(length);
  let next = 0;
  let stopped = false;

  async function worker() {
    while (!stopped && next < length) {
      const i = next++;
      let promise;
      let isThenable;
      try {
        promise = fn(arr[i]);
        // Reading a thenable's getter can throw, just like the callback itself.
        isThenable = promise != null && typeof promise.then === 'function';
      } catch {
        results[i] = null;
        continue
      }
      if (!isThenable) {
        stopped = true;
        throw new TypeError('Callback must return a promise')
      }
      try {
        results[i] = await promise;
      } catch {
        results[i] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, length) }, () => worker()));
  return results
}

/**
 * @template T, R
 * @param {readonly T[]} arr
 * @param {(value: T) => PromiseLike<R>} fn
 * @param {{ concurrency?: number }} [options]
 * @returns {Promise<(Awaited<R> | null)[]>}
 */
async function map(arr, fn, { concurrency = 5 } = {}) {
  return rateLimit(arr, fn, concurrency)
}

const methods = {
  map,
  one: (arr, fn) => rateLimit(arr, fn, 1),
  two: (arr, fn) => rateLimit(arr, fn, 2),
  three: (arr, fn) => rateLimit(arr, fn, 3),
  four: (arr, fn) => rateLimit(arr, fn, 4),
  five: (arr, fn) => rateLimit(arr, fn, 5),
  ten: (arr, fn) => rateLimit(arr, fn, 10),
  fifteen: (arr, fn) => rateLimit(arr, fn, 15),
};
methods.serial = methods.one;
methods.linear = methods.one;
methods.crawl = methods.three;
methods.walk = methods.five;
methods.run = methods.ten;
methods.sprint = methods.fifteen;

module.exports = methods;
