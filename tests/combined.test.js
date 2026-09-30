import test from 'tape'
import { map } from '../src/index.js'
import { rejects } from './helpers.js'

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms) })

test('combined limits enforce occupied slots and spacing after slots reopen', { timeout: 2000 }, async t => {
  const starts = []
  const releases = []
  let active = 0
  let peak = 0
  let ready
  const full = new Promise(resolve => { ready = resolve })
  const operation = map([0, 1, 2, 3], n => {
    starts.push(globalThis.performance.now())
    active++
    peak = Math.max(peak, active)
    if (n < 2) {
      return new Promise(resolve => {
        releases.push(() => { active--; resolve(n * 2) })
        if (n === 1) ready()
      })
    }
    active--
    return Promise.resolve(n * 2)
  }, { concurrency: 2, pace: 50 })
  t.equal(starts.length, 1, 'first start is immediate')
  await full
  await sleep(50)
  t.equal(starts.length, 2, 'full pool prevents starts even after pace allows them')
  releases.reverse().forEach(release => { release() })
  t.deepEqual(await operation, [0, 2, 4, 6], 'preserves order despite reversed completion')
  t.equal(peak, 2)
  for (let i = 1; i < starts.length; i++) {
    t.ok(starts[i] - starts[i - 1] >= 19, 'no catch-up burst when slots reopen')
  }
})

test('concurrency alone fills and reuses slots without a pace delay', async t => {
  const releases = []
  const operation = map([0, 1, 2], n => new Promise(resolve => {
    releases.push(() => { resolve(n) })
  }), { concurrency: 2 })
  t.equal(releases.length, 2)
  releases[1]()
  await new Promise(resolve => { setImmediate(resolve) })
  t.equal(releases.length, 3, 'starts another while the first item remains pending')
  releases[2]()
  releases[0]()
  t.deepEqual(await operation, [0, 1, 2])
})

test('pace alone allows overlap without a concurrency limit', async t => {
  const starts = []
  const releases = []
  let ready
  const full = new Promise(resolve => { ready = resolve })
  const operation = map([0, 1, 2], n => {
    starts.push(globalThis.performance.now())
    return new Promise(resolve => {
      releases.push(() => { resolve(n) })
      if (n === 2) ready()
    })
  }, { pace: 100 })
  await full
  t.equal(releases.length, 3, 'all start before any finish')
  for (let i = 1; i < starts.length; i++) t.ok(starts[i] - starts[i - 1] >= 9)
  releases.forEach(release => { release() })
  t.deepEqual(await operation, [0, 1, 2])
})

test('omitted limits impose no constraints', async t => {
  for (const options of [undefined, {}, { pace: undefined, concurrency: undefined }]) {
    const releases = []
    const operation = map([0, 1, 2], n => new Promise(resolve => {
      releases.push(() => { resolve(n) })
    }), options)
    t.equal(releases.length, 3, 'all callbacks start immediately')
    releases.forEach(release => { release() })
    t.deepEqual(await operation, [0, 1, 2])
  }
})

test('combined limits validate arguments and accept empty arrays', async t => {
  t.deepEqual(await map([], () => { t.fail('must not run') }), [])
  for (const arr of [undefined, null, {}, 'abc']) await rejects(t, map(arr, async n => n), TypeError)
  for (const fn of [undefined, null, {}, 3]) await rejects(t, map([], fn), TypeError)
  for (const name of ['pace', 'concurrency']) {
    for (const value of [null, 0, -1, 1.5, Infinity, NaN, '2', Number.MAX_SAFE_INTEGER + 1]) {
      await rejects(t, map([], async n => n, { [name]: value }), RangeError)
    }
  }
})

test('combined limits handle failures and thenables while pacing every attempt', async t => {
  const starts = []
  const result = await map([0, 1, 2, 3], n => {
    starts.push(globalThis.performance.now())
    if (n === 0) throw new Error('sync')
    if (n === 1) return Promise.reject(new Error('async'))
    if (n === 2) return { get then() { throw new Error('getter') } }
    return { then(resolve) { resolve(n) } }
  }, { concurrency: 1, pace: 100 })
  t.deepEqual(result, [null, null, null, 3])
  for (let i = 1; i < starts.length; i++) t.ok(starts[i] - starts[i - 1] >= 9)
})

test('invalid results stop queued work and pending rejections stay handled', async t => {
  for (const value of [undefined, null, 1, {}, { then: true }]) {
    const seen = []
    let rejectPending
    const operation = map([0, 1, 2], n => {
      seen.push(n)
      if (n === 0) return new Promise((resolve, reject) => { rejectPending = reject })
      return value
    }, { concurrency: 2, pace: 100 })
    await rejects(t, operation, /Callback must return a promise/)
    rejectPending(new Error('late rejection'))
    await sleep(20)
    t.deepEqual(seen, [0, 1])
  }
})
