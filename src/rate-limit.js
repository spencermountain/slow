/**
 * Map promise-returning callbacks with a bounded number of active operations.
 * Callback failures become null; invalid arguments reject the operation.
 * @template T, R
 * @param {readonly T[]} arr
 * @param {(value: T) => PromiseLike<R>} fn
 * @param {number} [limit=5]
 * @returns {Promise<(Awaited<R> | null)[]>}
 */
export default async function rateLimit(arr, fn, limit = 5) {
  if (!Array.isArray(arr)) throw new TypeError('Expected an array')
  if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new RangeError('Concurrency must be a positive safe integer')
  }

  const length = arr.length
  const results = new Array(length)
  let next = 0
  let stopped = false

  async function worker() {
    while (!stopped && next < length) {
      const i = next++
      let promise
      let isThenable
      try {
        promise = fn(arr[i])
        // Reading a thenable's getter can throw, just like the callback itself.
        isThenable = promise != null && typeof promise.then === 'function'
      } catch {
        results[i] = null
        continue
      }
      if (!isThenable) {
        stopped = true
        throw new TypeError('Callback must return a promise')
      }
      try {
        results[i] = await promise
      } catch {
        results[i] = null
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, length) }, () => worker()))
  return results
}
