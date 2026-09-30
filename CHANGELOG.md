# Changelog

## 2.0.0 - [Sep 2026]
Major redesign of the API
- **[breaking]** - `walk`, `run` etc are now named exports, with same api
- **[breaking]** - default export is now a function `slow()`
- **[new]** - walk/run use combined concurrency and pace rate-limiting
- **[new]** - `slow(arr, fn, { pace, concurrency })` for custom concurrency
- **[major]** - browser builds now target modern browsers, node>=18
- **[major]** - error inputs properly throw errors
- **[new]** - TypeScript declarations for ESM and CommonJS consumers.
- **[new]** -  Conditional package exports for ESM and CommonJS.
- **[fix]** - Improve unhandled rejections handling.
- **[update]** - dependencies

## 1.1.0- - [Feb 2020]
- **[change]** - new methods
- **[update]** - dependencies

## 1.0.1 - [Apr 2019]
- **[fix]** - main and unpkg exports
- **[change]** - cleanup browserify, derequire

## 1.0.0 - [Apr 2019]
- **[breaking]** - promise-based rebuild of library
