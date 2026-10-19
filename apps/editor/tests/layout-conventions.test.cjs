const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { createLinter } = require('./helpers/create-linter.cjs')
const {
  findMissingShaderPadding,
  findUnbracedShaderBodies,
  validateShaderLayout
} = require('../../../tooling/shaders/shader-layout.cjs')

const workspaceRoot = path.resolve(__dirname, '../../..')
const linter = createLinter({ cwd: workspaceRoot })
const fixer = createLinter({
  cwd: workspaceRoot,
  fix: ({ ruleId }) => ['curly', 'padding-line-between-statements', 'luz/assignment-call-padding'].includes(ruleId)
})
const getPaddingMessages = (result) => {
  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))

  return result.messages.filter((message) => message.ruleId === 'padding-line-between-statements')
}

const unpaddedFunction = `function calculate(isReady) {
  let value = 0
  if (isReady) value++
  for (let index = 0; index < 2; index++) value++
  for (const key in {}) value++
  for (const item of []) value++
  while (isReady) break
  switch (value) { default: break }
  try { value++ } catch { value-- } finally { value++ }
  return value
}`

it('enforces and fixes all six statement types across both ESLint configurations', async () => {
  for (const fileName of [
    'tests/unit/projector.test.ts',
    'tooling/eslint/config/layout.cjs',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const source = fileName.endsWith('.vue') ? `<script setup>\n${unpaddedFunction}\n</script>` : unpaddedFunction
    const options = { filePath: path.join(workspaceRoot, fileName) }
    const [result] = await linter.lintText(source, options)

    assert.equal(getPaddingMessages(result).length, 8, fileName)

    const [fixedResult] = await fixer.lintText(source, options)

    assert.deepEqual(getPaddingMessages(fixedResult), [], fileName)
    assert.match(fixedResult.output, /value = 0\n\n {2}if/)
    assert.match(fixedResult.output, /\n\n {2}return value/)

    const [repeatedResult] = await fixer.lintText(fixedResult.output, options)

    assert.equal(repeatedResult.output, undefined, fileName)
  }
})
it('does not pad block starts, unbraced bodies, branch continuations, or trailing do/while conditions', async () => {
  const source = `function calculate(isReady) {
    if (isReady) return 1
    else if (isReady) return 2
    else return 3

    do { if (isReady) break } while (isReady)

    switch (isReady) {
      case true: return 1
      default: return 0
    }

    try { return 1 } catch { return 2 } finally { return 3 }
  }`
  const [result] = await linter.lintText(source, {
    filePath: path.join(workspaceRoot, 'tooling/eslint/config/layout.cjs')
  })

  assert.deepEqual(getPaddingMessages(result), [])
})
it('requires actual empty lines around comments and inside switch cases', async () => {
  const source = `function calculate(value) {
    value++
    // A comment alone is not padding.
    if (value) value++

    // Padding before an attached comment is sufficient.
    switch (value) {
      case 1:
        value++
        return value
      default: return 0
    }
  }`
  const [result] = await linter.lintText(source, {
    filePath: path.join(workspaceRoot, 'tooling/eslint/config/layout.cjs')
  })

  assert.equal(getPaddingMessages(result).length, 2)
})
it('applies spacing and naming checks to math code', async () => {
  const [result] = await linter.lintText('function update() { const tmp = 1; return tmp }', {
    filePath: path.join(workspaceRoot, 'packages/math/vector3.ts')
  })

  assert.equal(getPaddingMessages(result).length, 1)
  assert.equal(
    result.messages.some((message) => message.ruleId === '@typescript-eslint/naming-convention'),
    true
  )
})
it('checks sibling shader statements without confusing loop headers or nested expressions', () => {
  const source = `float calculate(bool isReady) {
  float value = 0.0;
  if (isReady) value++;
  for (int index = 0; index < 2; index++) value++;
  while (isReady) break;
  switch (int(value)) {
    case 0: value++;
    return value;
    default: return 0.0;
  }
  return value;
}`
  const violations = findMissingShaderPadding(source)

  assert.deepEqual(
    violations.map(({ keyword }) => keyword),
    ['if', 'for', 'while', 'switch', 'return', 'return']
  )
  assert.deepEqual(
    violations.map(({ line }) => line),
    [3, 4, 5, 6, 8, 11]
  )
  assert.throws(
    () => validateShaderLayout(source, 'fixture.glsl'),
    /fixture\.glsl:3: Expected an empty line before 'if'/
  )
})
it('does not insert padding at shader block starts, before branch bodies, or before do/while tails', () => {
  const source = `void main() {
  if (true) return;
  else if (false) return;
  else return;

  do { if (true) break; } while (false);

  for (int index = 0; index < 2; index++)
    if (true) return;

  switch (1) {
    case true ? 1 : 2: return;
    case 3:
    default: return;
  }
}`

  assert.deepEqual(findMissingShaderPadding(source), [])
})
it('ignores shader comments and preprocessor directives without counting them as padding', () => {
  const source = `#define CHECK(value) if (value) return
void main() {
  float value = 0.0;
  /* if (true) return;

     A blank line inside a comment is not padding. */
  if (true) value++;

  // This comment has padding before it.
  return;
}`

  assert.deepEqual(
    findMissingShaderPadding(source).map(({ keyword }) => keyword),
    ['if']
  )
  assert.deepEqual(
    findMissingShaderPadding(source.replaceAll('\n', '\r\n')).map(({ keyword }) => keyword),
    ['if']
  )
  assert.deepEqual(
    findMissingShaderPadding('#define CHECK(value) \\\n  if (value) return;\nvoid main() { return; }'),
    []
  )
})
it('checks same-line statements and nested shader blocks', () => {
  assert.equal(
    findMissingShaderPadding('void main() { float value; if (true) { value++; return; } return; }').length,
    3
  )
  assert.deepEqual(findMissingShaderPadding('void main() { if (true) { return; } }'), [])
  assert.equal(findMissingShaderPadding('void main() { float values[2] = float[2](1., 2.); return; }').length, 1)
})
it('requires braces for every branch and loop body, including empty bodies', async () => {
  const source = `function calculate(isReady) {
    if (isReady) return 1
    else if (isReady) return 2
    else return 3
    for (;;) break
    for (const key in {}) continue
    for (const item of []) continue
    while (isReady);
    do isReady = false; while (isReady)
  }`

  for (const fileName of [
    'tooling/eslint/config/layout.cjs',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const options = { filePath: path.join(workspaceRoot, fileName) }
    const [result] = await linter.lintText(input, options)

    assert.equal(result.messages.filter(({ ruleId }) => ruleId === 'curly').length, 8, fileName)

    const [fixedResult] = await fixer.lintText(input, options)

    assert.equal(
      fixedResult.messages.some(({ ruleId }) => ['curly', 'padding-line-between-statements'].includes(ruleId)),
      false
    )
    assert.match(fixedResult.output, /else if/)

    const [repeatedResult] = await fixer.lintText(fixedResult.output, options)

    assert.equal(repeatedResult.output, undefined)
  }
})
it('separates declaration groups without splitting declarations of the same kind or loop headers', async () => {
  const source = `function calculate() {
    run()
    const value = 1
    const otherValue = 2
    let total = value
    let count = otherValue
    var legacyValue = total
    var otherLegacyValue = count
    run()
    for (let index = 0; index < 2; index++) { run() }
  }`

  for (const fileName of [
    'tests/unit/projector.test.ts',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const options = { filePath: path.join(workspaceRoot, fileName) }
    const [result] = await linter.lintText(input, options)

    assert.deepEqual(
      getPaddingMessages(result).map(({ line }) => line),
      fileName.endsWith('.vue') ? [4, 6, 8, 10, 11] : [3, 5, 7, 9, 10]
    )

    const [fixedResult] = await fixer.lintText(input, options)

    assert.deepEqual(getPaddingMessages(fixedResult), [])
    assert.match(fixedResult.output, /const value = 1\n {4}const otherValue/)
    assert.match(fixedResult.output, /otherValue = 2\n\n {4}let total/)
    assert.match(fixedResult.output, /let index = 0; index < 2; index\+\+/)
  }
})
it('checks shader braces while keeping else-if chains and trailing do/while conditions intact', () => {
  const source = `void main() {
    if (true) discard;
    else if (false) return;
    else discard;
    for (int index = 0; index < 2; index++) continue;
    while (false);
    do continue; while (false);
  }`

  assert.deepEqual(
    findUnbracedShaderBodies(source).map(({ keyword }) => keyword),
    ['if', 'if', 'else', 'for', 'while', 'do']
  )
  assert.throws(
    () => validateShaderLayout('void main() { if (true) discard; }', 'fixture.glsl'),
    /fixture.glsl:1: Expected braces around 'if' body/
  )
  assert.deepEqual(
    findUnbracedShaderBodies(`void main() {
    if (true) {} else if (false) {} else {}
    for (int index = 0; index < 2; index++) {}
    while (false) {}
    do {} while (false);
  }`),
    []
  )
})
it('groups GLSL constants, uniforms, inputs, outputs, and typed local declarations', () => {
  const source = `uniform sampler2D colorTexture;
uniform vec3 color;
const float scale = 1.0;
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
out vec3 worldPosition;
void main() {
  float value = 0.0;
  highp vec3 direction = vec3(1.0);
  value++;
  const float weight = 1.0;
  const float offset = 0.0;
  value++;
  MaterialSample sample;
  float[2] values = float[2](1.0, 2.0);
  value++;
}`

  assert.deepEqual(
    findMissingShaderPadding(source).map(({ line }) => line),
    [3, 4, 6, 7, 10, 11, 13, 14, 16]
  )
  assert.deepEqual(findMissingShaderPadding('void main() { color.r = 1.0;\n\ncalculate(color); vec3(1.0); }'), [])
})
it('separates completed control-flow blocks from following assignments and calls', async () => {
  const blocks = [
    'if (isReady) { value++ } else if (isWaiting) { value-- } else { value = 0 }',
    'for (const item of items) { update(item) }',
    'while (isReady) { break }',
    'do { value++ } while (isReady)',
    'switch (value) { default: break }',
    'try { update() } catch { recover() } finally { finish() }'
  ]
  const source = `function update() {\n${blocks.map((block) => `  ${block}\n  value = 0`).join('\n\n')}\n}`

  for (const fileName of [
    'tests/unit/projector.test.ts',
    'apps/editor/tooling/check.cjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const options = { filePath: path.join(workspaceRoot, fileName) }
    const [result] = await linter.lintText(input, options)

    assert.equal(getPaddingMessages(result).length, blocks.length, fileName)

    const [fixedResult] = await fixer.lintText(input, options)

    assert.deepEqual(getPaddingMessages(fixedResult), [])
    assert.match(fixedResult.output, /else \{ value = 0 \}\n\n {2}value = 0/)
  }
})
it('requires shader padding after complete branches and loops without splitting their continuations', () => {
  const blocks = [
    'if (true) {} else if (false) {} else {}',
    'for (int index = 0; index < 2; index++) {}',
    'while (false) {}',
    'do {} while (false);',
    'switch (1) { default: break; }'
  ]
  const source = `void main() {\n${blocks.map((block) => `  ${block}\n  value = 0.0;`).join('\n\n')}\n}`

  assert.equal(findMissingShaderPadding(source).length, blocks.length)
  assert.deepEqual(findMissingShaderPadding(source.replaceAll('\n  value', '\n\n  value')), [])
  assert.deepEqual(findMissingShaderPadding('void main() { if (true) {} else {} }'), [])
})
