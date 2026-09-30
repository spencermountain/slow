export interface Options {
  /** Maximum active callbacks. Undefined, null, 0, and Infinity mean unrestricted. */
  concurrency?: number | null
  /** Starts per second; fractions supported. Undefined, null, 0, and Infinity mean unrestricted. */
  pace?: number | null
  /** Stop queued work and reject with the signal's reason when aborted. */
  signal?: AbortSignal
}
export interface CallbackContext {
  signal: AbortSignal | undefined
}
export type Mapper = <T, R>(
  arr: readonly T[],
  fn: (value: T, context: CallbackContext) => R | PromiseLike<R> | null
) => Promise<(Awaited<R> | null)[]>

export declare function map<T, R>(arr: readonly T[], fn: (value: T, context: CallbackContext) => R | PromiseLike<R> | null, options?: Options): Promise<(Awaited<R> | null)[]>
export declare const serial: Mapper
export declare const linear: Mapper
export declare const walk: Mapper
export declare const run: Mapper
export declare const sprint: Mapper
export declare const crawl: Mapper
export declare const maxOne: Mapper
export declare const maxTwo: Mapper
export declare const maxThree: Mapper
export declare const maxFour: Mapper
export declare const maxFive: Mapper
export declare const onePerSec: Mapper
export declare const twoPerSec: Mapper
export declare const threePerSec: Mapper
export declare const fourPerSec: Mapper
export declare const fivePerSec: Mapper
export declare const stroll: Mapper
export declare const jog: Mapper
/** One active callback, at most one start per second. */
export declare const solo: Mapper
/** Two active callbacks, at most one start per second. */
export declare const duet: Mapper
/** Three active callbacks, at most one start per second. */
export declare const trio: Mapper
/** Four active callbacks, at most one start per second. */
export declare const quartet: Mapper
/** Five active callbacks, at most one start per second. */
export declare const quintet: Mapper

declare const slow: typeof map & {
  map: typeof map
  serial: typeof serial
  linear: typeof linear
  maxOne: typeof maxOne
  maxTwo: typeof maxTwo
  maxThree: typeof maxThree
  maxFour: typeof maxFour
  maxFive: typeof maxFive
  onePerSec: typeof onePerSec
  twoPerSec: typeof twoPerSec
  threePerSec: typeof threePerSec
  fourPerSec: typeof fourPerSec
  fivePerSec: typeof fivePerSec
  crawl: typeof crawl
  stroll: typeof stroll
  walk: typeof walk
  jog: typeof jog
  run: typeof run
  sprint: typeof sprint
  solo: typeof solo
  duet: typeof duet
  trio: typeof trio
  quartet: typeof quartet
  quintet: typeof quintet
}
export default slow
