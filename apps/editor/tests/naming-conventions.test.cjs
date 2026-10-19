const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { createLinter } = require('./helpers/create-linter.cjs')
const { findInvalidBooleanNames } = require('../../../tooling/shaders/shader-names.cjs')

const workspaceRoot = path.resolve(__dirname, '../../..')
const linter = createLinter({ cwd: workspaceRoot })
const getNamingMessages = async (source, filePath) => {
  const [result] = await linter.lintText(source, { filePath: path.join(workspaceRoot, filePath) })

  assert.equal(
    result.messages.some((message) => message.fatal),
    false,
    JSON.stringify(result.messages)
  )

  return result.messages.filter((message) => message.ruleId === '@typescript-eslint/naming-convention')
}

it('checks Boolean variables, parameters, properties, and destructured should names', async () => {
  const messages = await getNamingMessages(
    `let shouldRender = true
     function update(enabled: boolean) {}
     interface Options { visible: boolean }
     class State { active = false; get ready(): boolean { return true } }
     const { shouldDraw } = { shouldDraw: true }`,
    'tests/unit/projector.test.ts'
  )

  for (const name of ['shouldRender', 'enabled', 'visible', 'active', 'ready', 'shouldDraw']) {
    assert.ok(
      messages.some((message) => message.message.includes(name)),
      name
    )
  }
})
it('accepts concise state predicates, decision methods, and documented external exceptions', async () => {
  const messages = await getNamingMessages(
    `let isBloomEnabled = true
     function update(areShadowsEnabled: boolean, depthMask: boolean) {}
     interface Options { isVisible: boolean; depthMask: boolean }
     class State { isActive = false; shouldWake() { return true } }
     let r = false`,
    'tests/unit/projector.test.ts'
  )

  assert.deepEqual(messages, [])
  assert.equal((await getNamingMessages('let shouldNormalize = true', 'packages/math/vector3.ts')).length, 1)
  assert.deepEqual(
    await getNamingMessages(
      'class Vector { static from() {} static of() {} get x() { return 0 } get xyz() { return [] } }',
      'packages/math/vector3.ts'
    ),
    []
  )
})
it('rejects should bindings in JavaScript, CommonJS, and ECMAScript modules', async () => {
  for (const filename of [
    'apps/editor/tooling/check.js',
    'apps/editor/tests/check.cjs',
    'apps/editor/tests/check.mjs'
  ]) {
    const messages = await getNamingMessages('const { shouldRender } = { shouldRender: true }', filename)

    assert.ok(
      messages.some((message) => message.message.includes('shouldRender')),
      filename
    )
  }
})
it('rejects explicit any in engine contracts', async () => {
  const [result] = await linter.lintText('export interface Options { payload: any }', {
    filePath: path.join(workspaceRoot, 'packages/formats/src/scene.ts')
  })

  assert.equal(result.messages.filter((message) => message.ruleId === '@typescript-eslint/no-explicit-any').length, 1)
})
it('rejects abbreviated frame rates and unnamed telemetry counts', async () => {
  const messages = await getNamingMessages(
    `interface Telemetry { fps: number | null; culled: number | null; rendered: number }
     const { fps } = { fps: 60 }
     function update(culled: number, submitted: number) {}`,
    'tests/unit/projector.test.ts'
  )

  for (const name of ['fps', 'culled', 'rendered', 'submitted']) {
    assert.ok(
      messages.some((message) => message.message.includes(name)),
      name
    )
  }

  assert.deepEqual(
    await getNamingMessages(
      `interface Telemetry { framesPerSecond: number | null; culledBodyCount: number | null }
     const overlayCategories = { culled: true }`,
      'tests/unit/projector.test.ts'
    ),
    []
  )
})
it('checks shader flags in uniforms, parameters, structs, and comma declarations', () => {
  assert.deepEqual(
    findInvalidBooleanNames(`
      // bool ignored;
      /* bool alsoIgnored; */
      uniform bool shouldUseShadows;
      struct Options { bool enabled; };
      bool findSurface(in bool visible) {
        bool isReady = check(true, false), shouldDraw = true, active[2];
        return isReady;
      }
      bool shouldWake();
    `),
    ['shouldUseShadows', 'enabled', 'visible', 'shouldDraw', 'active']
  )
  assert.deepEqual(findInvalidBooleanNames('uniform bool areShadowsEnabled; void main() { bool isReady = true; }'), [])
})
