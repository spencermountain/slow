import test from 'tape'
import { createIsolatedApi } from './lib.js'

test('final completion waits only for unfinished tasks in a long batch', async t => {
  // Observe the promises sent to the final join. Completed tasks must not be
  // retained there as the input grows, even when callbacks fail along the way.
  const joinedCounts = []
  class ObservedPromise extends Promise {
    static all(values) {
      const tasks = Array.from(values)
      joinedCounts.push(tasks.length)
      return super.all(tasks)
    }
  }
  const api = await createIsolatedApi({ Promise: ObservedPromise })
  const input = Array.from({ length: 1000 }, (_, i) => i)
  let finishLast
  let reachedLast
  const ready = new Promise(resolve => { reachedLast = resolve })
  let settled = false
  const operation = api.map(input, n => {
    if (n === input.length - 1) {
      return new Promise(resolve => {
        finishLast = resolve
        reachedLast()
      })
    }
    return n % 7 === 0 ? Promise.reject(new Error('item failure')) : Promise.resolve(n)
  }, { concurrency: 3 }).then(result => { settled = true; return result })

  await ready
  await new Promise(resolve => { setImmediate(resolve) })
  t.equal(joinedCounts.length, 1, 'joins the final active tasks')
  t.ok(joinedCounts[0] > 0 && joinedCounts[0] <= 3, 'join stays bounded by concurrency, not input size')
  t.notOk(settled, 'still waits for unfinished work')
  finishLast(input.length - 1)
  t.deepEqual(Array.from(await operation), input.map(n => (
    n !== input.length - 1 && n % 7 === 0 ? null : n
  )), 'retains ordered results and failure placeholders')
})
