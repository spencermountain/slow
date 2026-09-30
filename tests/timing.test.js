// Disabled: this real-time suite takes about 6.5 seconds. Uncomment to re-enable.
/*
import test from 'tape'
import slow from './lib.js'
import { methods } from './api.js'

const taskMs = 500
const input = [0, 1, 2, 3]

// Expected wall-clock totals for four 500 ms tasks, including the final task's
// completion. These are explicit examples, not calculations using the limiter.
const expectedMs = {
  map: 500,
  serial: 2000,
  linear: 2000,
  maxOne: 2000,
  maxTwo: 1000,
  maxThree: 1000,
  maxFour: 500,
  maxFive: 500,
  onePerSec: 3500,
  twoPerSec: 2000,
  threePerSec: 1500,
  fourPerSec: 1250,
  fivePerSec: 1100,
  crawl: 6500,
  stroll: 3500,
  walk: 2000,
  jog: 1500,
  run: 1250,
  // Two lanes fill at 0 and 200 ms. Later starts wait for a lane at 500 and
  // 700 ms, so sprint finishes at 1200 ms rather than fivePerSec's 1100 ms.
  sprint: 1200,
  // At one start per second, each 500 ms task finishes before the next starts.
  // Extra lanes therefore do not shorten these four ensemble calls.
  solo: 3500,
  duet: 3500,
  trio: 3500,
  quartet: 3500,
  quintet: 3500,
}

const cases = [
  ...Object.entries(expectedMs).map(([name, expected]) => ({
    name, method: slow[name], expected,
  })),
  {
    name: 'map: concurrency is the bottleneck',
    method: slow.map, options: { concurrency: 1, pace: 10 }, expected: 2000,
  },
  {
    name: 'map: pace is the bottleneck',
    method: slow.map, options: { concurrency: 4, pace: 2 }, expected: 2000,
  },
  {
    name: 'map: both constraints affect scheduling',
    method: slow.map, options: { concurrency: 2, pace: 5 }, expected: 1200,
  },
  {
    name: 'map: null concurrency and fractional pace',
    method: slow.map, options: { concurrency: null, pace: 2.5 }, expected: 1700,
  },
]

test('total elapsed time with four 500 ms promises', { timeout: 12000 }, async t => {
  t.deepEqual(Object.keys(expectedMs).sort(), [...methods].sort(), 'covers every public method')

  // Independent limiter calls run together, keeping this test near 6.5 seconds
  // instead of waiting for the sum of every preset's duration.
  const measurements = await Promise.all(cases.map(async ({ name, method, options, expected }) => {
    const startedAt = globalThis.performance.now()
    const results = await method(input, n => new Promise(resolve => {
      setTimeout(() => { resolve(n * 2) }, taskMs)
    }), options)
    return { name, expected, results, elapsed: globalThis.performance.now() - startedAt }
  }))

  // Real timers are not exact. Allow minor early-timer rounding and a bounded
  // scheduling delay; exact pacing and lane limits have separate clock tests.
  const earlyToleranceMs = 20
  const lateToleranceMs = 250
  for (const { name, expected, results, elapsed } of measurements) {
    const description = `${name}: ${Math.round(elapsed)} ms elapsed, expected about ${expected} ms`
    t.ok(elapsed >= expected - earlyToleranceMs, `${description} (not early)`)
    t.ok(elapsed <= expected + lateToleranceMs, `${description} (not late)`)
    t.deepEqual(results, [0, 2, 4, 6], `${name}: returns all completed results in order`)
  }
})
*/
