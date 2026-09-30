export * from './index.cjs'
import { map } from './index.cjs'

// Declare the ESM default explicitly: a CJS default re-export can be interpreted
// as the module namespace rather than the callable function.
declare const slow: typeof map & Omit<typeof import('./index.cjs'), 'default'>
export default slow
