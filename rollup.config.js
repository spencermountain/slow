import { readFileSync } from 'node:fs'
import terser from '@rollup/plugin-terser'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const banner = `/* slow ${version} MIT */`

export default {
  input: 'src/index.js',
  output: [
    { file: 'builds/slow.mjs', format: 'esm', banner },
    { file: 'builds/slow.cjs', format: 'cjs', exports: 'default', banner },
    { file: 'builds/slow.js', format: 'umd', name: 'slow', banner, sourcemap: true },
    { file: 'builds/slow.min.js', format: 'umd', name: 'slow', banner, plugins: [terser()] },
  ],
}
