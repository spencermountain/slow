import test from 'tape'
import slow from '../src/index.js'
import { rejects } from './helpers.js'

test('throwing then getters become null and remaining items finish', { timeout: 1000 }, async t => {
  for (const method of [slow.one, slow.two]) {
    for (const failedIndex of [0, 2]) {
      const started = []
      const result = await method([0, 1, 2, 3], n => {
        started.push(n)
        if (n === failedIndex) {
          return { get then() { throw new Error('then getter failed') } }
        }
        return Promise.resolve(n)
      })
      t.deepEqual(result, [0, 1, 2, 3].map(n => n === failedIndex ? null : n))
      t.deepEqual(started, [0, 1, 2, 3], 'processes every item exactly once')
    }
  }
})

test('rejections and synchronous throws become null, including later items', async t => {
  for (const method of [slow.one, slow.walk]) {
    const result = await method([0, 1, 2, 3, 4], n => {
      if (n === 0 || n === 2) throw new Error('sync failure')
      if (n === 1) return Promise.reject(new Error('async failure'))
      return Promise.resolve(n)
    })
    t.deepEqual(result, [null, null, null, 3, 4])
  }
})

test('invalid inputs reject with Error objects', async t => {
  for (const input of [undefined, null, {}, 'abc', 3]) {
    await rejects(t, slow.walk(input, async n => n), TypeError)
  }
  for (const fn of [undefined, null, {}, 3]) {
    await rejects(t, slow.walk([], fn), TypeError)
  }
  for (const concurrency of [0, -1, 1.5, Infinity, NaN, '2', null]) {
    await rejects(t, slow.map([], async n => n, { concurrency }), RangeError)
  }
})

test('non-promise results reject at any position and stop queued work', async t => {
  for (const value of [undefined, null, 1, {}, { then: true }]) {
    const seen = []
    await rejects(t, slow.one([0, 1, 2], n => {
      seen.push(n)
      return n === 1 ? value : Promise.resolve(n)
    }), /Callback must return a promise/)
    t.deepEqual(seen, [0, 1])
  }
})

test('already running callbacks remain handled after invalid return', async t => {
  let rejectPending
  const operation = slow.two([0, 1, 2], n => {
    if (n === 0) return new Promise((resolve, reject) => { rejectPending = reject })
    if (n === 1) return null
    t.fail('queued item must not start')
  })
  await rejects(t, operation, TypeError)
  rejectPending(new Error('late rejection'))
  await new Promise(resolve => { setImmediate(resolve) })
})
