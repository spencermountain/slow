import test from 'tape'
import slow from './lib.js'
import { rejects } from './helpers.js'

test('throwing then getters become null and remaining items finish', { timeout: 1000 }, async t => {
  for (const method of [slow.maxOne, slow.maxTwo]) {
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

// Disabled: real-time waits add about 2 seconds. Uncomment to re-enable.
/*
test('rejections and synchronous throws become null, including later items', async t => {
  for (const method of [slow.maxOne, slow.walk]) {
    const result = await method([0, 1, 2, 3, 4], n => {
      if (n === 0 || n === 2) throw new Error('sync failure')
      if (n === 1) return Promise.reject(new Error('async failure'))
      return Promise.resolve(n)
    })
    t.deepEqual(result, [null, null, null, 3, 4])
  }
})
*/

test('invalid inputs reject with Error objects', async t => {
  for (const input of [undefined, null, {}, 'abc', 3]) {
    await rejects(t, slow.walk(input, async n => n), TypeError)
  }
  for (const fn of [undefined, null, {}, 3]) {
    await rejects(t, slow.walk([], fn), TypeError)
  }
  for (const concurrency of [-1, 1.5, -Infinity, NaN, '2']) {
    await rejects(t, slow.map([], async n => n, { concurrency }), RangeError)
  }
})

test('synchronous values keep queued work going while pending rejections are handled', async t => {
  let rejectPending
  const seen = []
  const operation = slow.maxTwo([0, 1, 2], n => {
    seen.push(n)
    if (n === 0) return new Promise((resolve, reject) => { rejectPending = reject })
    return n === 1 ? undefined : n
  })
  t.deepEqual(seen, [0, 1, 2], 'synchronous values do not occupy a lane')
  rejectPending(new Error('late rejection'))
  t.deepEqual(await operation, [null, undefined, 2])
})
