import slow, { type Options } from 'slow'
const options: Options = { concurrency: 2 }
const result: Promise<(string | null)[]> = slow.map([1, 2] as const, async n => String(n), options)
void result
// @ts-expect-error callbacks must return promises
slow.walk([1], n => n)
// @ts-expect-error result includes null
const invalid: Promise<string[]> = slow.walk([1], async n => String(n))
void invalid
