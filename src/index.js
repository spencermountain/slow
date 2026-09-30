import rateLimit from './rate-limit.js'

export const map = async (arr, fn, opts = {}) => {
  return rateLimit(arr, fn, opts.concurrency, opts.pace, opts.signal)
}

// concurrency-only limits
export const serial = async (arr, fn) => rateLimit(arr, fn, 1)
export const linear = async (arr, fn) => rateLimit(arr, fn, 1)
export const maxOne = async (arr, fn) => rateLimit(arr, fn, 1)
export const maxTwo = async (arr, fn) => rateLimit(arr, fn, 2)
export const maxThree = async (arr, fn) => rateLimit(arr, fn, 3)
export const maxFour = async (arr, fn) => rateLimit(arr, fn, 4)
export const maxFive = async (arr, fn) => rateLimit(arr, fn, 5)

// pace limits
export const onePerSec = async (arr, fn) => rateLimit(arr, fn, null, 1)
export const twoPerSec = async (arr, fn) => rateLimit(arr, fn, null, 2)
export const threePerSec = async (arr, fn) => rateLimit(arr, fn, null, 3)
export const fourPerSec = async (arr, fn) => rateLimit(arr, fn, null, 4)
export const fivePerSec = async (arr, fn) => rateLimit(arr, fn, null, 5)

// combined concurrency and pace limits
// (two-feet, but different paces)
export const crawl = async (arr, fn) => rateLimit(arr, fn, 2, 0.5)
export const stroll = async (arr, fn) => rateLimit(arr, fn, 2, 1)
export const walk = async (arr, fn) => rateLimit(arr, fn, 2, 2)
export const jog = async (arr, fn) => rateLimit(arr, fn, 2, 3)
export const run = async (arr, fn) => rateLimit(arr, fn, 2, 4)
export const sprint = async (arr, fn) => rateLimit(arr, fn, 2, 5)

// (different concurrencies, but all 60bpm/adagio)
export const solo = async (arr, fn) => rateLimit(arr, fn, 1, 1)
export const duet = async (arr, fn) => rateLimit(arr, fn, 2, 1)
export const trio = async (arr, fn) => rateLimit(arr, fn, 3, 1)
export const quartet = async (arr, fn) => rateLimit(arr, fn, 4, 1)

// The default is map itself, with every named method also available on it.
const slow = Object.assign(map, {
  map,
  serial,
  linear,
  maxOne,
  maxTwo,
  maxThree,
  maxFour,
  maxFive,
  onePerSec,
  twoPerSec,
  threePerSec,
  fourPerSec,
  fivePerSec,
  crawl,
  stroll,
  walk,
  jog,
  run,
  sprint,
  solo,
  duet,
  trio,
  quartet,
})

export default slow
