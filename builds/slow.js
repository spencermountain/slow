/* slow 2.0.0 MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.slow = {}));
})(this, (function (exports) { 'use strict';

  /* eslint-disable no-use-before-define, consistent-return */

  // Interrupt a wait without cancelling the underlying promise. Its handlers stay
  // attached so work that ignores cancellation can still reject safely afterward.
  const waitFor = (promise, signal) => {
    if (!signal) {
      return promise
    }
    return new Promise((resolve, reject) => {
      const cleanup = () => signal.removeEventListener('abort', onAbort);
      const onAbort = () => { cleanup(); reject(signal.reason); };
      signal.addEventListener('abort', onAbort, { once: true });
      promise.then(
        value => { cleanup(); resolve(value); },
        error => { cleanup(); reject(error); }
      );
      // Also covers an abort that happened synchronously inside a callback.
      if (signal.aborted) {
        onAbort();
      }
    })
  };


  // Use a monotonic clock so wall-clock adjustments cannot change the pace.
  // Timers can wake early; recheck after each wait before allowing another start.
  const waitUntil = async (deadline, signal) => {
    signal?.throwIfAborted();
    const remaining = deadline - globalThis.performance.now();
    if (remaining <= 0) {
      return
    }
    // Very small paces can exceed the timer's maximum delay; wait in chunks.
    const delay = Math.min(Math.ceil(remaining), 2147483647);
    let timer;
    try {
      await waitFor(new Promise(resolve => { timer = setTimeout(resolve, delay); }), signal);
    } finally {
      // An aborted pacing wait must not leave a timer keeping Node alive.
      globalThis.clearTimeout(timer);
    }
    return waitUntil(deadline, signal)
  };

  // Normalize only explicit unlimited values; NaN, false, and strings remain invalid.
  const normalizeLimit = (value) => {
    return value == null || value === 0 || value === Infinity ? undefined : value
  };

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
    lanes = normalizeLimit(lanes);
    maxPace = normalizeLimit(maxPace);
    if (lanes != null && (!Number.isSafeInteger(lanes) || lanes < 1)) {
      throw new RangeError('Concurrency must be a positive safe integer, got ' + lanes)
    }
    if (maxPace !== undefined && (!Number.isFinite(maxPace) || maxPace <= 0)) {
      throw new RangeError('Pace must be a positive finite number, got ' + maxPace)
    }
    signal?.throwIfAborted();

    const length = arr.length; // Keep the original input length throughout the call.
    const results = new Array(length);
    // Keep only unfinished tasks; completed results live in the results array.
    const pending = new Map();
    const concurrencyLimit = lanes ?? Infinity;
    const intervalMs = maxPace === undefined ? 0 : 1000 / maxPace;
    let resumeScheduler;
    let lastStartedAt;
    const context = { signal };

    // Observe each promise immediately and release its slot on either outcome.
    // These handlers stay attached if cancellation rejects the map early.
    async function collectResult(promise, index) {
      try {
        results[index] = await promise;
      } catch {
        results[index] = null;
      } finally {
        pending.delete(index);
        if (resumeScheduler) {
          const resume = resumeScheduler;
          resumeScheduler = undefined;
          resume();
        }
      }
    }

    // This is the only place that starts work. Completion handlers only free slots,
    // so there can be just one scheduler waiting for a slot at any given time.
    for (let index = 0; index < length; index++) {
      signal?.throwIfAborted();
      if (pending.size >= concurrencyLimit) {
        await waitFor(
          new Promise((resolve) => {
            resumeScheduler = resolve;
          }),
          signal
        );
      }

      // A free slot stays free during this wait. Measure from the actual previous
      // start, so time spent at full concurrency never earns a catch-up burst.
      if (intervalMs > 0 && index > 0) {
        await waitUntil(lastStartedAt + intervalMs, signal);
      }
      signal?.throwIfAborted();
      if (intervalMs > 0) {
        lastStartedAt = globalThis.performance.now();
      }

      let value;
      let isThenable;
      try {
        value = fn(arr[index], context);
        // Accessing a custom thenable's `then` getter can itself throw.
        isThenable = value != null && typeof value.then === 'function';
      } catch {
        // Failed attempts still count toward pace, but occupy no active slot.
        results[index] = null;
        continue
      }

      // Synchronous work is already complete. Preserve its value (including null
      // and undefined) without occupying a lane; the start still counts for pace.
      if (!isThenable) {
        results[index] = value;
        continue
      }

      pending.set(index, collectResult(value, index));
    }

    // Launching the last callback is not completion; wait for every result.
    await waitFor(Promise.all(pending.values()), signal);
    signal?.throwIfAborted();
    return results
  };

  const map = async (arr, fn, opts = {}) => {
    return rateLimit(arr, fn, opts.concurrency, opts.pace, opts.signal)
  };

  // concurrency-only limits
  const serial = async (arr, fn) => rateLimit(arr, fn, 1);
  const linear = async (arr, fn) => rateLimit(arr, fn, 1);
  const maxOne = async (arr, fn) => rateLimit(arr, fn, 1);
  const maxTwo = async (arr, fn) => rateLimit(arr, fn, 2);
  const maxThree = async (arr, fn) => rateLimit(arr, fn, 3);
  const maxFour = async (arr, fn) => rateLimit(arr, fn, 4);
  const maxFive = async (arr, fn) => rateLimit(arr, fn, 5);

  // pace limits
  const onePerSec = async (arr, fn) => rateLimit(arr, fn, null, 1);
  const twoPerSec = async (arr, fn) => rateLimit(arr, fn, null, 2);
  const threePerSec = async (arr, fn) => rateLimit(arr, fn, null, 3);
  const fourPerSec = async (arr, fn) => rateLimit(arr, fn, null, 4);
  const fivePerSec = async (arr, fn) => rateLimit(arr, fn, null, 5);

  // combined concurrency and pace limits
  // (two-feet, but different paces)
  const crawl = async (arr, fn) => rateLimit(arr, fn, 2, 0.5);
  const stroll = async (arr, fn) => rateLimit(arr, fn, 2, 1);
  const walk = async (arr, fn) => rateLimit(arr, fn, 2, 2);
  const jog = async (arr, fn) => rateLimit(arr, fn, 2, 3);
  const run = async (arr, fn) => rateLimit(arr, fn, 2, 4);
  const sprint = async (arr, fn) => rateLimit(arr, fn, 2, 5);

  // (different concurrencies, but all 60bpm/adagio)
  const solo = async (arr, fn) => rateLimit(arr, fn, 1, 1);
  const duet = async (arr, fn) => rateLimit(arr, fn, 2, 1);
  const trio = async (arr, fn) => rateLimit(arr, fn, 3, 1);
  const quartet = async (arr, fn) => rateLimit(arr, fn, 4, 1);
  const quintet = async (arr, fn) => rateLimit(arr, fn, 5, 1);

  // The default is map itself, with every named method also available on it.
  const slow = Object.assign(map, {
    map,
    serial,
    linear,
    maxOne,
    maxTwo,
    maxThree,
    maxFour,
    maxFive,
    onePerSec,
    twoPerSec,
    threePerSec,
    fourPerSec,
    fivePerSec,
    crawl,
    stroll,
    walk,
    jog,
    run,
    sprint,
    solo,
    duet,
    trio,
    quartet,
    quintet,
  });

  exports.crawl = crawl;
  exports.default = slow;
  exports.duet = duet;
  exports.fivePerSec = fivePerSec;
  exports.fourPerSec = fourPerSec;
  exports.jog = jog;
  exports.linear = linear;
  exports.map = map;
  exports.maxFive = maxFive;
  exports.maxFour = maxFour;
  exports.maxOne = maxOne;
  exports.maxThree = maxThree;
  exports.maxTwo = maxTwo;
  exports.onePerSec = onePerSec;
  exports.quartet = quartet;
  exports.quintet = quintet;
  exports.run = run;
  exports.serial = serial;
  exports.solo = solo;
  exports.sprint = sprint;
  exports.stroll = stroll;
  exports.threePerSec = threePerSec;
  exports.trio = trio;
  exports.twoPerSec = twoPerSec;
  exports.walk = walk;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=slow.js.map
