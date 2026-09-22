import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { pipeline } from 'node:stream'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import TapDance from 'tap-dancer'

const require = createRequire(import.meta.url)
const files = process.argv.slice(2)
const runner = spawn(process.execPath, [
  '--unhandled-rejections=strict',
  resolve(dirname(require.resolve('tape/package.json')), require('tape/package.json').bin),
  '--strict',
  ...(files.length > 0 ? files : ['tests/*.test.js']),
], { stdio: ['ignore', 'pipe', 'inherit'] })

const reporter = new TapDance()
reporter.on('complete', result => {
  if (!result.ok) process.exitCode = 1
})
runner.on('error', error => {
  console.error(error)
  process.exitCode = 1
})
runner.on('close', (code, signal) => {
  if (code !== 0 || signal) process.exitCode = code || 1
})
pipeline(runner.stdout, reporter, process.stdout, error => {
  if (error) {
    console.error(error)
    process.exitCode = 1
    runner.kill()
  }
})
