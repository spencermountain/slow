import activityLimit from './activity-limit.js'
import paceLimit from './pace-limit.js'
import combinedLimit from './combined-limit.js'

export const map = async (arr, fn, options = {}) => combinedLimit(arr, fn, options)

export const mapX = async (arr, fn, { concurrency = 5 } = {}) => {
  return activityLimit(arr, fn, concurrency)
}

// concurrency limits
export const oneX = async (arr, fn) => activityLimit(arr, fn, 1)
export const twoX = async (arr, fn) => activityLimit(arr, fn, 2)
export const threeX = async (arr, fn) => activityLimit(arr, fn, 3)
export const fourX = async (arr, fn) => activityLimit(arr, fn, 4)
export const fiveX = async (arr, fn) => activityLimit(arr, fn, 5)
export const tenX = async (arr, fn) => activityLimit(arr, fn, 10)
export const serial = oneX
export const linear = oneX

export const crawl = twoX

// evenly spaced starts per second
export const mapP = async (arr, fn, { pace = 5 } = {}) => {
  return paceLimit(arr, fn, pace)
}
export const oneP = async (arr, fn) => paceLimit(arr, fn, 1)
export const twoP = async (arr, fn) => paceLimit(arr, fn, 2)
export const threeP = async (arr, fn) => paceLimit(arr, fn, 3)
export const fourP = async (arr, fn) => paceLimit(arr, fn, 4)
export const fiveP = async (arr, fn) => paceLimit(arr, fn, 5)
export const tenP = async (arr, fn) => paceLimit(arr, fn, 10)

export const walk = twoP
export const run = threeP
export const sprint = fiveP
