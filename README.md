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

`walk()` for example, allows `2` concurrent operations, with max `2` fires per second.

```js
slow.run([1, 2, 3], async n => n * 3).then(console.log)
// [3, 6, 9]
```
Results stay in input order, even when operations finish out of order.

Types are included, require is supported.

No dependencies.

<!-- spacer -->
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>


### Pace and concurrency

```js
import slow, { map, walk } from 'slow'

const results = await slow.map(items, processItem, { concurrency: 3, pace: 2 })
```

Every method is available as a named export and on the default `slow` object:
`map === slow.map` and `walk === slow.walk`. CommonJS also supports
`const slow = require('slow')` followed by `slow.map(...)` or `slow.walk(...)`.

This starts callbacks at least 500 ms apart, with at most 3 active at once.
The first callback starts immediately. If all slots are occupied, the next
callback waits for a slot; waiting does not earn a burst of starts later.

Both options are optional. Omitted or `undefined` options impose no limit;
`concurrency: null` also means unrestricted concurrency. With neither limit,
all callbacks start immediately.

- `concurrency`: a positive safe integer, or `null` for no limit.
- `pace`: a positive finite number of starts per second. Fractions are supported:
  `0.5` means one start every two seconds; `2.5` means one every 400 ms.
  Zero, negative values, `null`, strings, `NaN`, and infinity are invalid paces.

```js
await slow.map(items, processItem, { concurrency: null, pace: 0.5 })
```

Limits apply independently to each call. Slow callbacks can overlap when pace
allows another start and concurrency permits it. A busy event loop can delay
starts, but does not produce catch-up bursts.

### Shortcuts

Each shortcut takes `(arr, fn)`:

| Methods | Maximum active operations | Starts per second |
| --- | --- | --- |
| `serial`, `linear`, `maxOne` | 1 | Unrestricted |
| `maxTwo`, `maxThree`, `maxFour`, `maxFive` | 2, 3, 4, 5 respectively | Unrestricted |
| `onePerSec` through `fivePerSec` | Unrestricted | 1 through 5 respectively |
| `crawl` | 2 | 0.5 |
| `stroll` | 2 | 1 |
| `walk` | 2 | 2 |
| `jog` | 2 | 3 |
| `run` | 2 | 4 |
| `sprint` | 2 | 5 |
| `drip` | 1 | 1 |
| `trickle` | 1 | 2 |

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
const results = await slow.maxOne([1, 2, 3], async n => {
  if (n === 2) throw new Error('failed')
  return n
})
// [1, null, 3]
```

MIT
