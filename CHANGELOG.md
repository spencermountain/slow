# Changelog

## 2.0.0 - [Sep 2026]
### Added
- **[major]** - browser builds now target modern browsers
- **[major]** - error inputs properly throw errors
- **[major]** - synchronous callback throws as item failures
- **[major]** - modern build targets
- **[new]** - `slow.map(arr, fn, { concurrency })` for custom concurrency, defaulting to five.
- **[new]** - TypeScript declarations for ESM and CommonJS consumers, including nullable results.
- **[new]** -  Conditional package exports for ESM and CommonJS.
- **[fix]** - Prevent unhandled rejections from separately attached promise handlers.
- **[fix]** - Prevent later synchronous callback throws from leaving the operation pending.
- **[fix]** - Treat exceptions from a thenable's `then` getter as item failures: return `null`
- **[fix]** - for that item and continue processing the array.
- **[fix]** - Validate array, callback, and concurrency arguments consistently.
- **[fix]** - Preserve failing exit statuses for test assertions, runner crashes, and reporter errors.
- **[fix]** - Check actual result equality and concurrency limits in tests.
- **[change]** - Convert source and tooling to ESM while retaining the existing method aliases,
  ordered results, CommonJS support, and browser globals.
- **[change]** -  Simplify Rollup builds and remove the obsolete Browserify build script.
- **[change]** -  Standardize development and release commands on pnpm 11.5.0 and `pnpm-lock.yaml`;
  remove the npm lockfile.
- **[change]** -  Document concurrency limits, failure behavior, migration steps, and release commands.
