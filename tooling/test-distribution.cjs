const { cpSync, mkdtempSync, readFileSync, rmSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const { tmpdir } = require('node:os')
const path = require('node:path')

const workspace = path.resolve(__dirname, '..')
const fixture = mkdtempSync(path.join(tmpdir(), 'luz-consumer-'))

if (
  path.dirname(path.resolve(fixture)) !== path.resolve(tmpdir()) ||
  !path.basename(fixture).startsWith('luz-consumer-')
) {
  throw new Error('Unexpected consumer fixture directory')
}

function runScript(script, parameters, environment = process.env) {
  const result = spawnSync(process.execPath, [script, ...parameters], {
    cwd: fixture,
    env: environment,
    stdio: 'inherit',
    windowsHide: true
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`Consumer verification exited with ${result.status}`)
  }
}

try {
  const distribution = path.join(fixture, 'node_modules/luz')

  cpSync(path.join(workspace, 'dist'), distribution, { recursive: true })

  for (const filename of ['consumer.ts', 'tsconfig.json', 'package.json']) {
    cpSync(path.join(workspace, 'tests/fixtures/distribution', filename), path.join(fixture, filename))
  }

  const dependencyDirectory = path.dirname(require.resolve('reflect-metadata'))
  const dependency = JSON.parse(readFileSync(path.join(dependencyDirectory, 'package.json'), 'utf8'))

  for (const filename of ['LICENSE', 'CopyrightNotice.txt']) {
    const originalContents = readFileSync(path.join(dependencyDirectory, filename))
    const includedContents = readFileSync(
      path.join(distribution, 'licenses', dependency.name, dependency.version, filename)
    )

    if (!originalContents.equals(includedContents)) {
      throw new Error('Missing or modified dependency notice: ' + filename)
    }
  }

  runScript(require.resolve('typescript/bin/tsc'), ['-p', path.join(fixture, 'tsconfig.json')])
  runScript(require.resolve('typescript/bin/tsc'), [
    '-p',
    path.join(fixture, 'tsconfig.json'),
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext'
  ])
  runScript(path.join(fixture, 'dist/consumer.js'), [])
  console.log('Portable declarations and named ES module imports passed outside the workspace')

  if (process.argv.includes('--browser')) {
    for (const filename of ['distribution.html', 'engine-renderer.mjs']) {
      cpSync(path.join(workspace, 'tests/browser', filename), path.join(fixture, filename))
    }

    runScript(path.join(workspace, 'tests/browser/run.cjs'), ['distribution'], {
      ...process.env,
      LUZ_BROWSER_DIRECTORY: fixture
    })
  }
} finally {
  rmSync(fixture, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
