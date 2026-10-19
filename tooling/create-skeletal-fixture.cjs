const { spawnSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')

const workspace = path.resolve(__dirname, '..')
const executable =
  process.env.BLENDER_PATH ??
  [
    'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe',
    'C:/Program Files/Blender Foundation/Blender 5.0/blender.exe',
    '/Applications/Blender.app/Contents/MacOS/Blender',
    '/usr/bin/blender'
  ].find((candidate) => existsSync(candidate)) ??
  'blender'
const result = spawnSync(
  executable,
  [
    '--background',
    '--factory-startup',
    '--offline-mode',
    '--python-exit-code',
    '1',
    '--python',
    path.join(workspace, 'integrations/blender/tests/skeletal_animation_fixture.py'),
    '--',
    '--output',
    path.join(workspace, '.tmp/skeletal-fixture'),
    '--exact'
  ],
  { cwd: workspace, stdio: 'inherit', windowsHide: true }
)

if (result.error) {
  throw new Error('Set BLENDER_PATH to Blender 5.0 or newer to generate the synthetic skeletal fixture', {
    cause: result.error
  })
}

process.exitCode = result.status ?? 1
