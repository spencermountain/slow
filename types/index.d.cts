export interface Options {
  concurrency?: number
}
export interface PaceOptions {
  pace?: number
}
export interface CombinedOptions extends Options, PaceOptions {}
export type Mapper = <T, R>(
  arr: readonly T[],
  fn: (value: T) => PromiseLike<R>
) => Promise<(Awaited<R> | null)[]>

export declare function map<T, R>(arr: readonly T[], fn: (value: T) => PromiseLike<R>, options?: CombinedOptions): Promise<(Awaited<R> | null)[]>
export declare function mapX<T, R>(arr: readonly T[], fn: (value: T) => PromiseLike<R>, options?: Options): Promise<(Awaited<R> | null)[]>
export declare function mapP<T, R>(arr: readonly T[], fn: (value: T) => PromiseLike<R>, options?: PaceOptions): Promise<(Awaited<R> | null)[]>
export declare const oneX: Mapper
export declare const twoX: Mapper
export declare const threeX: Mapper
export declare const fourX: Mapper
export declare const fiveX: Mapper
export declare const tenX: Mapper
export declare const serial: Mapper
export declare const linear: Mapper
export declare const crawl: Mapper
export declare const walk: Mapper
export declare const run: Mapper
export declare const sprint: Mapper
export declare const oneP: Mapper
export declare const twoP: Mapper
export declare const threeP: Mapper
export declare const fourP: Mapper
export declare const fiveP: Mapper
export declare const tenP: Mapper
