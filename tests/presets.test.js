import test from 'tape'
import { createIsolatedApi } from './lib.js'
import { combinedPresets } from './api.js'

const flush = () => new Promise(resolve => { setImmediate(resolve) })

// Isolate a clock per test without replacing the host's timers. Advancing time
// deliberately late also tests that the limiter does not make up missed starts.
async function createClock() {
  let now = 0
  let timers = []
  const api = await createIsolatedApi({
    performance: { now: () => now },
    setTimeout(callback, delay) {
      const timer = { callback, deadline: now + delay }
      timers.push(timer)
      return timer
    },
    clearTimeout(timer) { timers = timers.filter(item => item !== timer) },
  })
  return {
    api,
    now: () => now,
    async advance(ms) {
      now += ms
      const due = timers.filter(timer => timer.deadline <= now)
      timers = timers.filter(timer => timer.deadline > now)
      due.forEach(timer => { timer.callback() })
      await flush()
    },
  }
}

for (const [name, { concurrency, pace }] of Object.entries(combinedPresets)) {
  test(`${name}: enforces its pace and lane count together`, { timeout: 2000 }, async t => {
    const clock = await createClock()
    const interval = Math.ceil(1000 / pace)
    const input = Array.from({ length: concurrency + 2 }, (_, i) => i)
    const starts = []
    const releases = []
    let active = 0
    let peak = 0
    const operation = clock.api[name](input, n => {
      starts.push(clock.now())
      active++
      peak = Math.max(peak, active)
      if (n < concurrency) {
        return new Promise(resolve => {
          releases.push(() => { active--; resolve(n) })
        })
      }
      active--
      return Promise.resolve(n)
    })

    t.equal(starts.length, 1, 'first callback starts immediately')
    for (let i = 1; i < concurrency; i++) {
      await clock.advance(interval - 1)
      t.equal(starts.length, i, 'does not start before the pacing deadline')
      await clock.advance(1)
      t.equal(starts.length, i + 1, 'fills the next lane when pace allows')
    }
    await clock.advance(interval * 3)
    t.equal(starts.length, concurrency, 'full lanes block further starts')

    // Free every lane in reverse order after a long pause. One new callback can
    // start immediately, but the next must still wait a full pacing interval.
    releases.reverse().forEach(release => { release() })
    await flush()
    t.equal(starts.length, concurrency + 1, 'no burst when multiple lanes reopen')
    await clock.advance(interval - 1)
    t.equal(starts.length, concurrency + 1)
    await clock.advance(1)
    t.deepEqual(Array.from(await operation), input, 'results retain input order')
    t.equal(peak, concurrency, 'uses exactly the allowed number of lanes')
    for (let i = 1; i < starts.length; i++) {
      t.ok(starts[i] - starts[i - 1] >= 1000 / pace, 'every start respects pace')
    }
  })
}
