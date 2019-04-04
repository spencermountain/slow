const rate = require('./rate-limit')

const methods = {
  crawl: (arr, fn) => {
    return rate(arr, fn, 3)
  },
  walk: (arr, fn) => {
    return rate(arr, fn, 5)
  },
  run: (arr, fn) => {
    return rate(arr, fn, 10)
  },
  sprint: (arr, fn) => {
    return rate(arr, fn, 15)
  }
}
module.exports = methods
