// Use a monotonic clock so wall-clock adjustments cannot change the pace.
// Timers can wake early; recheck after each wait before allowing another start.
const waitUntil = async deadline => {
  const remaining = deadline - globalThis.performance.now()
  if (remaining <= 0) return
  await new Promise(resolve => { setTimeout(resolve, Math.ceil(remaining)) })
  return waitUntil(deadline)
}

/**
 * Map loop with two independent limits on active callbacks and starts per second.
 * Omitted limits are unrestricted. The first callback starts immediately.
 * Results retain input order; callback failures become null.
 */
const combinedLimit = async function (arr, fn,  maxFlow, maxPace ) {
  // Validate before processing, including when the input array is empty.
  if (!Array.isArray(arr)) throw new TypeError('Expected an array')
  if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
  if (maxFlow !== undefined && (!Number.isSafeInteger(maxFlow) || maxFlow < 1)) {
    throw new RangeError('Concurrency must be a positive safe integer')
  }
  if (maxPace !== undefined && (!Number.isSafeInteger(maxPace) || maxPace < 1)) {
    throw new RangeError('Pace must be a positive safe integer')
  }

  const length = arr.length // Keep the original input length throughout the call.
  const results = new Array(length)
  const pending = []
  const concurrencyLimit = maxFlow ?? Infinity
  const intervalMs = maxPace === undefined ? 0 : 1000 / maxPace
  let activeCount = 0
  let resumeScheduler
  let lastStartedAt

  // Observe each promise immediately and release its slot on either outcome.
  // These handlers remain attached if a later invalid return rejects the map.
  async function collectResult(promise, index) {
    try {
      results[index] = await promise
    } catch {
      results[index] = null
    } finally {
      activeCount--
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
    if (activeCount >= concurrencyLimit) {
      await new Promise(resolve => { resumeScheduler = resolve })
    }

    // A free slot stays free during this wait. Measure from the actual previous
    // start, so time spent at full concurrency never earns a catch-up burst.
    if (intervalMs > 0 && index > 0) {
      await waitUntil(lastStartedAt + intervalMs)
    }
    if (intervalMs > 0) {
      lastStartedAt = globalThis.performance.now()
    }

    let promise
    let isThenable
    try {
      promise = fn(arr[index])
      // Accessing a custom thenable's `then` getter can itself throw.
      isThenable = promise != null && typeof promise.then === 'function'
    } catch {
      // Failed attempts still count toward pace, but occupy no active slot.
      results[index] = null
      continue
    }

    // A non-promise is an API misuse: stop launching work and reject the map.
    // Previously started callbacks still have their failures handled above.
    if (!isThenable) throw new TypeError('Callback must return a promise')
    activeCount++
    pending.push(collectResult(promise, index))
  }

  // Launching the last callback is not completion; wait for every result.
  await Promise.all(pending)
  return results
}
export default combinedLimit
