const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { Linter } = require('eslint')
const { createLinter } = require('./helpers/create-linter.cjs')
const prettier = require('prettier')
const parser = require('@typescript-eslint/parser')
const { rules } = require('eslint-plugin-luz')

const ruleName = 'luz/decorator-padding'
const linter = new Linter()
const configuration = {
  parser: 'typescript',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { [ruleName]: 'error' }
}
const sharedConfiguration = { ...configuration, rules: require('../../../tooling/eslint/config/layout.cjs') }

for (const [name, rule] of Object.entries(rules)) {
  linter.defineRule(`luz/${name}`, rule)
}

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
  const result = linter.verifyAndFix(source, sharedConfiguration)

  assert.deepEqual(result.messages, [])
  assert.equal(linter.verifyAndFix(result.output, sharedConfiguration).fixed, false)
  assert.deepEqual(getTokens(result.output), getTokens(source))

  return result.output
}

it('requires padding before decorated fields, methods, and accessors regardless of field modifiers', () => {
  const source = `class State {
  value = 1
  @Serialize()
  count = 2
  @Track()
  update() {}
  @Uniform()
  get size() { return 0 }
  @Watch()
  set size(value) {}
  @Track()
  accessor result = 3
}`

  assert.equal(getMessages(source).length, 5)
  assert.equal(fixSource(source), source.replaceAll('\n  @', '\n\n  @'))
})
it('keeps stacked decorators together and gives decorator padding precedence over class-field grouping', () => {
  const source = `class State {
  @Uniform()
  @Serialize()
  value = 1
  @Uniform()
  @Serialize()
  count = 2
  @Uniform()
  @Serialize()
  readonly capacity = 3
}`

  assert.equal(getMessages(source).length, 2)
  assert.equal(
    fixSource(source),
    source.replace('value = 1\n', 'value = 1\n\n').replace('count = 2\n', 'count = 2\n\n')
  )
  assert.deepEqual(getMessages('class State {\n  @Uniform()\n  @Serialize()\n  value = 1\n}'), [])
})
it('requires padding after decorated properties before any following class member', () => {
  for (const member of [
    'count = 2',
    'readonly capacity = 3',
    'update() {}',
    'get size() { return 0 }',
    'static {}',
    'constructor() {}'
  ]) {
    const source = `class State {\n  @Serialize()\n  value = 1\n  ${member}\n}`

    assert.equal(getMessages(source)[0].messageId, 'expectedAfterProperty')
    assert.equal(fixSource(source), source.replace('value = 1\n', 'value = 1\n\n'))
  }
})
it('pads after decorated abstract and auto-accessor properties but not after their last member', () => {
  for (const property of ['abstract value: number', 'accessor value = 1', 'abstract accessor value: number']) {
    const source = `abstract class State {\n  @Track()\n  ${property}\n  count = 2\n}`

    assert.equal(getMessages(source).length, 1)
    assert.equal(fixSource(source), source.replace(`${property}\n`, `${property}\n\n`))
    assert.equal(
      fixSource(`abstract class State { @Track() ${property}\n}`),
      `abstract class State { @Track() ${property}\n}`
    )
  }
})
it('preserves comments after decorated properties and fixes same-line and CRLF boundaries', () => {
  const source = 'class State { @Serialize() value = 1; // Stored value.\n/** Count. */\ncount = 2 }'

  assert.equal(fixSource(source), source.replace('// Stored value.\n', '// Stored value.\n\n'))
  assert.equal(
    fixSource('class State { @Serialize() value = 1; count = 2 }'),
    'class State { @Serialize() value = 1;\n\n count = 2 }'
  )
  assert.equal(
    fixSource('class State { @Serialize() value = 1;\r\ncount = 2 }'),
    'class State { @Serialize() value = 1;\r\n\r\ncount = 2 }'
  )
  assert.equal(
    fixSource('class State { @Serialize() value = 1\n// Last property.\n}'),
    'class State { @Serialize() value = 1\n// Last property.\n}'
  )
})
it('handles class declarations and both placements of decorators around export keywords', () => {
  for (const declaration of [
    '@Register() class State {}',
    '@Register() export class State {}',
    'export @Register() class State {}',
    '@Register() export default class State {}',
    'export default @Register() class State {}'
  ]) {
    assert.equal(getMessages(`prepare();\n${declaration}`).length, 1)
    assert.equal(fixSource(`prepare();\n${declaration}`), `prepare();\n\n${declaration}`)
    assert.deepEqual(getMessages(declaration), [])
  }
})
it('checks sibling declarations within blocks, namespaces, switch cases, and static blocks', () => {
  for (const source of [
    'function create() { prepare();\n@Register() class State {} }',
    'namespace Engine { prepare();\n@Register() export class State {} }',
    'class Owner { static { prepare();\n@Register() class State {} } }',
    'switch (value) { case 1: prepare();\n@Register() class State {} }'
  ]) {
    assert.equal(getMessages(source).length, 1)
    assert.equal(fixSource(source), source.replace('prepare();\n', 'prepare();\n\n'))
  }
})
it('preserves trailing and attached leading comments and ignores blank lines within comments', () => {
  const source = 'class State { value = 1; // Stored value.\n/** Serialized count. */\n@Serialize() count = 2 }'

  assert.equal(
    fixSource(source),
    'class State { value = 1; // Stored value.\n\n/** Serialized count. */\n@Serialize() count = 2 }'
  )
  assert.equal(getMessages('prepare(); /* detail\n\ndetail */\n@Register() class State {}').length, 1)

  for (const paddedSource of [
    'class State { value = 1;\n\n/** Serialized count. */\n@Serialize() count = 2 }',
    'class State { value = 1;\n/** Serialized count. */\n\n@Serialize() count = 2 }',
    'prepare(); // Completed step.\n\n@Register() class State {}'
  ]) {
    assert.deepEqual(getMessages(paddedSource), [])
    assert.equal(fixSource(paddedSource), paddedSource)
  }
})
it('does not pad file or block starts, parameter decorators, or decorators inside expressions', () => {
  for (const source of [
    '@Register() class State {}',
    '/** Stored state. */\n@Register() class State {}',
    'class State {\n/** Serialized value. */\n@Serialize() value = 1\n}',
    'function create() { @Register() class State {} }',
    'namespace Engine { @Register() export class State {} }',
    'class Owner { static { @Register() class State {} } }',
    'switch (value) { case 1: prepare(); break; case 2: @Register() class State {} }',
    'class State { constructor(@Inject() value: number) {} }',
    'const State = @Register() class {}'
  ]) {
    assert.deepEqual(getMessages(source), [])
    assert.equal(fixSource(source), source)
  }
})
it('supports same-line declarations and CRLF without changing tokens or decorator arguments', () => {
  assert.equal(
    fixSource('class State { value = 1; @Serialize() count = 2 }'),
    'class State { value = 1;\n\n @Serialize() count = 2 }'
  )
  assert.equal(
    fixSource('class State { value = 1;\r\n@Serialize() count = 2 }'),
    'class State { value = 1;\r\n\r\n@Serialize() count = 2 }'
  )

  const source = 'class State { value = 1;\n@Label(`first\n\nsecond`) count = 2 }'

  assert.equal(fixSource(source), source.replace('value = 1;\n', 'value = 1;\n\n'))
})
it('keeps combined layout fixes stable after Prettier formats decorated members and exports', async () => {
  for (const source of [
    'class State { readonly value = 1\n @Uniform() @Serialize() count = 2 }',
    'class State { value = 1\n\n @Serialize() count = 2 }',
    'class State { value = 1\n @Serialize() count = 2\n\n other = 3 }',
    'class State { value = calculate()\n;@Serialize() [key] = 2 }',
    'class State { @Serialize() value = calculate()\n;[key] = 2 }',
    'prepare();\nexport @Register() class State {}',
    'class State {}\n@Register() export default class Owner {}'
  ]) {
    const output = fixSource(source)
    const formatted = await prettier.format(output, { parser: 'typescript', semi: false })

    assert.deepEqual(linter.verify(formatted, sharedConfiguration), [], formatted)
    assert.equal(fixSource(formatted), formatted)
  }
})
it('loads and fixes decorator padding through the engine, editor, Vue, and math configurations', async () => {
  const workspaceRoot = path.resolve(__dirname, '../../..')
  const configuredLinter = createLinter({ cwd: workspaceRoot })
  const configuredFixer = createLinter({
    cwd: workspaceRoot,
    fix: ({ ruleId }) => Object.keys(sharedConfiguration.rules).includes(ruleId)
  })
  const source = 'class State {\n value = 1\n @Serialize() count = 2\n @Serialize() readonly capacity = 3\n}'

  for (const fileName of [
    'packages/physics/components/body.ts',
    'packages/math/vector3.ts',
    'tooling/eslint/config/layout.cjs',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup lang="ts">\n${source}\n</script>` : source
    const options = { filePath: path.join(workspaceRoot, fileName) }
    const [result] = await configuredLinter.lintText(input, options)

    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
    assert.equal(result.messages.filter(({ ruleId }) => ruleId === ruleName).length, 2, fileName)

    const [fixedResult] = await configuredFixer.lintText(input, options)

    assert.equal(fixedResult.fatalErrorCount, 0, JSON.stringify(fixedResult.messages))
    assert.deepEqual(
      fixedResult.messages.filter(({ ruleId }) => Object.keys(sharedConfiguration.rules).includes(ruleId)),
      [],
      fileName
    )

    const [repeatedResult] = await configuredFixer.lintText(fixedResult.output, options)

    assert.equal(repeatedResult.output, undefined, fileName)
  }
})
