import test from 'tape'
import * as slow from '../src/index.js'

const tick = () => new Promise(resolve => { setImmediate(resolve) })
const limits = { maxOne: 1, maxTwo: 2, maxThree: 3, maxFour: 4, maxFive: 5,
  serial: 1, linear: 1 }

for (const [name, limit] of Object.entries(limits)) {
  test(`${name}: bounds concurrency, fills free slots, preserves order`, async t => {
    const input = Array.from({ length: limit + 3 }, (_, i) => i)
    const releases = new Map()
    const started = []
    let active = 0
    let peak = 0
    let completed = 0
    const operation = slow[name](input, n => {
      started.push(n)
      active++
      peak = Math.max(peak, active)
      return new Promise(resolve => {
        releases.set(n, () => { active--; resolve(n * 2) })
      })
    })
    t.equal(active, limit)
    // Finish the newest operation first so completion differs from input order.
    while (releases.size > 0) {
      const n = Math.max(...releases.keys())
      releases.get(n)()
      releases.delete(n)
      completed++
      await tick()
      t.ok(active <= limit)
      t.equal(active, Math.min(limit, input.length - completed))
    }
    t.deepEqual(await operation, input.map(n => n * 2))
    t.equal(peak, limit)
    t.deepEqual(started, input)
  })
}

test('empty and small inputs', async t => {
  t.deepEqual(await slow.walk([], () => { t.fail('must not run') }), [])
  t.deepEqual(await slow.sprint([2, 1], async n => n), [2, 1])
})

test('custom concurrency and default', async t => {
  for (const [options, expected] of [[{ concurrency: 7 }, 7], [undefined, 8]]) {
    const releases = []
    const operation = slow.map(Array.from({ length: 8 }, (_, i) => i), n => new Promise(resolve => {
      releases.push(() => { resolve(n) })
    }), options)
    t.equal(releases.length, expected)
    while (releases.length > 0) {
      releases.shift()()
      await tick()
    }
    t.deepEqual(await operation, [0, 1, 2, 3, 4, 5, 6, 7])
  }
})

test('promise-like results are supported', async t => {
  t.deepEqual(await slow.maxOne([1], n => ({ then(resolve) { resolve(n) } })), [1])
})
