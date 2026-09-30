import test from 'tape'
import { getEventListeners } from 'node:events'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import slow from '../src/index.js'

const tick = () => new Promise(resolve => { setImmediate(resolve) })
const assertAborted = async (t, operation, signal) => {
  try {
    await operation
    t.fail('expected cancellation')
  } catch (error) {
    t.equal(error, signal.reason, 'rejects with the original abort reason')
  }
  t.equal(getEventListeners(signal, 'abort').length, 0, 'removes abort listeners')
}

test('already aborted signals reject without starting work, even for empty input', async t => {
  const controller = new globalThis.AbortController()
  controller.abort()
  for (const input of [[], [1, 2]]) {
    await assertAborted(t, slow(input, () => { t.fail('must not start') }, {
      signal: controller.signal,
    }), controller.signal)
  }
  t.equal(controller.signal.reason.name, 'AbortError')
})

test('abort interrupts a full concurrency pool and handles late rejections', { timeout: 1000 }, async t => {
  const controller = new globalThis.AbortController()
  const seen = []
  let rejectPending
  const operation = slow([1, 2, 3], (n, { signal }) => {
    t.equal(signal, controller.signal, 'passes the caller signal to the callback')
    seen.push(n)
    return new Promise((resolve, reject) => { rejectPending = reject })
  }, { concurrency: 1, signal: controller.signal })
  controller.abort(new Error('user cancelled'))
  await assertAborted(t, operation, controller.signal)
  rejectPending(new Error('late failure'))
  await tick()
  t.deepEqual(seen, [1], 'queued callbacks never start')
})

test('abort interrupts the final result wait without waiting for callbacks', { timeout: 1000 }, async t => {
  const controller = new globalThis.AbortController()
  const releases = []
  const operation = slow([1, 2], n => new Promise(resolve => {
    releases.push(() => { resolve(n) })
  }), { signal: controller.signal })
  t.equal(releases.length, 2)
  controller.abort('stop')
  await assertAborted(t, operation, controller.signal)
  releases.forEach(release => { release() })
  await tick()
})

test('abort clears the pacing timer and never starts the next callback', async t => {
  // Fake only the pacing timer, so a leaked timer is observable without making
  // the test process wait for a long real timeout.
  const timers = new Set()
  const context = vm.createContext({
    performance: globalThis.performance,
    setTimeout(callback) { timers.add(callback); return callback },
    clearTimeout(timer) { timers.delete(timer) },
  })
  vm.runInContext(readFileSync(new URL('../builds/slow.js', import.meta.url), 'utf8'), context)
  const controller = new globalThis.AbortController()
  const seen = []
  const operation = context.slow.map([1, 2], async n => {
    seen.push(n)
    return n
  }, { pace: 0.01, signal: controller.signal })
  t.equal(timers.size, 1, 'pacing timer is waiting')
  controller.abort()
  await assertAborted(t, operation, controller.signal)
  t.equal(timers.size, 0, 'no timer remains after cancellation')
  t.deepEqual(seen, [1])
})

test('abort inside a callback stops scheduling and handles its returned promise', async t => {
  for (const outcome of ['reject', 'null', 'throw']) {
    const controller = new globalThis.AbortController()
    const seen = []
    const operation = slow([1, 2], n => {
      seen.push(n)
      controller.abort()
      if (outcome === 'throw') throw new Error('callback failed')
      return outcome === 'null' ? null : Promise.reject(new Error('callback failed'))
    }, { signal: controller.signal })
    await assertAborted(t, operation, controller.signal)
    t.deepEqual(seen, [1])
  }
})

test('callbacks can cooperate with cancellation using their signal', async t => {
  const controller = new globalThis.AbortController()
  let stopped = false
  const operation = slow([1], (n, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => {
      stopped = true
      reject(signal.reason)
    }, { once: true })
  }), { signal: controller.signal })
  controller.abort()
  await assertAborted(t, operation, controller.signal)
  t.ok(stopped, 'underlying work receives cancellation too')
})

test('normal completion and errors remove listeners; no signal still works', async t => {
  const controller = new globalThis.AbortController()
  const result = await slow([1, 2, 3], async n => {
    if (n === 2) throw new Error('ordinary failure')
    return n
  }, { pace: 100, concurrency: 1, signal: controller.signal })
  t.deepEqual(result, [1, null, 3], 'ordinary failures still become null')
  t.equal(getEventListeners(controller.signal, 'abort').length, 0)
  controller.abort()
  t.deepEqual(result, [1, null, 3], 'aborting after completion has no effect')
  t.deepEqual(await slow([1], async (n, { signal }) => {
    t.equal(signal, undefined)
    return n
  }), [1])
})
