//only do foo promises at a time.
const rateLimit = function(arr, fn, limit = 5) {
  return new Promise((resolve, reject) => {
    //some validation
    if (!arr || !fn) {
      reject('Error: missing required parameters to rate-limit function')
      return
    }
    if (arr.length === 0) {
      resolve([])
      return
    }
    let results = []
    let n = limit - 1
    let pending = 0

    //simple recursion, but with then/finally
    const go = function(i) {
      pending += 1
      let p = fn(arr[i])
      if (!p.then) {
        reject('Error: function must return a promise')
        return
      }
      p.then(r => {
        results[i] = r
      })
      p.catch(e => {
        console.error(e)
        results[i] = null
      })
      p.finally(() => {
        pending -= 1
        n += 1
        //should we keep going?
        if (arr.length >= n + 1) {
          go(n)
        } else if (pending <= 0) {
          //no more to start - are we the last to finish?
          resolve(results)
        }
      })
    }

    //fire-off first-n items
    let init = arr.length < limit ? arr.length : limit
    for (let i = 0; i < init; i += 1) {
      go(i)
    }
  })
}
module.exports = rateLimit
