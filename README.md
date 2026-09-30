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
import slow from 'slow'

const pages = await slow.walk(urls, async url => {
  const response = await fetch(url)
  return response.text()
})
```

Useful for courteous use of a web-service, or avoiding a blown-stack.

Useful when you don't want to think through concurrency or wrtie a custom `Promise.all()` thing.

`walk()` works on 5 at a tiime. `crawl()` works on 3 at a time.
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
| 1 | `one`, `serial`, `linear` |
| 2 | `two` |
| 3 | `three`, `crawl` |
| 4 | `four` |
| 5 | `five`, `walk` |
| 10 | `ten`, `run` |
| 15 | `fifteen`, `sprint` |


### Notes on concurrency

This is a *active tasks* limit, not a requests-per-second limit. 
So fast operations can still produce many requests per second. 
Use a time-based limiter if a service requires a fixed request rate.

```js
const opts = { concurrency: 4 } 
const myFn = async function(item) {
  return processItem(item)
}
const results = await slow.map(items, myFn, opts)
```

`slow.map(arr, fn, { concurrency = 5 })` starts up to `concurrency` callbacks,
then starts another whenever a slot becomes free. Concurrency must be a positive
safe integer. Limits apply independently to each call.


### In the browser

```html
<script src="https://unpkg.com/slow"></script>
<script>
  slow.walk(['/one', '/two'], async url => {
    const response = await fetch(url)
    return response.text()
  }).then(console.log)
</script>
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
const results = await slow.one([1, 2, 3], async n => {
  if (n === 2) throw new Error('failed')
  return n
})
// [1, null, 3]
```

MIT
