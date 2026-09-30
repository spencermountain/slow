/* slow 2.0.0 MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.slow = {}));
})(this, (function (exports) { 'use strict';

  // Use a monotonic clock so wall-clock adjustments cannot change the pace.
  // Timers can wake early; recheck after each wait before allowing another start.
  const waitUntil = async deadline => {
    const remaining = deadline - globalThis.performance.now();
    if (remaining <= 0) return
    // Very small paces can exceed the timer's maximum delay; wait in chunks.
    const delay = Math.min(Math.ceil(remaining), 2147483647);
    await new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
    return waitUntil(deadline)
  };

  /**
   * Map loop with two independent limits on active callbacks and starts per second.
   * lanes = maximum number of concurrent callbacks
   * maxPace = maximum number of callbacks per second
   * Omitted limits and null concurrency are unrestricted. Pace may be fractional.
   * The first callback starts immediately.
   * Results retain input order; callback failures become null.
   */
  const rateLimit = async function (arr, fn, lanes, maxPace) {
    // Validate before processing, including when the input array is empty.
    if (!Array.isArray(arr)) throw new TypeError('Expected an array')
    if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
    if (lanes != null && (!Number.isSafeInteger(lanes) || lanes < 1)) {
      throw new RangeError('Concurrency must be a positive safe integer')
    }
    if (maxPace !== undefined && (!Number.isFinite(maxPace) || maxPace <= 0)) {
      throw new RangeError('Pace must be a positive finite number')
    }

    const length = arr.length; // Keep the original input length throughout the call.
    const results = new Array(length);
    const pending = [];
    const concurrencyLimit = lanes ?? Infinity;
    const intervalMs = maxPace === undefined ? 0 : 1000 / maxPace;
    let activeCount = 0;
    let resumeScheduler;
    let lastStartedAt;

    // Observe each promise immediately and release its slot on either outcome.
    // These handlers remain attached if a later invalid return rejects the map.
    async function collectResult(promise, index) {
      try {
        results[index] = await promise;
      } catch {
        results[index] = null;
      } finally {
        activeCount--;
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
      if (activeCount >= concurrencyLimit) {
        await new Promise(resolve => { resumeScheduler = resolve; });
      }

      // A free slot stays free during this wait. Measure from the actual previous
      // start, so time spent at full concurrency never earns a catch-up burst.
      if (intervalMs > 0 && index > 0) {
        await waitUntil(lastStartedAt + intervalMs);
      }
      if (intervalMs > 0) {
        lastStartedAt = globalThis.performance.now();
      }

      let promise;
      let isThenable;
      try {
        promise = fn(arr[index]);
        // Accessing a custom thenable's `then` getter can itself throw.
        isThenable = promise != null && typeof promise.then === 'function';
      } catch {
        // Failed attempts still count toward pace, but occupy no active slot.
        results[index] = null;
        continue
      }

      // A non-promise is an API misuse: stop launching work and reject the map.
      // Previously started callbacks still have their failures handled above.
      if (!isThenable) throw new TypeError('Callback must return a promise')
      activeCount++;
      pending.push(collectResult(promise, index));
    }

    // Launching the last callback is not completion; wait for every result.
    await Promise.all(pending);
    return results
  };

  const map = async (arr, fn, opts = {}) => {
    return rateLimit(arr, fn, opts.concurrency, opts.pace)
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

  // Named imports and the default API share the same function instances.
  const slow = {
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
  };

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
