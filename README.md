<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div>keep your pants on, javascript</div>
  <a href="https://npmjs.org/package/slow">
    <img src="https://img.shields.io/npm/v/slow.svg?style=flat-square" />
  </a>
  <a href="https://bundlephobia.com/result?p=slow@latest">
    <img src="https://badgen.net/bundlejs/min/slow" />
  </a>
  <div><code>npm install slow</code></div>
</div>


<!-- spacer -->
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

Run work in parallel, but without going too fast

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

Intended for courteous use of web-services, or doing async without a blownin a heap.

...or if you just don't want to write some custom `Promise.all()` thing
<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

* `walk()` for example allows `<=2` concurrent, with `<=2` fires per second.

* Results stay in input order, even when operations finish out of order.

* Types are included, require is supported.

* No dependencies.

<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

```js
slow.run([1, 2, 3], async n => n * 3).then(console.log)
// [3, 6, 9]
```

<!-- spacer -->
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  
### Combined Rate-limiting

Responsible rate-limiting should observe two independent things:

* `concurrency` - ensure slow results do not accumulate and blowstack
* `pace` - ensure an API is not abused, even if returns quickly

As such, these exported methods have sensible defaults for both:
```js
import { .... } from 'slow'

// concurrency of 2 (two feet?), but different paces
crawl(arr, fn)  // <= 1 per 500ms
stroll(arr, fn) // <= 1 / second
walk(arr, fn)   // <= 2 / second
jog(arr, fn)    // <= 3 / second
run(arr, fn)    // <= 4 / second
sprint(arr, fn) // <= 5 / second

// different concurrencies, but same 1s rate-limit (60bpm / adagio)
solo(arr, fn)    // <= 1 concurrently
duet(arr, fn)    // <= 2 concurrently
trio(arr, fn)    // <= 3 concurrently
quartet(arr, fn) // <= 4 concurrently
quintet(arr, fn) // <= 5 concurrently
```

if you don't care about concurrency:
```js
onePerSec(arr, fn)   // fire blindly every sec
twoPerSec(arr, fn)   // fire blindly every  500ms
threePerSec(arr, fn) // fire blindly every 333ms
fourPerSec(arr, fn)  // fire blindly every 250ms
fivePerSec(arr, fn)  // fire blindly every 200ms
```

if you dont care about rate-limmiting:
```js
maxOne(arr, fn)   // 1-lane, full-speed (sync/linear/serial)
maxTwo(arr, fn)   // 2-lanes, full-speed
maxThree(arr, fn) // 3-lanes, full-speed
maxFour(arr, fn)  // 4-lanes, full-speed
maxFive(arr, fn)  // 5-lanes, full-speed
```

<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

if you care dearly about both, and want to configure them closely:
```js
import slow from 'slow'

slow(arr, fn, { concurrency: 3, pace: 2 })
```
In this example callbacks are at least 500 ms apart, with at most 3 active at once.

Both options are optional:
- `concurrency`: (lanes) a positive integer, or `null` for no limit
- `pace`: max number of starts per second. Fractions are supported:
- -  `0.5` means one start every two seconds; `2.5` means one every 400 ms.

Omitted or `null` options impose no limit. With neither limit, all functions fire at once.

<!-- spacer -->
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  

### Details
In all cases, the first callback starts immediately.

There is no 'debt' concept in combined-limiting. If its limited by capacity, and the next callback waits beyond its required pace limit, the waiting does not earn a burst of starts later.

Given limits of `0`, `null`, `undefined`, and `Infinity` all equal "no limit".

If neither pace nor concurrency have a given limit, all functions just run at full-blast.

`arr` must be an array and `fn` must be a function. Callbacks may return plain
values, promises, or thenables. Values are stored directly; promises are awaited.
`null` and `undefined` are preserved, and thrown errors or rejected promises
produce `null` at that index. Synchronous callbacks still respect pace limits.

```js
await slow([1, 2, 3], n => n * 2)
// [2, 4, 6]
```

Take care not to mutate the array while processing it.

Any rejected callback throw produces `null` at that index. Other items continue.

Errors are not logged automatically. Catch errors inside your callback if you need logging or a different fallback value.

Invalid arguments reject with an `Error` object.

A callback that never settles keeps its operation pending, and block a concurrency lane.

```js
const results = await slow.maxOne([1, 2, 3], async n => {
  if (n === 2) throw new Error('failed')
  return n
})
// [1, null, 3]
```

the `slow` method promise can be aborted or cancelled, by passing a signal:
```js
const controller = new AbortController()

setTimeout(() => {
  controller.abort() // kill it
}, 5000)

await slow(arr, fn, { pace: 2, signal: controller.signal })
```
Aborting stops new work and rejects promptly with `signal.reason`.

Callbacks receive `{ signal }` as their second argument; forward it your callback to stop active requests too.
Functions that ignore the signal may keep running, but its later rejections remain handled.
```js
const signal = AbortSignal.timeout(5000)

const pages = await slow(urls, async url => {
  const response = await fetch(url, { signal })
  return response.text()
}, { concurrency: 2, pace: 3, signal })
```

### In the browser

```html
<html>
  <script src="https://unpkg.com/slow"></script>
  <script type="module">
    let urls = [
      'https://en.wikipedia.org/wiki/New_York_Yankees',
      'https://en.wikipedia.org/wiki/Toronto_Blue_Jays',
      'https://en.wikipedia.org/wiki/Boston_Red_Sox',
    ]
    const pages = await slow.walk(urls, async (url) => {
      const res = await fetch(url, { method: 'HEAD' })
      return { url, modified: res.headers.get('last-modified') }
    })
    console.log(pages)
  </script>
</html>

```

The browser bundles expose `slow` as a global. The package also includes an ESM
build at `builds/slow.mjs`.

### TypeScript

Input and result types are inferred from your callback. Results include `null`
for failed or skipped items; cancelling the call rejects its promise.

```ts
import slow, { type Options } from 'slow'

const options: Options = {
  concurrency: 2,
  pace: 3
}
const urls = ['https://example.com']

interface Result {
  url: string
  html: string
}

const fn = async function(url: string): Promise<Result>  {
  const response = await fetch(url)
  return { url, html: await response.text() }
}

const results: (Result | null)[] = await slow(urls, fn, options)
```

### See also

- [SGrondin/bottleneck](https://github.com/SGrondin/bottleneck) - supports more-elaborate queues
- [sindresorhus/p-map](https://github.com/sindresorhus/p-map) - concurrency-limiting
- [sindresorhus/p-queue](https://github.com/sindresorhus/p-queue) - more concurrency controls
- [sindresorhus/p-limit](https://github.com/sindresorhus/p-limit) - reusable limiter that can be shared
- [sindresorhus/p-throttle](https://github.com/sindresorhus/p-throttle) - pace-limiting

MIT
