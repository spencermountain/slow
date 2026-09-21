export default [
  { ignores: ['builds/**', 'node_modules/**', 'types/**', 'tests/types/**'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { URL: 'readonly', console: 'readonly', setTimeout: 'readonly', setImmediate: 'readonly' },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      'no-async-promise-executor': 'error',
      'no-promise-executor-return': 'error',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
    },
  },
]
