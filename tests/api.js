// The public contract, kept explicit so accidental additions/removals fail tests.
export const methods = [
  'map', 'serial', 'linear',
  'maxOne', 'maxTwo', 'maxThree', 'maxFour', 'maxFive',
  'onePerSec', 'twoPerSec', 'threePerSec', 'fourPerSec', 'fivePerSec',
  'crawl', 'stroll', 'walk', 'jog', 'run', 'sprint',
  'solo', 'duet', 'trio', 'quartet', 'quintet',
]

export const combinedPresets = {
  crawl: { concurrency: 2, pace: 0.5 },
  stroll: { concurrency: 2, pace: 1 },
  walk: { concurrency: 2, pace: 2 },
  jog: { concurrency: 2, pace: 3 },
  run: { concurrency: 2, pace: 4 },
  sprint: { concurrency: 2, pace: 5 },
  solo: { concurrency: 1, pace: 1 },
  duet: { concurrency: 2, pace: 1 },
  trio: { concurrency: 3, pace: 1 },
  quartet: { concurrency: 4, pace: 1 },
  quintet: { concurrency: 5, pace: 1 },
}
