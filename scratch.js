const slow = require('./src/')

async function random_wait(i) {
  return await setTimeout(() => {
      console.log('doing ' + i)
      return i
    }, Math.random() * 4000);
}

slow.walk([1, 2, 3, 4], random_wait, (res) => {
  console.log('done!')
  console.log(res)
})
