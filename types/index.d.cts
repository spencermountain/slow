export interface Options {
  /** Maximum active callbacks. Omitted or null means unrestricted. */
  concurrency?: number | null
  /** Positive finite starts per second; fractions are supported. */
  pace?: number
}
export type Mapper = <T, R>(
  arr: readonly T[],
  fn: (value: T) => PromiseLike<R>
) => Promise<(Awaited<R> | null)[]>

export declare function map<T, R>(arr: readonly T[], fn: (value: T) => PromiseLike<R>, options?: Options): Promise<(Awaited<R> | null)[]>
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

declare const slow: {
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
}
export default slow
