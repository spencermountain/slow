import slow = require('slow')
const options: slow.Options = { concurrency: 2 }
const result: Promise<(number | null)[]> = slow.map([1], async n => n, options)
void result
// @ts-expect-error invalid input
slow.maxOne('hello', async n => n)

const paced: Promise<(number | null)[]> = slow.map([1, 2] as const, async n => n, { pace: 2 })
void paced
const shortcut: Promise<(string | null)[]> = slow.twoPerSec([1], async n => String(n))
void shortcut
// @ts-expect-error pace must be numeric
slow.map([1], async n => n, { pace: '2' })
// @ts-expect-error callbacks must return promises
slow.onePerSec([1], n => n)

const bothOptions: slow.Options = { concurrency: 2, pace: 5 }
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

slow.map([1], async n => n, { concurrency: null, pace: 0.5 })

const defaultResult: Promise<(number | null)[]> = slow.default.map([1], async n => n)
void defaultResult

for (const method of [slow.solo, slow.duet, slow.trio, slow.quartet,
  slow.default.solo, slow.default.duet, slow.default.trio, slow.default.quartet]) {
  const result: Promise<(string | null)[]> = method([1, 2] as const, async n => String(n))
  void result
}
// @ts-expect-error removed preset is not part of the stable API
slow.drip([1], async (n: number) => n)
// @ts-expect-error removed preset is not part of the stable API
slow.default.trickle([1], async (n: number) => n)
// @ts-expect-error ensemble callbacks must return promises
slow.quartet([1], n => n)
