module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'luz'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    ...require('./eslint-layout.cjs'),
    ...require('./eslint-unused.cjs')
  },
  ignorePatterns: ['node_modules/', 'dist/', '**/._*'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.mts', '**/*.cts'],
      parserOptions: {
        project: ['./tsconfig.json', './tests/tsconfig.json', './tests/fixtures/distribution/tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      rules: {
        ...require('./eslint-types.cjs'),
        '@typescript-eslint/naming-convention': ['error', ...require('./eslint-naming.cjs')],
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-this-alias': 'off'
      }
    },
    {
      files: ['packages/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error'
      }
    },
    {
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off'
      }
    },
    {
      files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
      parserOptions: { project: null },
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          ...require('./eslint-naming.cjs').filter((rule) => !rule.types)
        ],
        '@typescript-eslint/no-require-imports': 'off'
      }
    }
  ]
}
