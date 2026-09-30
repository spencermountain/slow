/* eslint-disable no-console */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const production = process.env.TESTENV === 'prod'
export const selectedMethods = await import(production ? '../builds/slow.js' : '../src/index.js')
if (production) console.warn('== production build test 🚀 ==')
export default selectedMethods.default

let isolatedCode

// Timer and Promise instrumentation needs a separate global context. In source
// mode, bundle the current source in memory; production uses the shipped UMD.
async function getIsolatedCode() {
  if (production) return readFileSync(new URL('../builds/slow.min.js', import.meta.url), 'utf8')
  const { rollup } = await import('rollup')
  const bundle = await rollup({ input: fileURLToPath(new URL('../src/index.js', import.meta.url)) })
  try {
    const { output } = await bundle.generate({ format: 'umd', name: 'slow', exports: 'named' })
    return output[0].code
  } finally {
    await bundle.close()
  }
}

export async function createIsolatedApi(globals) {
  isolatedCode ??= getIsolatedCode()
  const context = vm.createContext(globals)
  vm.runInContext(await isolatedCode, context)
  return context.slow
}
