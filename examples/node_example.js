let slow = require('../src/slow')

///
///test the process with random callback times
///

let options = {
  debug: true, //understand when the requests are being fired
  verbose: true, //include the input in the results
  monitor: function(r) {
    console.log('---' + r)
  }, //watch the results coming in in real-time
  max: 10 //the most number of concurrent requests you're comfortable making
}

let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function random_wait(q, callback) {
  let x = Math.floor(Math.random() * 4000)
  setTimeout(function() {
    callback('finished ' + q + ' in ' + x + 'ms')
  }, x)
}

slow.walk(arr, random_wait, options, function(result) {
  console.log('==================')
  console.log(JSON.stringify(result, null, 2))
})
