const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { ESLint, Linter } = require('eslint')
const prettier = require('prettier')
const parser = require('@typescript-eslint/parser')
const { rules } = require('eslint-plugin-luz')

const ruleName = 'luz/await-padding'
const linter = new Linter()
const configuration = {
  parser: 'typescript',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { [ruleName]: 'error' }
}
const sharedConfiguration = { ...configuration, rules: require('../../../eslint-layout.cjs') }

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

const getTokens = (source) =>
  parser.parse(source, { tokens: true, range: true }).tokens.map(({ type, value }) => ({ type, value }))

const fixSource = (source) => {
  const result = linter.verifyAndFix(source, sharedConfiguration)

  assert.deepEqual(result.messages, [])
  assert.equal(linter.verifyAndFix(result.output, sharedConfiguration).fixed, false)
  assert.deepEqual(getTokens(result.output), getTokens(source))

  return result.output
}

it('requires padding before standalone awaits, including consecutive awaits and top-level awaits', () => {
  const source = `async function update() {
  prepare()
  await load()
  await save()
  finish()
}`

  assert.equal(getMessages(source).length, 2)
  assert.equal(fixSource(source), source.replaceAll('\n  await', '\n\n  await'))
  assert.equal(fixSource('prepare();\nawait load();'), 'prepare();\n\nawait load();')
})
it('recognizes parenthesized, typed, void, and optional awaits without inspecting nested expressions', () => {
  for (const expression of [
    'await value',
    '(await load())',
    '(await load()) as Result',
    '(await load())!',
    '(await load()) satisfies Result',
    'void (await load())',
    'await service?.load?.()'
  ]) {
    const source = `async function update() { prepare();\n${expression}; }`

    assert.equal(getMessages(source).length, 1, expression)
    assert.equal(fixSource(source), source.replace('prepare();\n', 'prepare();\n\n'))
  }

  assert.deepEqual(getMessages('async function update() { prepare(); consume(await load()); }'), [])
  assert.deepEqual(getMessages('async function update() { prepare(); register(async () => await load()); }'), [])
})
it('does not add padding at file, block, or switch-case starts', () => {
  for (const source of [
    'await load();',
    '// Loading starts here.\nawait load();',
    'async function update() { await load(); }',
    'async function update() { if (isReady) { await load(); } }',
    'async function update() { try { await load(); } catch { await recover(); } finally { await finish(); } }',
    'async function update() { switch (value) { case 1: await load(); break; default: await save(); } }',
    'async function update() { for await (const value of values) { await save(value); } }'
  ]) {
    assert.deepEqual(getMessages(source), [])
    assert.equal(fixSource(source), source)
  }
})
it('checks await statements inside nested blocks and switch cases', () => {
  const source = `async function update() {
  if (isReady) { prepare(); await load(); }
  switch (value) { case 1: prepare(); await save(); break; }
}`

  assert.equal(getMessages(source).length, 2)
  assert.equal(getMessages(fixSource(source)).length, 0)
})
it('leaves awaits inside declarations, assignments, returns, and loop headers intact', () => {
  for (const source of [
    'async function update() { const value = 1; const result = await load(); }',
    'async function update() { value = 1; result = await load(); }',
    'async function update() { prepare(); return await load(); }',
    'async function update() { prepare(); if (await check()) { finish(); } }',
    'async function update() { for (let value = await load(); await check(); value++) { finish(); } }',
    'async function update() { prepare(); const create = async () => await load(); }'
  ]) {
    assert.deepEqual(getMessages(source), [])
  }

  assert.equal(
    fixSource('async function update() { prepare(); return await load(); }'),
    'async function update() { prepare();\n\n return await load(); }'
  )
})
it('preserves attached comments and requires a blank line outside multiline comments', () => {
  const source = 'async function update() { prepare(); // Prepared.\n// Load the state.\nawait load(); }'

  assert.equal(
    fixSource(source),
    'async function update() { prepare(); // Prepared.\n\n// Load the state.\nawait load(); }'
  )
  assert.equal(getMessages('async function update() { prepare(); /* note\n\nnote */\nawait load(); }').length, 1)

  for (const source of [
    'async function update() { prepare();\n\n// Load the state.\nawait load(); }',
    'async function update() { prepare();\n// Load the state.\n\nawait load(); }'
  ]) {
    assert.deepEqual(getMessages(source), [])
    assert.equal(fixSource(source), source)
  }
})
it('fixes same-line and CRLF sources and preserves padding before awaits within call groups', () => {
  assert.equal(fixSource(';await load();'), ';\n\nawait load();')
  assert.equal(fixSource('prepare(); await load(); await save();'), 'prepare();\n\n await load();\n\n await save();')
  assert.equal(fixSource('prepare();\r\nawait load();'), 'prepare();\r\n\r\nawait load();')
  assert.equal(
    fixSource('prepare();\n\nawait load();\n\nawait save();'),
    'prepare();\n\nawait load();\n\nawait save();'
  )
  assert.equal(fixSource('await load();\n\nfinish();'), 'await load();\nfinish();')
})
it('keeps combined layout fixes stable after Prettier moves protective semicolons', async () => {
  for (const source of [
    'prepare()\n;(await load())\nawait save()',
    'const value = 1\n;(await load())',
    'prepare();\nawait save();\nawait finish();',
    'prepare();\n(await load()) as Result;'
  ]) {
    const output = fixSource(source)
    const formatted = await prettier.format(output, { parser: 'typescript', semi: false })

    assert.deepEqual(linter.verify(formatted, sharedConfiguration), [], formatted)
    assert.equal(fixSource(formatted), formatted)
  }
})
it('enforces and fixes await padding in engine, math, editor, and Vue configurations', async () => {
  const workspaceRoot = path.resolve(__dirname, '../../..')
  const configuredLinter = new ESLint({ cwd: workspaceRoot })
  const configuredFixer = new ESLint({
    cwd: workspaceRoot,
    fix: ({ ruleId }) => Object.keys(sharedConfiguration.rules).includes(ruleId)
  })
  const source = 'async function update() { prepare();\nawait load();\nawait save(); }'

  for (const fileName of [
    'packages/physics/components/body.ts',
    'packages/math/vector3.ts',
    'eslint-layout.cjs',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const options = { filePath: path.join(workspaceRoot, fileName) }
    const [result] = await configuredLinter.lintText(input, options)

    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
    assert.equal(result.messages.filter(({ ruleId }) => ruleId === ruleName).length, 2, fileName)

    const [fixedResult] = await configuredFixer.lintText(input, options)

    assert.deepEqual(
      fixedResult.messages.filter(({ ruleId }) => Object.keys(sharedConfiguration.rules).includes(ruleId)),
      [],
      fileName
    )

    const [repeatedResult] = await configuredFixer.lintText(fixedResult.output, options)

    assert.equal(repeatedResult.output, undefined, fileName)
  }
})
