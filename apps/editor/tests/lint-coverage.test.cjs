const { it } = require('node:test')
const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')
const { ESLint } = require('eslint')
const { FileEnumerator } = require('eslint/use-at-your-own-risk')
const { HtmlValidate } = require('html-validate')

const workspaceRoot = path.resolve(__dirname, '../../..')
const linter = new ESLint({ cwd: workspaceRoot })

it('includes every repository JavaScript, TypeScript, and Vue file in the lint commands', () => {
  const includedFiles = new Set()

  for (const directory of ['', 'apps/editor']) {
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
it('checks Vue Boolean naming, object contracts, and type-only imports', async () => {
  const [result] = await linter.lintText(
    `<script setup lang="ts">
import { Tuple3 } from '@luz/formats'
type Options = { visible: boolean; position: Tuple3 }
const enabled = true
defineProps<Options>()
</script>
<template><div v-if="enabled" /></template>`,
    {
      filePath: path.join(workspaceRoot, 'apps/editor/src/editor/components/SettingCheckbox.vue')
    }
  )

  assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages))

  for (const rule of ['naming-convention', 'consistent-type-definitions', 'consistent-type-imports']) {
    assert.ok(
      result.messages.some(({ ruleId }) => ruleId === `@typescript-eslint/${rule}`),
      rule
    )
  }

  assert.ok(result.messages.some(({ message }) => message.includes('enabled')))
  assert.ok(result.messages.some(({ message }) => message.includes('visible')))
})
it('detects invalid CSS in stylesheets and Vue style blocks while accepting Vue selectors', async () => {
  const { default: stylelint } = await import('stylelint')

  for (const extension of ['css', 'vue']) {
    const stylesheet = '.panel { colr: red; }'
    const result = await stylelint.lint({
      code: extension === 'vue' ? `<style scoped>${stylesheet}</style>` : stylesheet,
      codeFilename: path.join(workspaceRoot, `apps/editor/src/lint-fixture.${extension}`),
      configFile: path.join(workspaceRoot, 'stylelint.config.cjs')
    })

    assert.ok(result.results[0].warnings.some(({ rule }) => rule === 'property-no-unknown'))
  }

  const result = await stylelint.lint({
    code: '<style scoped> :global(body), :deep(.n-checkbox__border), :slotted(.panel) { color: red; } </style>',
    codeFilename: path.join(workspaceRoot, 'apps/editor/src/lint-fixture.vue'),
    configFile: path.join(workspaceRoot, 'stylelint.config.cjs')
  })

  assert.equal(result.errored, false, JSON.stringify(result.results.map(({ warnings }) => warnings)))
})
it('validates HTML structure and accessibility', async () => {
  const validator = new HtmlValidate(require('../../../.htmlvalidate.json'))
  const result = await validator.validateString('<!doctype html><html><body><img src="image.png" /></body></html>')

  assert.equal(result.valid, false)
  assert.ok(result.results[0].messages.some(({ ruleId }) => ruleId === 'wcag/h37'))
  assert.ok(result.results[0].messages.some(({ ruleId }) => ruleId === 'element-required-attributes'))
})
