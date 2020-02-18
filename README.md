<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div>keep your pants on, javascript</div>
  <a href="https://npmjs.org/package/slow">
    <img src="https://img.shields.io/npm/v/slow.svg?style=flat-square" />
  </a>
  <div><code>npm install slow</code></div>
</div>

Run a function in parallel, without going too fast.

Give it `an array`, and `a function` that returns a Promise.

then it tells you when it's done.

useful for courteous use of a web-service, or avoiding a blown-stack.

```js
const slow = require('slow')

const randomWait = i => {
  return new Promise(resolve => {
    setTimeout(() => resolve(i), Math.random() * 3000)
  })
}
slow.walk([1, 2, 3, 4, 5, 6], randomWait).then(res => {
  console.log('done!')
  console.log(res) //[1,2,3,4,5,6]
})
```

or, if you prefer, as `async/await`

```js
;(async () => {
  let res = await slow.walk(['larry', 'curly', 'moe'], randomWait)
  // ['larry', 'curly', 'moe']
})()
```

results are always in order.

one bad async call will not throw the whole operation, either.

#### Methods:

- **slow.crawl(arr, fn)** - max 3
- **slow.walk(arr, fn)** - max 5
- **slow.run(arr, fn)** - max 10
- **slow.sprint(arr, fn)** - max 15
- **slow.one(arr, fn)** - max 1
- **slow.two(arr, fn)** - max 2

#### In the browser:

```html
<script src="https://unpkg.com/slow"></script>
<script defer>
  let urls = ['New_York_Yankees', 'Toronto_Blue_Jays', 'Boston_Red_Sox']
  slow.walk(urls, fetch).then(pages => {
    console.log(pages)
  })
</script>
```

### See also

- [async/maplimit](https://caolan.github.io/async/docs.html#mapLimit)
- [dbrockman/promise-map-limit](https://github.com/dbrockman/promise-map-limit)
- [addaleax/promise-ratelimit](https://github.com/addaleax/promise-ratelimit)

  MIT
