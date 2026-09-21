import slow = require('slow')
const options: slow.Options = { concurrency: 2 }
const result: Promise<(number | null)[]> = slow.map([1], async n => n, options)
void result
// @ts-expect-error invalid input
slow.one('hello', async n => n)
