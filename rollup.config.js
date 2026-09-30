import { readFileSync } from 'node:fs'
import terser from '@rollup/plugin-terser'
import sizeCheck from 'rollup-plugin-filesize-check'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const banner = `/* spencermounta/slow ${version} MIT */`

export default {
  input: 'src/index.js',
  output: [
    { file: 'builds/slow.js', format: 'esm', banner },
    { file: 'builds/slow.cjs', format: 'cjs', exports: 'named', banner },
    {
      file: 'builds/slow.min.js',
      format: 'umd',
      exports: 'named',
      name: 'slow',
      banner,
      plugins: [
        terser(),
        sizeCheck({
          expect: 2,
          warn: 2, // acceptable (+/-)
          throw: 5, // unacceptable (+/-)
        }),
      ],
    },
  ],
}
