const { ESLint } = require('eslint')

function createLinter(options) {
  return new ESLint({
    ...options,
    overrideConfig: {
      parserOptions: {
        // Single-run inference under CI reads disk files instead of lintText test snippets.
        disallowAutomaticSingleRunInference: true
      }
    }
  })
}

module.exports = { createLinter }
