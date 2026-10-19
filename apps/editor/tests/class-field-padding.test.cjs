const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { Linter } = require('eslint')
const { createLinter } = require('./helpers/create-linter.cjs')
const prettier = require('prettier')
const parser = require('@typescript-eslint/parser')

const rule = require('eslint-plugin-luz').rules['class-field-padding']

const ruleName = 'luz/class-field-padding'
const linter = new Linter()
const configuration = {
  parser: 'typescript',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { [ruleName]: 'error' }
}

linter.defineRule(ruleName, rule)
linter.defineParser('typescript', parser)

const getMessages = (source) => {
  const messages = linter.verify(source, configuration)

  assert.equal(
    messages.some(({ fatal }) => fatal),
    false,
    JSON.stringify(messages)
  )

  return messages
}

const getTokens = (source) => parser.parse(source, { tokens: true }).tokens.map(({ type, value }) => ({ type, value }))

const fixSource = (source) => {
  const result = linter.verifyAndFix(source, configuration)

  assert.deepEqual(result.messages, [])
  assert.equal(linter.verifyAndFix(result.output, configuration).fixed, false)
  assert.deepEqual(getTokens(result.output), getTokens(source))

  return result.output
}

it('groups the Body readonly fields together and separates mutable and private fields', () => {
  const source = `class Body {
  readonly force: Vector
  readonly torque: Vector

  readonly linearVelocity: Vector
  readonly angularVelocity: Vector

  readonly angularCorrection: Vector
  isSleeping = false
  sleepFrames = 0
  wakeRevision = 0
  private lastTransform: Transform
  private kinematicTarget: Target
}`

  assert.equal(getMessages(source).length, 4)
  assert.equal(
    fixSource(source),
    `class Body {
  readonly force: Vector
  readonly torque: Vector
  readonly linearVelocity: Vector
  readonly angularVelocity: Vector
  readonly angularCorrection: Vector

  isSleeping = false
  sleepFrames = 0
  wakeRevision = 0

  private lastTransform: Transform
  private kinematicTarget: Target
}`
  )
})
it('separates changes to any grouping modifier in either direction', () => {
  for (const [previousModifiers, nextModifiers] of [
    ['', 'readonly '],
    ['readonly ', ''],
    ['', 'static '],
    ['static ', ''],
    ['public ', 'protected '],
    ['protected ', 'private '],
    ['private ', 'public '],
    ['private static readonly ', 'private static '],
    ['protected readonly ', 'protected static readonly '],
    ['private static readonly ', 'protected static readonly ']
  ]) {
    const source = `class State {\n  ${previousModifiers}value: number\n  ${nextModifiers}count: number\n}`

    assert.equal(getMessages(source)[0].messageId, 'expectedBlankLine')
    assert.equal(
      fixSource(source),
      `class State {\n  ${previousModifiers}value: number\n\n  ${nextModifiers}count: number\n}`
    )
  }
})
it('normalizes public visibility and groups abstract, declared, optional, and private fields', () => {
  for (const [previousField, nextField] of [
    ['value: number', 'public count: number'],
    ['public value: number', 'count: number'],
    ['abstract readonly value: number', 'readonly count: number'],
    ['declare value: number', 'count?: number'],
    ['value!: number', 'count = 1'],
    ['#value: number', 'private count: number'],
    ['private static readonly value = 1', 'private static readonly count = 2']
  ]) {
    const source = `abstract class State {\n  ${previousField}\n\n  ${nextField}\n}`

    assert.equal(getMessages(source)[0].messageId, 'unexpectedBlankLine')
    assert.equal(fixSource(source), `abstract class State {\n  ${previousField}\n  ${nextField}\n}`)
  }

  assert.equal(getMessages('class State { #value = 1;\n count = 2 }').length, 1)
})
it('preserves comment boundaries without moving comments or treating their contents as padding', () => {
  for (const source of [
    'class State { value = 1;\n\n// A separate group.\ncount = 2 }',
    'class State { value = 1; // Trailing detail.\n\ncount = 2 }',
    'class State { readonly value = 1;\n/** Mutable state. */\ncount = 2 }',
    'class State { readonly value = 1; /* detail\n\ndetail */\ncount = 2 }'
  ]) {
    assert.deepEqual(getMessages(source), [])
    assert.equal(fixSource(source), source)
  }
})
it('keeps decorators attached and preserves initializer text and evaluation order', () => {
  const source = `class State {
  @Serialize()
  readonly value = calculate()

  @Serialize()
  readonly count = calculate(this.value)
  @Serialize()
  output = \`first\n\nsecond\`
}`
  const output = fixSource(source)

  assert.equal(output, source)
  assert.ok(output.includes('`first\n\nsecond`'))

  const initializedSource = `class State {
  value = record('value')

  count = record('count')
  static capacity = record('capacity')
  output = record('output')
}`
  const getInitializationOrder = (input) => {
    const calls = []
    const createState = new Function('record', `${input}; return new State()`)

    createState((value) => calls.push(value))

    return calls
  }

  assert.deepEqual(getInitializationOrder(fixSource(initializedSource)), ['capacity', 'value', 'count', 'output'])
})
it('leaves class boundaries, methods, accessors, static blocks, and interfaces alone', () => {
  const source = `abstract class State {

  value = 1

  constructor() {}
  readonly count = 2
  get size() { return 0 }
  output = 3
  static {}
  readonly limit = 4
  abstract update(): void
  total = 5
  accessor result = 6
  readonly capacity = 7;
  [key: string]: unknown
  entries = 8

}
interface Options { readonly value: number; count: number }
const state = { value: 1,

count: 2 }
class Empty {}
class Single { readonly value = 1 }`

  assert.deepEqual(getMessages(source), [])
  assert.equal(fixSource(source), source)
})
it('supports same-line fields, whitespace-only lines, CRLF, and the native JavaScript parser', () => {
  assert.equal(
    fixSource('class State { value = 1; static count = 2 }'),
    'class State { value = 1;\n\n static count = 2 }'
  )
  assert.equal(
    fixSource('class State { value = 1;\r\n \r\n\r\n count = 2 }'),
    'class State { value = 1;\r\n count = 2 }'
  )
  assert.equal(
    fixSource('class State { value = 1;\r\n static count = 2 }'),
    'class State { value = 1;\r\n\r\n static count = 2 }'
  )

  const result = linter.verifyAndFix('class State { value = 1;\n\ncount = 2;\nstatic capacity = 3 }', {
    parserOptions: configuration.parserOptions,
    rules: configuration.rules
  })

  assert.deepEqual(result.messages, [])
  assert.equal(result.output, 'class State { value = 1;\ncount = 2;\n\nstatic capacity = 3 }')
})
it('keeps fixes stable with Prettier, decorators, and protective semicolons before computed keys', async () => {
  for (const source of [
    'class State { @Serialize() readonly value = 1\n @Serialize() count = 2 }',
    'class State { value = calculate()\n\n;[key] = 2 }',
    'class State { readonly value = calculate()\n;[key] = 2 }',
    'class State { value = calculate();\n\n[key] = 2 }'
  ]) {
    const output = fixSource(source)
    const formatted = await prettier.format(output, { parser: 'typescript', semi: false })

    assert.deepEqual(getMessages(formatted), [], formatted)
    assert.equal(fixSource(formatted), formatted)
  }
})
it('enforces the rule through the engine, editor, Vue, and math configurations', async () => {
  const workspaceRoot = path.resolve(__dirname, '../../..')
  const configuredLinter = createLinter({ cwd: workspaceRoot })
  const source = 'class State {\n value = 1\n\n count = 2\n static capacity = 3\n}'

  for (const fileName of [
    'packages/physics/components/body.ts',
    'packages/math/vector3.ts',
    'tooling/eslint/config/layout.cjs',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const [result] = await configuredLinter.lintText(input, { filePath: path.join(workspaceRoot, fileName) })

    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
    assert.deepEqual(
      result.messages.filter(({ ruleId }) => ruleId === ruleName).map(({ messageId }) => messageId),
      ['unexpectedBlankLine', 'expectedBlankLine'],
      fileName
    )
  }
})
