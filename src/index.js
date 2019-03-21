const methods = {
  walk: async function(arr, fn, done) {
    let results = []
    for (const val of arr) {
      let res = await fn(val)
      results.push(res)
    }
  // done(results)
  },
}
module.exports = methods
