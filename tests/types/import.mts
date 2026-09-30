import * as slow from 'slow'
import { type Options } from 'slow'
const options: Options = { concurrency: 2 }
const result: Promise<(string | null)[]> = slow.mapX([1, 2] as const, async n => String(n), options)
void result
// @ts-expect-error callbacks must return promises
slow.walk([1], n => n)
// @ts-expect-error result includes null
const invalid: Promise<string[]> = slow.walk([1], async n => String(n))
void invalid

const paced: Promise<(number | null)[]> = slow.mapP([1, 2] as const, async n => n, { pace: 2 })
void paced
const shortcut: Promise<(string | null)[]> = slow.twoP([1], async n => String(n))
void shortcut
// @ts-expect-error pace must be numeric
slow.mapP([1], async n => n, { pace: '2' })
// @ts-expect-error callbacks must return promises
slow.oneP([1], n => n)

const bothOptions: slow.CombinedOptions = { concurrency: 2, pace: 5 }
const combined: Promise<(string | null)[]> = slow.map([1, 2] as const, async n => String(n), bothOptions)
void combined
slow.map([1], async n => n)
slow.map([1], async n => n, { pace: 2 })
slow.map([1], async n => n, { concurrency: 2 })
// @ts-expect-error callbacks must return promises
slow.map([1], n => n)
// @ts-expect-error concurrency must be numeric
slow.map([1], async n => n, { concurrency: '2' })
// @ts-expect-error pace must be numeric
slow.map([1], async n => n, { pace: '2' })
