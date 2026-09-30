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
slow.onePerSec([1], n => n)

const bothOptions: slow.Options = { concurrency: 2, pace: 5 }
const combined: Promise<(string | null)[]> = slow.map([1, 2] as const, async n => String(n), bothOptions)
void combined
slow.map([1], async n => n)
slow.map([1], async n => n, { pace: 2 })
slow.map([1], async n => n, { concurrency: 2 })
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
slow.quartet([1], n => n)

const direct: Promise<(number | null)[]> = slow.default([1, 2] as const, async n => n, { concurrency: null, pace: 0.5 })
void direct
slow.default([1], n => n)

for (const unlimited of [undefined, null, 0, Infinity]) {
  const result: Promise<(number | null)[]> = slow.default([1], async n => n, {
    concurrency: unlimited, pace: unlimited,
  })
  void result
}
// @ts-expect-error booleans do not disable limits
slow.default([1], async n => n, { pace: false })

const skipped: Promise<(number | null)[]> = slow.default([1, 2], n => n === 1 ? null : Promise.resolve(n))
void skipped
const skippedSerial: Promise<(number | null)[]> = slow.default.serial([1, 2], n => n === 1 ? null : Promise.resolve(n))
void skippedSerial
slow.default([1], () => undefined)

const controller = new AbortController()
const cancellable: Promise<(number | null)[]> = slow.default([1], async (n, { signal }) => {
  const forwarded: AbortSignal | undefined = signal
  void forwarded
  return n
}, { signal: controller.signal })
void cancellable
// @ts-expect-error cancellation requires an AbortSignal
slow.default([1], async n => n, { signal: true })

const syncResult: Promise<(number | null)[]> = slow.default([1, 2], n => n * 2)
const mixedResult: Promise<(number | null)[]> = slow.default([1, 2], n => n === 1 ? n : Promise.resolve(n))
const undefinedResult: Promise<(undefined | null)[]> = slow.default([1], () => undefined)
const objectResult: Promise<({ value: number } | null)[]> = slow.default.serial([1], n => ({ value: n }))
void syncResult
void mixedResult
void undefinedResult
void objectResult
// @ts-expect-error synchronous result is numeric, not string
const wrongSyncResult: Promise<(string | null)[]> = slow.default([1], n => n)
void wrongSyncResult
// @ts-expect-error callback must still be a function
slow.default([1], 42)
