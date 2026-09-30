import test from 'tape'
import slow from './lib.js'

test('synchronous callbacks preserve every kind of plain value', async t => {
  const object = { then: true }
  const callable = () => 'returned function'
  const values = [0, false, '', undefined, null, NaN, 1n, Symbol('value'), object, callable]
  const result = await slow(values, value => value, { concurrency: 1 })
  t.deepEqual(result, values)
  t.equal(result[8], object, 'keeps object identity')
  t.equal(result[9], callable, 'stores returned functions without calling them')
})

test('mixed sync values, promises, thenables, and failures preserve input order', async t => {
  const seen = []
  const result = await slow([0, 1, 2, 3, 4, 5], n => {
    seen.push(n)
    if (n === 0) return new Promise(resolve => { setTimeout(() => { resolve(n) }, 20) })
    if (n === 1) return n
    if (n === 2) throw new Error('sync failure')
    if (n === 3) return Promise.reject(new Error('async failure'))
    if (n === 4) return { then(resolve) { resolve(n) } }
    return undefined
  }, { concurrency: 2 })
  t.deepEqual(result, [0, 1, null, null, 4, undefined])
  t.deepEqual(seen, [0, 1, 2, 3, 4, 5])
})

test('pace applies to synchronous values and throws alike', async t => {
  const starts = []
  const result = await slow([0, 1, 2, 3], n => {
    starts.push(globalThis.performance.now())
    if (n === 1) throw new Error('failed')
    return n
  }, { concurrency: 2, pace: 100 })
  t.deepEqual(result, [0, null, 2, 3])
  for (let i = 1; i < starts.length; i++) {
    t.ok(starts[i] - starts[i - 1] >= 9, 'each callback start counts toward pace')
  }
})
