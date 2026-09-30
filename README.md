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

Run work in parallel, without going too fast

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

Intended for courteous use of web-services, or doing async without a blown heap.

<!-- spacer -->
<img height="10px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

* Respect both concurrency limits, and rate limits

* Results stay in input order, even when operations finish out of order

* Types are included, require is supported

* 2kb, no dependencies

<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

```js
slow.run([1, 2, 3], async n => n * 3).then(console.log)
// [3, 6, 9]
```

<!-- spacer -->
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
</div>
  
### Combined Rate-limiting

Responsible rate-limiting should observe two independent things:

* `concurrency` - ensure slow results do not accumulate and blowstack
* `pace` - ensure an API is not abused, even if returns quickly

these exported methods have defaults for both:
```js
import { .... } from 'slow'

// concurrency of 2, with different paces
await crawl(arr, fn)  // only 1 per 500ms
await stroll(arr, fn) // only 1 / second
await walk(arr, fn)   // only 2 / second
await jog(arr, fn)    // only 3 / second
await run(arr, fn)    // only 4 / second
await sprint(arr, fn) // only 5 / second

// different concurrencies, with same rate-limit (1s / 60bpm / adagio)
await solo(arr, fn)    // only 1 concurrently
await duet(arr, fn)    // only 2 concurrently
await trio(arr, fn)    // only 3 concurrently
await quartet(arr, fn) // only 4 concurrently
await quintet(arr, fn) // only 5 concurrently
```

if you don't care about concurrency:
```js
await onePerSec(arr, fn)   // fire-blindly every second
await twoPerSec(arr, fn)   // fire-blindly every 500ms
await threePerSec(arr, fn) // .. every 333ms
await fourPerSec(arr, fn)  // .. every 250ms
await fivePerSec(arr, fn)  // .. every 200ms
```

if you dont care about rate-limmiting:
```js
await maxOne(arr, fn)   // 1 lane, full-speed (sync/linear/serial)
await maxTwo(arr, fn)   // 2 lanes, full-speed
await maxThree(arr, fn) // 3 lanes, full-speed
await maxFour(arr, fn)  // 4 lanes, full-speed
await maxFive(arr, fn)  // 5 lanes, full-speed
```

<!-- spacer -->
<img height="15px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

if you care dearly about both, and want to configure them closely:
```js
import slow from 'slow'

// (default export)
slow(arr, fn, { concurrency: 3, pace: 2 })
```
Here, callbacks fire at least 500 ms apart, with at most 3 going at once.

Both are optional:
- `concurrency`: max number of simultaneus lanes `(integer | null)`
- `pace`: max number of starts per second  `(integer | float | null)`
- -  `0.5` means *every 2000 ms*; `2.5` means *every 400 ms*.

Omitted or null options impose no limit. 
With neither limit, all functions fire at once.

<!-- spacer -->
<img height="35px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
</div>

### Details
* In all cases, the first callback starts immediately.

* There is no 'debt' concept in combined-limiting. If its limited by capacity, and the next callback waits beyond its required pace limit, the waiting does not earn a burst of starts later.

* Given limits of `0`, `null`, `undefined`, and `Infinity` all equal "no limit".

* If neither pace nor concurrency have a given limit, all functions just run at full-blast.

* `arr` must be an array and `fn` must be a function

* Synchronous callbacks still respect pace limits.

* Take care not to mutate the array while processing it.


#### Errors
thrown errors or rejected promises produce `null` at that index:
```js
await slow([1, 2, 3], n => n * 2)
// [2, 4, 6]
```

* Catch the errors inside your callback if you need logging

* Invalid arguments reject with an `Error` object.

* A callback that never settles keeps its operation pending, and block a concurrency lane.

```js
const results = await slow.maxOne([1, 2, 3], async n => {
  if (n === 2) throw new Error('failed')
  return n
})
// [1, null, 3]
```

#### Cancel / Stop

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

---

### Usage 
#### Client-side:

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
build at `builds/slow.js`.

#### TypeScript:

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

<!-- spacer -->
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
</div>

### See also

- [bottleneck](https://github.com/SGrondin/bottleneck) - supports more-elaborate queues
- [sindresorhus/p-map](https://github.com/sindresorhus/p-map) - concurrency-limiting
- [sindresorhus/p-queue](https://github.com/sindresorhus/p-queue) - more concurrency controls
- [sindresorhus/p-limit](https://github.com/sindresorhus/p-limit) - reusable limiter sharing
- [sindresorhus/p-throttle](https://github.com/sindresorhus/p-throttle) - pace-limiting

MIT, PRs welcome
