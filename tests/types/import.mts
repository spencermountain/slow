import slow, { map, stroll, jog, solo, duet, trio, quartet, quintet } from 'slow'
import { type Options } from 'slow'
const options: Options = { concurrency: 2 }
const result: Promise<(string | null)[]> = slow.map([1, 2] as const, async n => String(n), options)
void result
slow.walk([1], n => n)
// @ts-expect-error result includes null
const invalid: Promise<string[]> = slow.walk([1], async n => String(n))
void invalid

const paced: Promise<(number | null)[]> = slow.map([1, 2] as const, async n => n, { pace: 2 })
void paced
const shortcut: Promise<(string | null)[]> = slow.twoPerSec([1], async n => String(n))
void shortcut
// @ts-expect-error pace must be numeric
slow.map([1], async n => n, { pace: '2' })
slow.onePerSec([1], n => n)

const bothOptions: Options = { concurrency: 2, pace: 5 }
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

const named: Promise<(number | null)[]> = map([1], async n => n)
void named
for (const method of [stroll, jog, solo, duet, trio, quartet, quintet, slow.stroll, slow.jog, slow.solo, slow.duet, slow.trio, slow.quartet, slow.quintet]) {
  const result: Promise<(number | null)[]> = method([1], async n => n)
  void result
}

// @ts-expect-error removed preset is not part of the stable API
slow.drip([1], async (n: number) => n)
// @ts-expect-error removed preset is not part of the stable API
slow.trickle([1], async (n: number) => n)
solo([1], n => n)
const ensemble: Promise<(string | null)[]> = quartet([1, 2] as const, async n => String(n))
void ensemble

const direct: Promise<(string | null)[]> = slow([1, 2] as const, async n => String(n), { concurrency: null, pace: 0.5 })
void direct
slow([1], n => n)
// @ts-expect-error default options must have numeric pace
slow([1], async n => n, { pace: '2' })

for (const unlimited of [undefined, null, 0, Infinity]) {
  const result: Promise<(number | null)[]> = slow([1], async n => n, {
    concurrency: unlimited, pace: unlimited,
  })
  void result
}
// @ts-expect-error booleans do not disable limits
slow([1], async n => n, { pace: false })

const skipped: Promise<(number | null)[]> = slow([1, 2], n => n === 1 ? null : Promise.resolve(n))
void skipped
const skippedSerial: Promise<(number | null)[]> = slow.serial([1, 2], n => n === 1 ? null : Promise.resolve(n))
void skippedSerial
slow([1], () => undefined)

const controller = new AbortController()
const cancellable: Promise<(number | null)[]> = slow([1], async (n, { signal }) => {
  const forwarded: AbortSignal | undefined = signal
  void forwarded
  return n
}, { signal: controller.signal })
void cancellable
// @ts-expect-error cancellation requires an AbortSignal
slow([1], async n => n, { signal: true })

const syncResult: Promise<(number | null)[]> = slow([1, 2], n => n * 2)
const mixedResult: Promise<(number | null)[]> = slow([1, 2], n => n === 1 ? n : Promise.resolve(n))
const undefinedResult: Promise<(undefined | null)[]> = slow([1], () => undefined)
const objectResult: Promise<({ value: number } | null)[]> = slow.serial([1], n => ({ value: n }))
void syncResult
void mixedResult
void undefinedResult
void objectResult
// @ts-expect-error synchronous result is numeric, not string
const wrongSyncResult: Promise<(string | null)[]> = slow([1], n => n)
void wrongSyncResult
// @ts-expect-error callback must still be a function
slow([1], 42)
