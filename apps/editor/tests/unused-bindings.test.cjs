const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { createLinter } = require('./helpers/create-linter.cjs')

const workspaceRoot = path.resolve(__dirname, '../../..')
const linter = createLinter({ cwd: workspaceRoot })
const ruleName = '@typescript-eslint/no-unused-vars'
const getUnusedMessages = async (source, fileName = 'tooling/eslint/config/unused.cjs') => {
  const [result] = await linter.lintText(source, { filePath: path.join(workspaceRoot, fileName) })

  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
  assert.equal(
    result.messages.some(({ ruleId }) => ruleId === 'no-unused-vars'),
    false
  )

  return result.messages.filter(({ ruleId }) => ruleId === ruleName)
}

it('rejects unused locals, parameters, and catch bindings across every supported script configuration', async () => {
  const source = `const unusedVariable = 1
const _unusedVariable = 2
function calculate(unusedArgument, _reservedArgument) {
  const unusedLocal = 3
  return 1
}
calculate()
try { calculate() } catch (unusedError) { calculate() }
`

  for (const fileName of [
    'packages/physics/components/body.ts',
    'packages/math/vector3.ts',
    'tooling/eslint/config/unused.cjs',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.cjs',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const messages = await getUnusedMessages(input, fileName)

    assert.deepEqual(
      messages.map(({ message }) => message.match(/^'([^']+)'/)[1]),
      ['unusedVariable', '_unusedVariable', 'unusedArgument', 'unusedLocal', 'unusedError'],
      fileName
    )
  }
})
it('rejects unused imports and functions while recognizing exported declarations', async () => {
  const source = `import { Serializable, Register } from '@luz/serialization'
function calculateUnused() { return 1 }
export class State extends Serializable {}
`
  const messages = await getUnusedMessages(source, 'packages/physics/components/body.ts')

  assert.deepEqual(
    messages.map(({ message }) => message.match(/^'([^']+)'/)[1]),
    ['Register', 'calculateUnused']
  )
})
it('does not exempt underscore-prefixed locals, destructured bindings, or caught errors', async () => {
  const source = `const { value: _value } = source
const [_entry] = entries
try { apply() } catch (_error) { recover() }
`
  const messages = await getUnusedMessages(source)

  assert.deepEqual(
    messages.map(({ message }) => message.match(/^'([^']+)'/)[1]),
    ['_value', '_entry', '_error']
  )
})
it('allows explicit unused parameter placeholders, used parameters, and omitted catch bindings', async () => {
  const source = `const getIndices = (values) => values.map((_value, index) => index)
function apply(_context, value) { return value }
module.exports = { getIndices, apply }
try { apply(null, 1) } catch { console.error('Failed') }
`

  assert.deepEqual(await getUnusedMessages(source), [])
})
it('recognizes template-only references in Vue script setup', async () => {
  const source = `<script setup lang="ts">
const label = 'Ready'
const onChange = () => console.log(label)
const unusedValue = 1
</script>
<template><button @click="onChange">{{ label }}</button></template>`
  const messages = await getUnusedMessages(source, 'apps/editor/src/editor/components/SimulationPanel.vue')

  assert.deepEqual(
    messages.map(({ message }) => message.match(/^'([^']+)'/)[1]),
    ['unusedValue']
  )
})
it('recognizes type-only imports and declarations in TypeScript', async () => {
  const source = `import type { Transform } from '@luz/core'
export interface Handler { update(transform: Transform): void }
`

  assert.deepEqual(await getUnusedMessages(source, 'packages/physics/components/body.ts'), [])
})
