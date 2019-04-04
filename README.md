<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/399657/23590290/ede73772-01aa-11e7-8915-181ef21027bc.png" />
  <div>keep your pants on, javascript</div>
  <a href="https://npmjs.org/package/slow">
    <img src="https://img.shields.io/npm/v/slow.svg?style=flat-square" />
  </a>
  <div><code>npm install slow</code></div>
</div>

Run a function in parallel, but without going too fast.

Give it `an array` as input, and `a function` that returns a Promise.

then it tells you when it's done.

useful for courteous use of a web-service, or avoiding a blown-stack.

```js
const slow = require('slow')

function randomWait(i) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(i)
    }, Math.random() * 3000)
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

#### Methods:

- **slow.crawl()** - max 3
- **slow.walk()** - max 5
- **slow.run()** - max 10
- **slow.sprint()** - max 15

`slow` can be run in the browser too, like this:

```html
<script src="https://unpkg.com/slow"></script>
<script>
  let urls = [
    'https://en.wikipedia.org/wiki/New_York_Yankees',
    'https://en.wikipedia.org/wiki/Toronto_Blue_Jays',
    'https://en.wikipedia.org/wiki/Boston_Red_Sox'
  ]
  slow(urls, fetch).then(pages => {
    console.log(pages)
  })
</script>
```

### See also

- [async/maplimit](https://caolan.github.io/async/docs.html#mapLimit)
- [dbrockman/promise-map-limit](https://github.com/dbrockman/promise-map-limit)
- [addaleax/promise-ratelimit](https://github.com/addaleax/promise-ratelimit)
  MIT
