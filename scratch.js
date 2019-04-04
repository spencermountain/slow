const slow = require('./src/')

//return a promise
function random_wait(i) {
  return new Promise(resolve => {
    console.log('start ' + i)
    setTimeout(() => {
      console.log('done ' + i)
      resolve(i)
    }, Math.random() * 6000)
  })
}

// setInterval(() => {
//   console.log('--')
// }, 500)

// slow
//   .crawl([1, 2, 3, 4, 5], random_wait)
//   .then(res => {
//     console.log('\n\n---done!---\n')
//     console.log(res)
//   })
//   .catch(() => {
//     console.log('bummer!')
//   })

;(async () => {
  let res = await slow.walk(['larry', 'curly', 'moe'], random_wait)
  // ['larry','curly','moe']
  console.log(res)
})()
