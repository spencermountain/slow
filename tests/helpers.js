/** Assert a promise rejection using Tape's assertion reporting. */
export async function rejects(t, promise, expected) {
  try {
    await promise
    t.fail('expected the promise to reject')
  } catch (error) {
    if (expected instanceof RegExp) {
      t.ok(expected.test(error.message), `rejection matches ${expected}`)
    } else {
      t.ok(error instanceof expected, `rejects with ${expected.name}`)
    }
  }
}
