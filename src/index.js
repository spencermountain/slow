const rate = require('./rate-limit')

const methods = {
  one: (arr, fn) => {
    return rate(arr, fn, 1)
  },
  two: (arr, fn) => {
    return rate(arr, fn, 2)
  },
  three: (arr, fn) => {
    return rate(arr, fn, 3)
  },
  four: (arr, fn) => {
    return rate(arr, fn, 4)
  },
  five: (arr, fn) => {
    return rate(arr, fn, 5)
  },
  ten: (arr, fn) => {
    return rate(arr, fn, 10)
  },
  fifteen: (arr, fn) => {
    return rate(arr, fn, 15)
  },
}
methods.serial = methods.one
methods.linear = methods.one
methods.crawl = methods.three
methods.walk = methods.five
methods.run = methods.ten
methods.sprint = methods.fifteen

module.exports = methods
