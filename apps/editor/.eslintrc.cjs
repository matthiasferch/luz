module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue']
  },
  plugins: ['@typescript-eslint', 'vue', 'luz'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/essential', 'prettier'],
  globals: {
    __EDITOR_VERSION__: 'readonly',
    __EDITOR_DEVELOPMENT__: 'readonly',
    __EDITOR_SCENES__: 'readonly'
  },
  ignorePatterns: ['node_modules/', 'dist/', 'src/assets/**/*.json'],
  rules: {
    ...require('../../eslint-layout.cjs'),
    ...require('../../eslint-unused.cjs'),
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-explicit-any': 'off'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.vue'],
      rules: {
        ...require('../../eslint-types.cjs'),
        '@typescript-eslint/naming-convention': ['error', ...require('../../eslint-naming.cjs')]
      }
    },
    {
      files: ['**/*.js', '**/*.cjs'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'script', project: null },
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          ...require('../../eslint-naming.cjs').filter((rule) => !rule.types)
        ],
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      }
    },
    {
      files: ['**/*.mjs'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: null },
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          ...require('../../eslint-naming.cjs').filter((rule) => !rule.types)
        ],
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off'
      }
    }
  ]
}
