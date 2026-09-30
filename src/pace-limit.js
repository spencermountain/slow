// Limits callback starts per second, spaced evenly without waiting for completion.
const paceLimit = async function (arr, fn, pace = 5) {
  if (!Array.isArray(arr)) throw new TypeError('Expected an array')
  if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
  if (!Number.isSafeInteger(pace) || pace < 1) {
    throw new RangeError('Pace must be a positive safe integer')
  }

  const length = arr.length
  const results = new Array(length)
  const pending = []
  const interval = 1000 / pace
  let lastStart

  for (let i = 0; i < length; i++) {
    if (i > 0) {
      let remaining = interval - (globalThis.performance.now() - lastStart)
      while (remaining > 0) {
        await new Promise(resolve => { setTimeout(resolve, Math.ceil(remaining)) })
        remaining = interval - (globalThis.performance.now() - lastStart)
      }
    }
    lastStart = globalThis.performance.now()
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
    if (!isThenable) throw new TypeError('Callback must return a promise')
    // Handle each rejection immediately, even while later starts are waiting.
    pending.push(Promise.resolve(promise).then(
      value => { results[i] = value },
      () => { results[i] = null }
    ))
  }

  await Promise.all(pending)
  return results
}
export default paceLimit
