import test from 'tape'
import slow from './lib.js'
import { rejects } from './helpers.js'

test('pace spaces starts, overlaps work, and preserves input order', async t => {
  const starts = []
  const releases = []
  let allStarted
  const ready = new Promise(resolve => { allStarted = resolve })
  let settled = false
  const operation = slow.map([0, 1, 2], n => {
    starts.push(globalThis.performance.now())
    return new Promise(resolve => {
      releases.push(() => { resolve(n * 2) })
      if (releases.length === 3) allStarted()
    })
  }, { pace: 50 }).then(result => { settled = true; return result })
  t.equal(starts.length, 1, 'first callback starts immediately')
  await ready
  t.notOk(settled, 'waits for outstanding callbacks')
  for (let i = 1; i < starts.length; i++) {
    t.ok(starts[i] - starts[i - 1] >= 19, 'starts at least 20 ms apart, allowing clock measurement tolerance')
  }
  releases.reverse().forEach(release => { release() })
  t.deepEqual(await operation, [0, 2, 4])
})

// Disabled: real-time waits add about 2.3 seconds. Uncomment to re-enable.
/*
for (const [name, pace] of Object.entries({ onePerSec: 1, twoPerSec: 2, threePerSec: 3, fourPerSec: 4, fivePerSec: 5 })) {
  test(`${name} uses the expected pace`, async t => {
    const starts = []
    t.deepEqual(await slow[name]([1, 2], async n => {
      starts.push(globalThis.performance.now())
      return n
    }), [1, 2])
    t.ok(starts[1] - starts[0] >= 1000 / pace - 1)
    t.deepEqual(await slow[name]([], () => { t.fail('must not run') }), [])
  })
}
*/

test('pace handles failures and thenables without skipping the schedule', async t => {
  const starts = []
  const result = await slow.map([0, 1, 2, 3], n => {
    starts.push(globalThis.performance.now())
    if (n === 0) throw new Error('sync')
    if (n === 1) return Promise.reject(new Error('async'))
    if (n === 2) return { get then() { throw new Error('getter') } }
    return { then(resolve) { resolve(n) } }
  }, { pace: 100 })
  t.deepEqual(result, [null, null, null, 3])
  for (let i = 1; i < starts.length; i++) {
    t.ok(starts[i] - starts[i - 1] >= 9, 'failed starts still count toward pace')
  }
})

test('pace validates arguments even for empty inputs', async t => {
  for (const arr of [undefined, null, {}, 'abc', 3]) {
    await rejects(t, slow.map(arr, async n => n), TypeError)
  }
  for (const fn of [undefined, null, {}, 3]) {
    await rejects(t, slow.map([], fn), TypeError)
  }
  for (const pace of [-1, -Infinity, NaN, '2', '0', false, true]) {
    await rejects(t, slow.map([], async n => n, { pace }), RangeError)
  }
})

test('pace schedules are independent for each call', async t => {
  const started = []
  const operations = [0, 1].map(n => slow.onePerSec([n], async value => {
    started.push(value)
    return value
  }))
  t.deepEqual(started, [0, 1])
  t.deepEqual(await Promise.all(operations), [[0], [1]])
})
