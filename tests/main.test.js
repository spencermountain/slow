let test = require('tape')
let slow = require('../src')

///
///test the process with random callback times
///

test('promise-version', function(t) {
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  //return a promise
  function random_wait(i) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(i)
      }, Math.random() * 3000)
    })
  }
  slow.walk(arr, random_wait).then(function(result) {
    t.ok(JSON.stringify(result), JSON.stringify(arr), 'got-ordered-result')
    t.end()
  })
})

test('async-version', async function(t) {
  let arr = [1, 2, 3, 4, 5, 6]
  //return a promise
  function random_wait(i) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(i)
      }, Math.random() * 3000)
    })
  }
  let result = await slow.walk(arr, random_wait)
  t.ok(JSON.stringify(result), JSON.stringify(arr), 'got-ordered-result')
  t.end()
})

test('small-array', async function(t) {
  let arr = [2, 1]
  //return a promise
  function random_wait(i) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(i)
      }, Math.random() * 3000)
    })
  }
  let result = await slow.run(arr, random_wait)
  t.ok(JSON.stringify(result), JSON.stringify(arr), 'got-ordered-result')
  t.end()
})

test('empty-array', async function(t) {
  let arr = []
  //return a promise
  function random_wait(i) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(i)
      }, Math.random() * 3000)
    })
  }
  let result = await slow.sprint(arr, random_wait)
  t.ok(JSON.stringify(result), JSON.stringify(arr), 'got-ordered-result')
  t.end()
})
