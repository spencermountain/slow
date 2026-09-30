import { waitFor, waitUntil } from './_lib.js'

// Normalize only explicit unlimited values; NaN, false, and strings remain invalid.
const normalizeLimit = (value) => {
  return value == null || value === 0 || value === Infinity ? undefined : value
}

/**
 * Map loop with two independent limits on active callbacks and starts per second.
 * lanes = maximum number of concurrent callbacks
 * maxPace = maximum number of callbacks per second
 * Results retain input order; callback failures become null.
 */
const rateLimit = async function (arr, fn, lanes, maxPace, signal) {
  // Validate before processing, including when the input array is empty.
  if (!Array.isArray(arr) || typeof fn !== 'function') {
    throw new TypeError(
      `Expected an array and a callback function, got ${typeof arr}, ${typeof fn}`
    )
  }
  // normalize limits
  lanes = normalizeLimit(lanes)
  maxPace = normalizeLimit(maxPace)
  if (lanes != null && (!Number.isSafeInteger(lanes) || lanes < 1)) {
    throw new RangeError('Concurrency must be a positive safe integer, got ' + lanes)
  }
  if (maxPace !== undefined && (!Number.isFinite(maxPace) || maxPace <= 0)) {
    throw new RangeError('Pace must be a positive finite number, got ' + maxPace)
  }
  signal?.throwIfAborted()

  const length = arr.length // Keep the original input length throughout the call.
  const results = new Array(length)
  // Keep only unfinished tasks; completed results live in the results array.
  const pending = new Map()
  const concurrencyLimit = lanes ?? Infinity
  const intervalMs = maxPace === undefined ? 0 : 1000 / maxPace
  let resumeScheduler
  let lastStartedAt
  const context = { signal }

  // Observe each promise immediately and release its slot on either outcome.
  // These handlers stay attached if cancellation rejects the map early.
  async function collectResult(promise, index) {
    try {
      results[index] = await promise
    } catch {
      results[index] = null
    } finally {
      pending.delete(index)
      if (resumeScheduler) {
        const resume = resumeScheduler
        resumeScheduler = undefined
        resume()
      }
    }
  }

  // This is the only place that starts work. Completion handlers only free slots,
  // so there can be just one scheduler waiting for a slot at any given time.
  for (let index = 0; index < length; index++) {
    signal?.throwIfAborted()
    if (pending.size >= concurrencyLimit) {
      await waitFor(
        new Promise((resolve) => {
          resumeScheduler = resolve
        }),
        signal
      )
    }

    // A free slot stays free during this wait. Measure from the actual previous
    // start, so time spent at full concurrency never earns a catch-up burst.
    if (intervalMs > 0 && index > 0) {
      await waitUntil(lastStartedAt + intervalMs, signal)
    }
    signal?.throwIfAborted()
    if (intervalMs > 0) {
      lastStartedAt = globalThis.performance.now()
    }

    let value
    let isThenable
    try {
      value = fn(arr[index], context)
      // Accessing a custom thenable's `then` getter can itself throw.
      isThenable = value != null && typeof value.then === 'function'
    } catch {
      // Failed attempts still count toward pace, but occupy no active slot.
      results[index] = null
      continue
    }

    // Synchronous work is already complete. Preserve its value (including null
    // and undefined) without occupying a lane; the start still counts for pace.
    if (!isThenable) {
      results[index] = value
      continue
    }

    pending.set(index, collectResult(value, index))
  }

  // Launching the last callback is not completion; wait for every result.
  await waitFor(Promise.all(pending.values()), signal)
  signal?.throwIfAborted()
  return results
}
export default rateLimit
