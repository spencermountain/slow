import test from 'tape'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import * as slow from 'slow'

const require = createRequire(import.meta.url)

for (const [name, api] of [['ESM', slow], ['CommonJS', require('slow')]]) {
  test(`${name} package entry exposes the API`, async t => {
    t.equal(api.serial, api.oneX)
    t.equal(api.walk, api.twoP)
    t.equal(api.run, api.threeP)
    t.equal(api.sprint, api.fiveP)
    t.deepEqual(await api.map([1, 2], async n => n * 2, { concurrency: 1, pace: 100 }), [2, 4])
    t.deepEqual(await api.mapX([1, 2], async n => n * 2, { concurrency: 1 }), [2, 4])
    t.deepEqual(await api.oneX([1], async () => { throw new Error('failure') }), [null])
    t.deepEqual(await api.mapP([1, 2], async n => n * 2, { pace: 100 }), [2, 4])
    for (const method of ['oneP', 'twoP', 'threeP', 'fourP', 'fiveP', 'tenP']) {
      t.deepEqual(await api[method]([1], async n => n), [1])
    }
  })
}

for (const file of ['slow.js', 'slow.min.js']) {
  test(`${file} exposes the browser global`, async t => {
    const context = vm.createContext({ setTimeout, performance: globalThis.performance })
    vm.runInContext(readFileSync(new URL(`../builds/${file}`, import.meta.url), 'utf8'), context)
    const result = await context.slow.walk([1, 2], async n => n * 2)
    t.deepEqual(Array.from(result), [2, 4])
    const paced = await context.slow.mapP([1, 2], async n => n * 2, { pace: 100 })
    t.deepEqual(Array.from(paced), [2, 4])
    const combined = await context.slow.map([1, 2], async n => n * 2, { concurrency: 1, pace: 100 })
    t.deepEqual(Array.from(combined), [2, 4])
  })
}
