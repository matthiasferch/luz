const { it } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { Linter } = require('eslint')
const { createLinter } = require('./helpers/create-linter.cjs')
const prettier = require('prettier')

const rule = require('eslint-plugin-luz').rules['assignment-call-padding']
const {
  findMissingShaderPadding,
  findUnexpectedShaderPadding,
  validateShaderLayout
} = require('../../../tooling/shaders/shader-layout.cjs')

const ruleName = 'luz/assignment-call-padding'
const linter = new Linter()

linter.defineRule(ruleName, rule)
linter.defineParser('typescript', require('@typescript-eslint/parser'))

const configuration = {
  parser: 'typescript',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: { [ruleName]: 'error' }
}
const getMessages = (source) => {
  const messages = linter.verify(source, configuration)

  assert.equal(
    messages.some(({ fatal }) => fatal),
    false,
    JSON.stringify(messages)
  )

  return messages
}

const fixSource = (source) => {
  const result = linter.verifyAndFix(source, configuration)

  assert.deepEqual(result.messages, [])
  assert.equal(linter.verifyAndFix(result.output, configuration).fixed, false)

  return result.output
}

it('separates assignments, compound assignments, and updates from direct, optional, and awaited calls', () => {
  const source = `async function update() {
  value = calculate()
  state.value += 1
  count++
  apply()
  object?.apply?.()
  await save()
  value ||= calculate()
  ;[x, y] = position
  void persist()
  new Worker()
  tag\`value\`
  --count
}`

  assert.equal(getMessages(source).length, 4)
  assert.match(fixSource(source), /count\+\+\n\n {2}apply/)
  assert.match(fixSource(source), /await save\(\)\n\n {2}value/)
  assert.match(fixSource(source), /position\n\n {2}void persist/)
})
it('keeps same-kind statements together and treats calls on assignment right-hand sides as assignments', () => {
  assert.deepEqual(getMessages('value = calculate(); other = getOther(); value++; other *= 2;'), [])
  assert.deepEqual(getMessages('apply(value = 1); getObject().apply(); object?.save();'), [])
  assert.deepEqual(getMessages('value = 1;\n\napply();\n\nvalue = 2;'), [])
  assert.deepEqual(getMessages('first = 1, second = 2;\n\napply(), save();'), [])
  assert.equal(getMessages('first = 1, second = 2; apply(), save();').length, 1)
  assert.deepEqual(getMessages('value = 1; isReady && apply(); value = 2;'), [])
})
it('removes blank lines within assignment and call groups while preserving the boundary between them', () => {
  const source = 'value = calculate();\n\nvalue += 1;\n \n\ncount++;\n\napply();\n\nsave();'
  const messages = getMessages(source)

  assert.equal(messages.length, 3)
  assert.ok(messages.every(({ messageId }) => messageId === 'unexpectedBlankLine'))
  assert.equal(fixSource(source), 'value = calculate();\nvalue += 1;\ncount++;\n\napply();\nsave();')
  assert.equal(fixSource('  apply();\r\n \r\n\r\n  save();'), '  apply();\r\n  save();')
  assert.equal(fixSource('apply(`first\n\nsecond`);\n\nsave();'), 'apply(`first\n\nsecond`);\nsave();')
})
it('preserves group separation around comments and leaves declarations to the existing declaration rules', () => {
  for (const source of [
    'value = 1;\n\n// A separate step.\nvalue = 2;',
    'apply(); // A completed step.\n\nsave();',
    'apply();\n\n/* A separate step. */\n\nsave();',
    'const value = 1;\n\nconst other = 2;',
    'if (isReady) { apply(); }\n\nsave();'
  ]) {
    assert.deepEqual(getMessages(source), [])
    assert.equal(fixSource(source), source)
  }
})
it('preserves leading and trailing comments and requires a real blank line outside comments', () => {
  const source = 'value = 1; // assignment\n// call\napply();'

  assert.equal(fixSource(source), 'value = 1; // assignment\n\n// call\napply();')
  assert.deepEqual(getMessages('value = 1;\n\n// call\napply();'), [])
  assert.deepEqual(getMessages('value = 1;\n// call\n\napply();'), [])
  assert.equal(getMessages('value = 1; /* comment\n\ncomment */\napply();').length, 1)
  assert.equal(fixSource('value = 1; /* note */ apply();'), 'value = 1; /* note */\n\n apply();')
  assert.equal(fixSource('value = 1;\r\napply();'), 'value = 1;\r\n\r\napply();')
})
it('keeps ESLint fixes stable after Prettier moves protective semicolons', async () => {
  const source = 'apply()\n;[x, y] = position\nsave()'
  const output = fixSource(source)
  const formatted = await prettier.format(output, { parser: 'babel', semi: false })

  assert.deepEqual(getMessages(formatted), [])
  assert.match(formatted, /apply\(\)\n\n;\[x, y\]/)
  assert.deepEqual(getMessages('apply()\n\n;[x, y] = position'), [])

  const compactAssignments = fixSource('value = 1\n\n;[x, y] = position')
  const formattedAssignments = await prettier.format(compactAssignments, { parser: 'babel', semi: false })

  assert.deepEqual(getMessages(formattedAssignments), [])
  assert.equal(formattedAssignments, 'value = 1\n;[x, y] = position\n')
})
it('does not cross block boundaries, switch labels, or separate expressions within loop headers', () => {
  assert.deepEqual(
    getMessages(`value = 1;
    if (isReady) { apply(); }
    switch (value) { case 1: apply(); break; default: value = 0; }
    for (value = 0; check(); value++) { apply(); }
  `),
    []
  )
  assert.equal(getMessages('switch (value) { case 1: value = 2; apply(); break; }').length, 1)
  assert.equal(getMessages('class State { static { value = 1; apply(); } }').length, 1)
  assert.equal(getMessages('namespace State { value = 1; apply(); }').length, 1)
  assert.equal(getMessages('value = 1; (apply() as unknown); value = 2;').length, 2)
  assert.equal(getMessages('value = 1; apply()!;').length, 1)
})
it('loads the local plugin through engine, editor, Vue, and math ESLint configurations', async () => {
  const workspaceRoot = path.resolve(__dirname, '../../..')
  const configuredLinter = createLinter({ cwd: workspaceRoot })
  const source = 'function update() { value = 1; apply(); value++; save(); }'

  for (const fileName of [
    'tests/unit/projector.test.ts',
    'packages/math/vector3.ts',
    'tooling/eslint/config/layout.cjs',
    'apps/editor/tooling/check.js',
    'apps/editor/tooling/check.mjs',
    'apps/editor/src/editor/components/SimulationPanel.vue'
  ]) {
    const input = fileName.endsWith('.vue') ? `<script setup>\n${source}\n</script>` : source
    const [result] = await configuredLinter.lintText(input, { filePath: path.join(workspaceRoot, fileName) })

    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))
    assert.equal(result.messages.filter(({ ruleId }) => ruleId === ruleName).length, 3, fileName)

    const paddedSource = 'function update() { value = 1;\n\nvalue++;\n\nsave();\n\npersist(); }'
    const paddedInput = fileName.endsWith('.vue') ? `<script setup>\n${paddedSource}\n</script>` : paddedSource
    const [paddedResult] = await configuredLinter.lintText(paddedInput, {
      filePath: path.join(workspaceRoot, fileName)
    })

    assert.equal(
      paddedResult.messages.filter(
        ({ ruleId, messageId }) => ruleId === ruleName && messageId === 'unexpectedBlankLine'
      ).length,
      2,
      fileName
    )
  }
})
it('checks GLSL assignment/call transitions while ignoring calls nested in assignments or comparisons', () => {
  const source = `void main() {
  color = calculateColor();
  color.r += 1.0;
  count++;
  apply(color);
  save();
  color = calculateColor();
  ++count;
  apply(color = vec3(1.0));
}`

  assert.deepEqual(
    findMissingShaderPadding(source).map(({ line }) => line),
    [5, 7, 9]
  )
  assert.deepEqual(findMissingShaderPadding('void main() { color = calculateColor(); other = vec3(1.0); }'), [])
  assert.deepEqual(findMissingShaderPadding('void main() { apply(color = vec3(1.0)); save(); }'), [])
  assert.deepEqual(findMissingShaderPadding('void main() { color == other; apply(); color <= other; save(); }'), [])
  assert.deepEqual(findMissingShaderPadding('void main() { color = vec3(1.0); color + calculateColor(); }'), [])
  assert.deepEqual(findMissingShaderPadding('void main() { value + count++; apply(); }'), [])
  assert.deepEqual(findMissingShaderPadding('void main() { value = 1.0, apply(); save(); }'), [])
  assert.equal(findMissingShaderPadding('void main() { color[chooseIndex()] = vec3(1.0); apply(); }').length, 1)
  assert.equal(findMissingShaderPadding('void main() { count <<= 1; (apply()); }').length, 1)
})
it('rejects extra shader padding inside expression groups, preserving comments, directives, and declarations', () => {
  const source = 'void main() { value = calculate();\n\nvalue++;\n\napply();\n\nsave(); }'

  assert.equal(findUnexpectedShaderPadding(source).length, 2)
  assert.deepEqual(findMissingShaderPadding(source), [])
  assert.throws(() => validateShaderLayout(source, 'fixture.glsl'), /Unexpected empty line before 'value'/)

  for (const shader of [
    'void main() { value = 1.;\n\n// A separate step.\nvalue++; }',
    'void main() { apply(); /* A completed step. */\n\nsave(); }',
    'void main() { value = 1.;\n#ifdef ENABLED\n\nvalue++;\n#endif\n}',
    'void main() { float value;\n\nfloat other; }',
    'void main() { if (true) { apply(); }\n\nsave(); }'
  ]) {
    assert.deepEqual(findUnexpectedShaderPadding(shader), [])
  }
})
