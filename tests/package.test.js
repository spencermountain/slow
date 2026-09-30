import test from 'tape'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import defaultSlow, * as slow from 'slow'
import sourceSlow, * as sourceMethods from '../src/index.js'
import { methods } from './api.js'

const require = createRequire(import.meta.url)

test('default export includes every named method with identical references', t => {
  for (const api of [sourceMethods, slow, require('slow')]) {
    const namedMethods = Object.keys(api).filter(name => name !== 'default')
    t.deepEqual(namedMethods.sort(), [...methods].sort(), 'matches the stable public API')
    t.deepEqual(Object.keys(api.default).sort(), namedMethods.sort())
    for (const name of namedMethods) t.equal(api.default[name], api[name], name)
  }
  t.equal(defaultSlow, slow.default)
  t.equal(sourceSlow, sourceMethods.default)
  t.end()
})

for (const [name, api] of [['ESM', slow], ['ESM default', defaultSlow], ['CommonJS', require('slow')]]) {
  test(`${name} package entry exposes the API`, async t => {
    t.deepEqual(await api.map([1, 2], async n => n * 2, { concurrency: null, pace: 100.5 }), [2, 4])
    t.deepEqual(await api.map([1, 2], async n => n * 2, { concurrency: 1 }), [2, 4])
    t.deepEqual(await api.maxOne([1], async () => { throw new Error('failure') }), [null])
    t.deepEqual(await api.map([1, 2], async n => n * 2, { pace: 100 }), [2, 4])
    for (const method of methods) {
      t.deepEqual(await api[method]([1], async n => n), [1])
    }
  })
}

for (const file of ['slow.js', 'slow.min.js']) {
  test(`${file} exposes the browser global`, async t => {
    const context = vm.createContext({ setTimeout, performance: globalThis.performance })
    vm.runInContext(readFileSync(new URL(`../builds/${file}`, import.meta.url), 'utf8'), context)
    t.equal(context.slow.default.map, context.slow.map)
    t.deepEqual(Object.keys(context.slow.default).sort(), [...methods].sort())
    for (const method of methods) {
      t.equal(context.slow.default[method], context.slow[method])
    }
    const result = await context.slow.walk([1, 2], async n => n * 2)
    t.deepEqual(Array.from(result), [2, 4])
    const paced = await context.slow.map([1, 2], async n => n * 2, { pace: 100 })
    t.deepEqual(Array.from(paced), [2, 4])
    const combined = await context.slow.map([1, 2], async n => n * 2, { concurrency: null, pace: 100.5 })
    t.deepEqual(Array.from(combined), [2, 4])
  })
}
