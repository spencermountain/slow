import test from 'tape'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import slow from 'slow'

const require = createRequire(import.meta.url)

for (const [name, api] of [['ESM', slow], ['CommonJS', require('slow')]]) {
  test(`${name} package entry exposes the API`, async t => {
    t.equal(api.serial, api.one)
    t.equal(api.walk, api.five)
    t.deepEqual(await api.map([1, 2], async n => n * 2, { concurrency: 1 }), [2, 4])
    t.deepEqual(await api.one([1], async () => { throw new Error('failure') }), [null])
  })
}

for (const file of ['slow.js', 'slow.min.js']) {
  test(`${file} exposes the browser global`, async t => {
    const context = vm.createContext({})
    vm.runInContext(readFileSync(new URL(`../builds/${file}`, import.meta.url), 'utf8'), context)
    const result = await context.slow.walk([1, 2], async n => n * 2)
    t.deepEqual(Array.from(result), [2, 4])
  })
}
