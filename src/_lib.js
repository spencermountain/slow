/* eslint-disable no-use-before-define, consistent-return */

// Interrupt a wait without cancelling the underlying promise. Its handlers stay
// attached so work that ignores cancellation can still reject safely afterward.
const waitFor = (promise, signal) => {
  if (!signal) {
    return promise
  }
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort)
    const onAbort = () => { cleanup(); reject(signal.reason) }
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      value => { cleanup(); resolve(value) },
      error => { cleanup(); reject(error) }
    )
    // Also covers an abort that happened synchronously inside a callback.
    if (signal.aborted) {
      onAbort()
    }
  })
}


// Use a monotonic clock so wall-clock adjustments cannot change the pace.
// Timers can wake early; recheck after each wait before allowing another start.
const waitUntil = async (deadline, signal) => {
  signal?.throwIfAborted()
  const remaining = deadline - performance.now()
  if (remaining <= 0) {
    return
  }
  // Very small paces can exceed the timer's maximum delay; wait in chunks.
  const delay = Math.min(Math.ceil(remaining), 2147483647)
  let timer
  try {
    await waitFor(new Promise(resolve => { timer = setTimeout(resolve, delay) }), signal)
  } finally {
    // An aborted pacing wait must not leave a timer keeping Node alive.
    clearTimeout(timer)
  }
  return waitUntil(deadline, signal)
}

export { waitFor, waitUntil }
