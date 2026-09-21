import rateLimit from './rate-limit.js'

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
}
methods.serial = methods.one
methods.linear = methods.one
methods.crawl = methods.three
methods.walk = methods.five
methods.run = methods.ten
methods.sprint = methods.fifteen

export default methods
