/* slow 2.0.0 MIT */
// limits the number of concurrent executions
const activityLimit = async function (arr, fn, limit = 5) {
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
};

// Limits callback starts per second, spaced evenly without waiting for completion.
const paceLimit = async function (arr, fn, pace = 5) {
  if (!Array.isArray(arr)) throw new TypeError('Expected an array')
  if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
  if (!Number.isSafeInteger(pace) || pace < 1) {
    throw new RangeError('Pace must be a positive safe integer')
  }

  const length = arr.length;
  const results = new Array(length);
  const pending = [];
  const interval = 1000 / pace;
  let lastStart;

  for (let i = 0; i < length; i++) {
    if (i > 0) {
      let remaining = interval - (globalThis.performance.now() - lastStart);
      while (remaining > 0) {
        await new Promise(resolve => { setTimeout(resolve, Math.ceil(remaining)); });
        remaining = interval - (globalThis.performance.now() - lastStart);
      }
    }
    lastStart = globalThis.performance.now();
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
    if (!isThenable) throw new TypeError('Callback must return a promise')
    // Handle each rejection immediately, even while later starts are waiting.
    pending.push(Promise.resolve(promise).then(
      value => { results[i] = value; },
      () => { results[i] = null; }
    ));
  }

  await Promise.all(pending);
  return results
};

// Use a monotonic clock so wall-clock adjustments cannot change the pace.
// Timers can wake early; recheck after each wait before allowing another start.
const waitUntil = async deadline => {
  const remaining = deadline - globalThis.performance.now();
  if (remaining <= 0) return
  await new Promise(resolve => { setTimeout(resolve, Math.ceil(remaining)); });
  return waitUntil(deadline)
};

/**
 * Map with independent limits on active callbacks and starts per second.
 * Omitted limits are unrestricted. The first callback starts immediately.
 * Results retain input order; callback failures become null.
 */
const combinedLimit = async function (arr, fn, { concurrency, pace } = {}) {
  // Validate before processing, including when the input array is empty.
  if (!Array.isArray(arr)) throw new TypeError('Expected an array')
  if (typeof fn !== 'function') throw new TypeError('Expected a callback function')
  if (concurrency !== undefined && (!Number.isSafeInteger(concurrency) || concurrency < 1)) {
    throw new RangeError('Concurrency must be a positive safe integer')
  }
  if (pace !== undefined && (!Number.isSafeInteger(pace) || pace < 1)) {
    throw new RangeError('Pace must be a positive safe integer')
  }

  const length = arr.length; // Keep the original input length throughout the call.
  const results = new Array(length);
  const pending = [];
  const concurrencyLimit = concurrency ?? Infinity;
  const intervalMs = pace === undefined ? 0 : 1000 / pace;
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
    if (intervalMs > 0) lastStartedAt = globalThis.performance.now();

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

const map = async (arr, fn, options = {}) => combinedLimit(arr, fn, options);

const mapX = async (arr, fn, { concurrency = 5 } = {}) => {
  return activityLimit(arr, fn, concurrency)
};

// concurrency limits
const oneX = async (arr, fn) => activityLimit(arr, fn, 1);
const twoX = async (arr, fn) => activityLimit(arr, fn, 2);
const threeX = async (arr, fn) => activityLimit(arr, fn, 3);
const fourX = async (arr, fn) => activityLimit(arr, fn, 4);
const fiveX = async (arr, fn) => activityLimit(arr, fn, 5);
const tenX = async (arr, fn) => activityLimit(arr, fn, 10);
const serial = oneX;
const linear = oneX;

const crawl = twoX;

// evenly spaced starts per second
const mapP = async (arr, fn, { pace = 5 } = {}) => {
  return paceLimit(arr, fn, pace)
};
const oneP = async (arr, fn) => paceLimit(arr, fn, 1);
const twoP = async (arr, fn) => paceLimit(arr, fn, 2);
const threeP = async (arr, fn) => paceLimit(arr, fn, 3);
const fourP = async (arr, fn) => paceLimit(arr, fn, 4);
const fiveP = async (arr, fn) => paceLimit(arr, fn, 5);
const tenP = async (arr, fn) => paceLimit(arr, fn, 10);

const walk = twoP;
const run = threeP;
const sprint = fiveP;

export { crawl, fiveP, fiveX, fourP, fourX, linear, map, mapP, mapX, oneP, oneX, run, serial, sprint, tenP, tenX, threeP, threeX, twoP, twoX, walk };
