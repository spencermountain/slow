import test from 'tape'
import slow from '../src/index.js'

const tick = () => new Promise(resolve => { setImmediate(resolve) })
const limits = { one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10, fifteen: 15,
  serial: 1, linear: 1, crawl: 3, walk: 5, run: 10, sprint: 15 }

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
    while (releases.size) {
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
  for (const [options, expected] of [[{ concurrency: 7 }, 7], [undefined, 5]]) {
    const releases = []
    const operation = slow.map(Array.from({ length: 8 }, (_, i) => i), n => new Promise(resolve => {
      releases.push(() => { resolve(n) })
    }), options)
    t.equal(releases.length, expected)
    while (releases.length) {
      releases.shift()()
      await tick()
    }
    t.deepEqual(await operation, [0, 1, 2, 3, 4, 5, 6, 7])
  }
})

test('promise-like results are supported', async t => {
  t.deepEqual(await slow.one([1], n => ({ then(resolve) { resolve(n) } })), [1])
})
