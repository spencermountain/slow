import slow, { map, stroll, jog, solo, duet, trio, quartet } from 'slow'
import { type Options } from 'slow'
const options: Options = { concurrency: 2 }
const result: Promise<(string | null)[]> = slow.map([1, 2] as const, async n => String(n), options)
void result
// @ts-expect-error callbacks must return promises
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
// @ts-expect-error callbacks must return promises
slow.onePerSec([1], n => n)

const bothOptions: Options = { concurrency: 2, pace: 5 }
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

const named: Promise<(number | null)[]> = map([1], async n => n)
void named
for (const method of [stroll, jog, solo, duet, trio, quartet, slow.stroll, slow.jog, slow.solo, slow.duet, slow.trio, slow.quartet]) {
  const result: Promise<(number | null)[]> = method([1], async n => n)
  void result
}

// @ts-expect-error removed preset is not part of the stable API
slow.drip([1], async (n: number) => n)
// @ts-expect-error removed preset is not part of the stable API
slow.trickle([1], async (n: number) => n)
// @ts-expect-error ensemble callbacks must return promises
solo([1], n => n)
const ensemble: Promise<(string | null)[]> = quartet([1, 2] as const, async n => String(n))
void ensemble
