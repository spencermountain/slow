import test from 'tape'
import * as slow from '../src/index.js'
import { rejects } from './helpers.js'

test('pace spaces starts, overlaps work, and preserves input order', async t => {
  const starts = []
  const releases = []
  let allStarted
  const ready = new Promise(resolve => { allStarted = resolve })
  let settled = false
  const operation = slow.mapP([0, 1, 2], n => {
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

for (const [name, pace] of Object.entries({ oneP: 1, twoP: 2, threeP: 3, fourP: 4, fiveP: 5, tenP: 10, mapP: 5 })) {
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

test('pace handles failures and thenables without skipping the schedule', async t => {
  const starts = []
  const result = await slow.mapP([0, 1, 2, 3], n => {
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
    await rejects(t, slow.mapP(arr, async n => n), TypeError)
  }
  for (const fn of [undefined, null, {}, 3]) {
    await rejects(t, slow.mapP([], fn), TypeError)
  }
  for (const pace of [0, -1, 1.5, Infinity, NaN, '2', null, Number.MAX_SAFE_INTEGER + 1]) {
    await rejects(t, slow.mapP([], async n => n, { pace }), RangeError)
  }
})

test('invalid pace returns stop queued work and leave pending rejections handled', async t => {
  for (const value of [undefined, null, 1, {}, { then: true }]) {
    let rejectPending
    const seen = []
    const operation = slow.mapP([0, 1, 2], n => {
      seen.push(n)
      if (n === 0) return new Promise((resolve, reject) => { rejectPending = reject })
      return value
    }, { pace: 100 })
    await rejects(t, operation, /Callback must return a promise/)
    rejectPending(new Error('late rejection'))
    await new Promise(resolve => { setTimeout(resolve, 20) })
    t.deepEqual(seen, [0, 1])
  }
})

test('pace schedules are independent for each call', async t => {
  const started = []
  const operations = [0, 1].map(n => slow.oneP([n], async value => {
    started.push(value)
    return value
  }))
  t.deepEqual(started, [0, 1])
  t.deepEqual(await Promise.all(operations), [[0], [1]])
})
