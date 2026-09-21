declare namespace slow {
  interface Options {
    concurrency?: number
  }
  type Mapper = <T, R>(
    arr: readonly T[],
    fn: (value: T) => PromiseLike<R>
  ) => Promise<(Awaited<R> | null)[]>
}

declare const slow: {
  map<T, R>(arr: readonly T[], fn: (value: T) => PromiseLike<R>, options?: slow.Options): Promise<(Awaited<R> | null)[]>
  one: slow.Mapper
  two: slow.Mapper
  three: slow.Mapper
  four: slow.Mapper
  five: slow.Mapper
  ten: slow.Mapper
  fifteen: slow.Mapper
  serial: slow.Mapper
  linear: slow.Mapper
  crawl: slow.Mapper
  walk: slow.Mapper
  run: slow.Mapper
  sprint: slow.Mapper
}

export = slow
