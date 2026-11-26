const { it } = require('node:test')
const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')
const { FileEnumerator } = require('eslint/use-at-your-own-risk')
const { HtmlValidate } = require('html-validate')

const workspaceRoot = path.resolve(__dirname, '../..')

it('includes every repository JavaScript, TypeScript, and Vue file in the lint commands', () => {
  const includedFiles = new Set()

  for (const directory of ['']) {
    const workingDirectory = path.join(workspaceRoot, directory)
    const command = require(path.join(workingDirectory, 'package.json')).scripts.lint.split(' && ')[0]
    const argumentsList = command
      .match(/"[^"]+"|\S+/g)
      .slice(1)
      .map((argument) => argument.replace(/^"|"$/g, ''))
    const patterns = argumentsList.slice(0, argumentsList.indexOf('--ext'))
    const extensions = argumentsList[argumentsList.indexOf('--ext') + 1].split(',')
    const enumerator = new FileEnumerator({ cwd: workingDirectory, extensions })

    for (const { filePath } of enumerator.iterateFiles(patterns)) {
      includedFiles.add(path.resolve(filePath))
    }
  }

  const sourceFiles = execFileSync(
    'git',
    ['-c', 'core.fsmonitor=false', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    {
      cwd: workspaceRoot,
      encoding: 'utf8',
      windowsHide: true
    }
  )
    .split('\0')
    .filter((file) => /\.(?:[cm]?[jt]s|vue)$/.test(file) && existsSync(path.join(workspaceRoot, file)))

  assert.deepEqual(
    sourceFiles.filter((file) => !includedFiles.has(path.resolve(workspaceRoot, file))),
    []
  )
})
it('validates HTML structure and accessibility', async () => {
  const validator = new HtmlValidate(require('../../.htmlvalidate.json'))
  const result = await validator.validateString('<!doctype html><html><body><img src="image.png" /></body></html>')

  assert.equal(result.valid, false)
  assert.ok(result.results[0].messages.some(({ ruleId }) => ruleId === 'wcag/h37'))
  assert.ok(result.results[0].messages.some(({ ruleId }) => ruleId === 'element-required-attributes'))
})
