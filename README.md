<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div>keep your pants on, javascript</div>
  <a href="https://npmjs.org/package/slow">
    <img src="https://img.shields.io/npm/v/slow.svg?style=flat-square" />
  </a>
  <a href="https://bundlephobia.com/result?p=slow@latest">
    <img src="https://badgen.net/bundlejs/min/slow" />
  </a>
  <div><code>npm add slow</code></div>
</div>

Run work in parallel, but without going too fast -

```js
import * as slow from 'slow'
import { walk } from 'slow'

let urls = [
  'https://en.wikipedia.org/wiki/New_York_Yankees',
  'https://en.wikipedia.org/wiki/Toronto_Blue_Jays',
  'https://en.wikipedia.org/wiki/Boston_Red_Sox'
]
const pages = await walk(urls, async url => {
  const response = await fetch(url)
  return response.text()
})
```

Useful for courteous use of a web-service, or avoiding a blown-stack.

Useful when you don't want to write a custom `Promise.all()` thing.

`walk()` starts 2 operations per second. `run()` starts 3 per second.
`crawl()` works on 2 at a time.
```js
slow.run([1, 2, 3], async n => n * 3).then(console.log)
// [3, 6, 9]
```
Results stay in input order, even when operations finish out of order.

Types are included, require is supported.

No dependencies.

### Shortcuts

Each shortcut takes `(arr, fn)`:

| Maximum active operations | Methods |
| --- | --- |
| 1 | `oneX`, `serial`, `linear` |
| 2 | `twoX`, `crawl` |
| 3 | `threeX` |
| 4 | `fourX` |
| 5 | `fiveX` |
| 10 | `tenX` |


### Notes on concurrency

The `*X` methods limit active tasks, not requests per second.
So fast operations can still produce many requests per second.
Use the `*P` methods to limit the pace of new starts.

```js
const opts = { concurrency: 4 }
const myFn = async function(item) {
  return processItem(item)
}
const results = await slow.mapX(items, myFn, opts)
```

`slow.mapX(arr, fn, { concurrency = 5 })` starts up to `concurrency` callbacks,
then starts another whenever a slot becomes free. Concurrency must be a positive
safe integer. Limits apply independently to each call.


### Pace limits

`mapP(arr, fn, { pace = 5 })` limits starts per second, spacing them evenly.
The first callback starts immediately; at pace 5, later callbacks start at least
200 ms apart. Slow callbacks can overlap: pace does not cap active operations.
Timing is best effort; a busy event loop can delay starts, without catch-up bursts.

```js
import { mapP, twoP } from 'slow'

const pages = await twoP(urls, async url => {
  const response = await fetch(url)
  return response.text()
})
const results = await mapP(items, processItem, { pace: 4 })
```

The shortcuts `oneP`, `twoP`, `threeP`, `fourP`, `fiveP`, and `tenP` take
`(arr, fn)` and start at most 1, 2, 3, 4, 5, or 10 callbacks per second.
`walk` is an alias for `twoP` (500 ms between starts), and `run` is an alias
for `threeP` (about 333 ms between starts). `sprint` is an alias for `fiveP`
(5 starts per second, 200 ms between starts).
Pace must be a positive safe integer. Each call has its own schedule, and resolves
when all callbacks settle. Results and errors follow the same rules as activity limits.

### Combining limits

`map(arr, fn, { concurrency, pace })` enforces both limits together:

```js
import { map } from 'slow'

const results = await map(items, processItem, { concurrency: 3, pace: 2 })
```

This starts callbacks at least 500 ms apart, with at most 3 active at once.
If all slots are occupied, the next callback waits for a slot. Time spent waiting
does not accumulate credit for a burst of starts.

Both options are optional: an omitted or `undefined` option imposes no limit.
With neither option, all callbacks start immediately. Supplied limits must be
positive safe integers. Limits apply independently to each call; ordering and
error handling match `mapX` and `mapP`.

### In the browser

```html
<html>
  <script src="https://unpkg.com/slow"></script>
  <script defer>
    let urls = [
      'https://en.wikipedia.org/wiki/New_York_Yankees',
      'https://en.wikipedia.org/wiki/Toronto_Blue_Jays',
      'https://en.wikipedia.org/wiki/Boston_Red_Sox'
    ]
    slow.walk(urls, fetch).then(pages => {
      console.log(pages)
    })
  </script>
</html>

```

The browser bundles expose `slow` as a global. The package also includes an ESM
build at `builds/slow.mjs`.


### Results and errors

- `arr` must be an array and `fn` must be a function returning a promise (or thenable).
- Each callback receives one array value. Input order and the original array length
  determine the output; do not mutate the array while processing it.
- An empty array resolves to `[]` after argument validation.
- A rejected callback or synchronous callback throw produces `null` at that index.
  This includes errors thrown while reading a returned thenable's `then` property.
  Other items continue. Errors are not logged automatically. Catch errors inside
  your callback if you need logging or a different fallback value.
- Invalid arguments or a callback returning a non-promise reject with an `Error`
  object. A non-promise result stops queued work; operations already started are
  allowed to settle and their rejections remain handled.
- There is no cancellation or timeout. A callback that never settles keeps its
  operation pending. Configure timeouts in your callback when needed.

```js
const results = await slow.oneX([1, 2, 3], async n => {
  if (n === 2) throw new Error('failed')
  return n
})
// [1, null, 3]
```

MIT
