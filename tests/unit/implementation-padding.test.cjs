const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Linter } = require('eslint')
const rule = require('../../tooling/eslint/implementation-padding.cjs')

it('pads imports and function implementations without separating imports or overload declarations', () => {
  const linter = new Linter()

  linter.defineParser('typescript', require('@typescript-eslint/parser'))
  linter.defineRule('implementation-padding', rule)

  const configuration = {
    parser: 'typescript',
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: { 'implementation-padding': 'error' }
  }
  const source = `import { firstValue } from 'first'
import { secondValue } from 'second'
export function calculate() { return firstValue }
export function create() { return secondValue }
class Example {
  calculate(value: string): string;
  calculate(value: number): number;
  calculate(value: unknown) { return value }
  create() { return 1 }
}`
  const result = linter.verifyAndFix(source, configuration)

  assert.deepEqual(result.messages, [])
  assert.match(result.output, /from 'first'\nimport/)
  assert.match(result.output, /from 'second'\n\nexport/)
  assert.match(result.output, /firstValue }\n\nexport/)
  assert.match(result.output, /return value }\n\n {2}create/)
  assert.match(result.output, /string;\n {2}calculate/)
  assert.equal(linter.verifyAndFix(result.output, configuration).fixed, false)
})
it('separates CommonJS imports and adjacent object methods', () => {
  const linter = new Linter()

  linter.defineRule('implementation-padding', rule)

  const configuration = { parserOptions: { ecmaVersion: 2022 }, rules: { 'implementation-padding': 'error' } }
  const result = linter.verifyAndFix(
    `const firstModule = require('first')
const secondModule = require('second')
const service = {
  calculate() { return firstModule }
  , create: () => secondModule
}`,
    configuration
  )

  assert.deepEqual(result.messages, [])
  assert.match(result.output, /require\('first'\)\nconst second/)
  assert.match(result.output, /require\('second'\)\n\nconst service/)
  assert.match(result.output, /return firstModule }\n\n/)
  assert.equal(linter.verifyAndFix(result.output, configuration).fixed, false)

  const inline = linter.verifyAndFix('const service = { calculate() {}, create() {} }', configuration)

  assert.deepEqual(inline.messages, [])
  assert.match(inline.output, /calculate\(\) {},\n\n/)
  assert.equal(linter.verifyAndFix(inline.output, configuration).fixed, false)
})
