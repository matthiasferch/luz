const { spawnSync } = require('node:child_process')
const path = require('node:path')

for (const suite of [
  'engine-renderer',
  'debug-overlay',
  'temporal-antialiasing',
  'post-processing',
  'volumetric',
  'directional-light',
  'point-light',
  'skeletal-animation'
]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'run.cjs'), suite], {
    stdio: 'inherit',
    windowsHide: true
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
