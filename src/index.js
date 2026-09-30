import rateLimit from './rate-limit.js'

export const slow = async (arr, fn, opts = {}) => {
  return rateLimit(arr, fn, opts.concurrency, opts.pace)
}

const maxPace = 4
export const serial = async (arr, fn) => rateLimit(arr, fn, 1, maxPace)
export const linear = async (arr, fn) => rateLimit(arr, fn, 1, maxPace)
export const walk = async (arr, fn) => rateLimit(arr, fn, 2, maxPace)
export const run = async (arr, fn) => rateLimit(arr, fn, 3, maxPace)
export const sprint = async (arr, fn) => rateLimit(arr, fn, 5, maxPace)
export const crawl = async (arr, fn) => rateLimit(arr, fn, 2, 1)

// concurrency limits
export const oneX = async (arr, fn) => rateLimit(arr, fn, 1)
export const twoX = async (arr, fn) => rateLimit(arr, fn, 2)
export const threeX = async (arr, fn) => rateLimit(arr, fn, 3)
export const fourX = async (arr, fn) => rateLimit(arr, fn, 4)
export const fiveX = async (arr, fn) => rateLimit(arr, fn, 5)

// pace limits
export const onePerSecond = async (arr, fn) => rateLimit(arr, fn, null, 1)
export const twoPerSecond = async (arr, fn) => rateLimit(arr, fn, null, 2)
export const threePerSecond = async (arr, fn) => rateLimit(arr, fn, null, 3)
export const fourPerSecond = async (arr, fn) => rateLimit(arr, fn, null, 4)
export const fivePerSecond = async (arr, fn) => rateLimit(arr, fn, null, 5)

