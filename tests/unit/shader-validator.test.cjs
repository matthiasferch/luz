const { it } = require('node:test')
const assert = require('node:assert/strict')
const { mkdtempSync, rmSync, writeFileSync, chmodSync, statSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { prepareValidator, runValidator } = require('../../tooling/shaders/validator.cjs')

it(
  'makes a non-executable Unix validator runnable without changing its other permissions',
  {
    skip: process.platform === 'win32'
  },
  () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'luz-validator-'))
    const validatorPath = path.join(directory, 'validator')

    try {
      writeFileSync(validatorPath, '#!/bin/sh\nexit 0\n')
      chmodSync(validatorPath, 0o640)
      assert.throws(() => runValidator(validatorPath, [], 'test.pipeline.json'), /EACCES/)
      prepareValidator(validatorPath)
      assert.equal(statSync(validatorPath).mode & 0o777, 0o740)
      runValidator(validatorPath, [], 'test.pipeline.json')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  }
)
it('reports a missing validator as a launch error with the original cause', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'luz-validator-'))

  try {
    assert.throws(
      () => runValidator(path.join(directory, 'missing-validator'), [], 'test.pipeline.json'),
      (error) => {
        assert.match(error.message, /Cannot launch shader validator for 'test.pipeline.json'.*ENOENT/)
        assert.equal(error.cause.code, 'ENOENT')

        return true
      }
    )
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
it('includes compiler output and exit status in validation failures', () => {
  assert.throws(
    () =>
      runValidator(
        process.execPath,
        ['-e', "process.stdout.write('shader output\\n'); process.stderr.write('compiler error\\n'); process.exit(2)"],
        'test.pipeline.json'
      ),
    (error) => {
      assert.match(error.message, /Shader validation failed for 'test.pipeline.json' \(exit code 2\)/)
      assert.match(error.message, /shader output/)
      assert.match(error.message, /compiler error/)

      return true
    }
  )
})
it('accepts a successful validator process', () => {
  assert.doesNotThrow(() => runValidator(process.execPath, ['-e', 'process.exit(0)'], 'test.pipeline.json'))
})
