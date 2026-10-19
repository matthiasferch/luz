const { createHash } = require('node:crypto')
const { execFileSync } = require('node:child_process')
const { mkdirSync, readFileSync, writeFileSync, existsSync } = require('node:fs')
const path = require('node:path')
const archives = require('./workflow-linters.json')

const workspaceRoot = path.resolve(__dirname, '..')

async function prepareExecutable(name, archive) {
  const archiveName = new URL(archive.url).pathname.split('/').pop()
  const directory = path.join(workspaceRoot, '.cache', 'linters', archive.sha256)
  const archivePath = path.join(directory, archiveName)

  mkdirSync(directory, { recursive: true })

  if (!existsSync(archivePath)) {
    const response = await fetch(archive.url, { signal: AbortSignal.timeout(120000) })

    if (!response.ok) {
      throw new Error(`Cannot download ${name}: HTTP ${response.status}`)
    }

    const content = Buffer.from(await response.arrayBuffer())

    if (createHash('sha256').update(content).digest('hex') !== archive.sha256) {
      throw new Error(`Invalid ${name} archive checksum`)
    }

    writeFileSync(archivePath, content)
  }

  if (createHash('sha256').update(readFileSync(archivePath)).digest('hex') !== archive.sha256) {
    throw new Error(`Invalid cached ${name} archive checksum`)
  }

  const executableName = `${name}${process.platform === 'win32' ? '.exe' : ''}`
  const members = execFileSync('tar', ['-tf', archivePath], { encoding: 'utf8', windowsHide: true })
    .trim()
    .split(/\r?\n/)
  const member = members.find((entry) => path.posix.basename(entry) === executableName)

  if (!member || member.split('/').includes('..') || path.isAbsolute(member)) {
    throw new Error(`Missing or invalid executable in ${name} archive`)
  }

  execFileSync('tar', ['-xf', archivePath, '-C', directory, member], { windowsHide: true })

  return path.join(directory, member)
}

async function lintWorkflows() {
  const platform = `${process.platform}-${process.arch}`
  const platformArchives = archives[platform]

  if (!platformArchives) {
    throw new Error(`Workflow linting does not support ${platform}`)
  }

  const actionlint = await prepareExecutable('actionlint', platformArchives.actionlint)
  const shellcheck = await prepareExecutable('shellcheck', platformArchives.shellcheck)

  execFileSync(actionlint, ['-color', '-shellcheck', shellcheck], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    windowsHide: true
  })
}

lintWorkflows().catch((error) => {
  console.error(error.message)

  process.exitCode = 1
})
