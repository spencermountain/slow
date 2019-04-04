let test = require('tape')
let slow = require('../src')

test('test-no-promise', function(t) {
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  //return a promise
  function no_promise(i) {
    return {
      cool: i
    }
  }
  slow
    .walk(arr, no_promise)
    .then(function() {
      t.fail()
    })
    .catch(() => {
      t.ok(true, 'no-promise threw error')
    })
    .finally(() => {
      t.end()
    })
})
