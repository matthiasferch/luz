const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const webpack = require('webpack')
const { createLicensePlugin } = require('../../tooling/dependency-licenses.cjs')

function createFixture(context, name = '@fixture/example', version = '1.0.0') {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'luz-license-test-'))

  if (
    path.dirname(directory) !== path.resolve(os.tmpdir()) ||
    !path.basename(directory).startsWith('luz-license-test-')
  ) {
    throw new Error('Unexpected license fixture directory')
  }

  context.after(() => fs.rmSync(directory, { recursive: true, force: true }))

  const dependencyDirectory = path.join(directory, 'node_modules', name)

  fs.mkdirSync(dependencyDirectory, { recursive: true })
  fs.writeFileSync(path.join(directory, 'index.js'), 'module.exports = require(' + JSON.stringify(name) + ')')
  fs.writeFileSync(path.join(dependencyDirectory, 'index.js'), 'module.exports = 42')
  fs.writeFileSync(path.join(dependencyDirectory, 'package.json'), JSON.stringify({ name, version, license: 'MIT' }))

  return { directory, dependencyDirectory }
}

function buildFixture(directory) {
  return new Promise((resolve, reject) => {
    const compiler = webpack({
      mode: 'production',
      context: directory,
      entry: './index.js',
      output: { path: path.join(directory, 'dist') },
      plugins: [createLicensePlugin()]
    })

    compiler.run((error, statistics) => {
      compiler.close((closeError) => {
        if (error || closeError) {
          reject(error ?? closeError)
        } else if (statistics.hasErrors()) {
          reject(new Error(statistics.toString({ all: false, errors: true })))
        } else {
          resolve()
        }
      })
    })
  })
}

test('preserves complete licenses and notices for scoped bundled dependencies', async (context) => {
  const { directory, dependencyDirectory } = createFixture(context)
  const files = { LICENSE: 'License terms\r\n', NOTICE: 'Attribution\n', 'CopyrightNotice.txt': 'Copyright notice\n' }

  for (const [name, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(dependencyDirectory, name), contents)
  }

  await buildFixture(directory)

  for (const [name, contents] of Object.entries(files)) {
    assert.equal(fs.readFileSync(path.join(directory, 'dist/licenses/@fixture/example/1.0.0', name), 'utf8'), contents)
  }
})
test('fails builds when a bundled dependency has no license text', async (context) => {
  const { directory } = createFixture(context)

  await assert.rejects(buildFixture(directory), /No license file found for bundled dependency @fixture\/example/)
})
test('uses reviewed fallbacks only for their exact package version', async (context) => {
  const reviewedFixture = createFixture(context, 'vdirs', '0.1.8')
  const unreviewedFixture = createFixture(context, 'vdirs', '0.1.9')

  await buildFixture(reviewedFixture.directory)

  for (const name of ['LICENSE', 'NOTICE']) {
    assert.deepEqual(
      fs.readFileSync(path.join(reviewedFixture.directory, 'dist/licenses/vdirs/0.1.8', name)),
      fs.readFileSync(path.join(__dirname, '../../tooling/licenses/vdirs-0.1.8', name))
    )
  }

  await assert.rejects(buildFixture(unreviewedFixture.directory), /No license file found for bundled dependency vdirs/)
})
