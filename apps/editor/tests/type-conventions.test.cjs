const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { ESLint } = require('eslint')
const typeRules = require('../../../tooling/eslint/config/types.cjs')

const workspaceRoot = path.resolve(__dirname, '../../..')
const linter = new ESLint({ cwd: workspaceRoot })
const fixingLinter = new ESLint({ cwd: workspaceRoot, fix: true })
const getTypeMessages = async (source, fileName = 'packages/core/transform.ts') => {
  const [result] = await linter.lintText(source, { filePath: path.join(workspaceRoot, fileName) })

  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))

  return result.messages.filter(({ ruleId }) => ruleId in typeRules)
}

it('requires interfaces for object contracts in engine and editor TypeScript', async () => {
  for (const fileName of ['packages/core/transform.ts', 'apps/editor/src/settings.ts']) {
    const messages = await getTypeMessages('export type Options = { amount: number }', fileName)

    assert.equal(messages.length, 1)
    assert.equal(messages[0].ruleId, '@typescript-eslint/consistent-type-definitions')
  }
})
it('preserves aliases for unions, tuples, callable signatures, and composed types', async () => {
  const messages = await getTypeMessages(`
    export interface Options { amount: number }
    export type Mode = 'loop' | 'once'
    export type Pair = [number, number]
    export type Reader = () => unknown
    export type VisibleOptions = Options & { isVisible: boolean }
    export type PartialOptions = { [Key in keyof Options]?: Options[Key] }
  `)

  assert.deepEqual(messages, [])
})
it('requires type-only imports and exports and can fix both', async () => {
  const source = `import { Tuple3 } from '@luz/formats'
export { Tuple4 } from '@luz/formats'
export interface Options { position: Tuple3 }
`
  const messages = await getTypeMessages(source)
  const [result] = await fixingLinter.lintText(source, {
    filePath: path.join(workspaceRoot, 'packages/core/transform.ts')
  })

  assert.deepEqual(messages.map(({ ruleId }) => ruleId).sort(), [
    '@typescript-eslint/consistent-type-exports',
    '@typescript-eslint/consistent-type-imports'
  ])
  assert.match(result.output, /import type \{ Tuple3 \}/)
  assert.match(result.output, /export type \{ Tuple4 \}/)
  assert.deepEqual(await getTypeMessages(result.output), [])
})
it('preserves value imports used by emitted decorator metadata', async () => {
  const source = `import { Vector3 } from '@luz/math'
import { Serialize } from '@luz/serialization'
export class Pose {
  @Serialize()
  position!: Vector3
}
`
  const [result] = await fixingLinter.lintText(source, {
    filePath: path.join(workspaceRoot, 'packages/core/transform.ts')
  })

  assert.deepEqual(await getTypeMessages(source), [])
  assert.match(result.output ?? source, /import \{ Vector3 \}/)
  assert.doesNotMatch(result.output ?? source, /import type \{ Vector3 \}/)
})
it('allows import type annotations without changing ambient declarations into modules', async () => {
  assert.deepEqual(
    await getTypeMessages(
      "declare const __EDITOR_SCENES__: import('./editor/scene-catalog').SceneDescriptor[]",
      'apps/editor/src/vue.d.ts'
    ),
    []
  )
})
