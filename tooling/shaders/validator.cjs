const { spawnSync } = require('node:child_process')
const { chmodSync, statSync } = require('node:fs')

function prepareValidator(validatorPath) {
  if (process.platform !== 'win32') {
    // The bundled Unix binaries are published without execute permission.
    chmodSync(validatorPath, statSync(validatorPath).mode | 0o100)
  }
}

function runValidator(validatorPath, parameters, pipelineName) {
  const validation = spawnSync(validatorPath, parameters, {
    encoding: 'utf8',
    windowsHide: true
  })

  if (validation.error) {
    throw new Error(`Cannot launch shader validator for '${pipelineName}': ${validation.error.message}`, {
      cause: validation.error
    })
  }

  if (validation.status !== 0) {
    const diagnostics = `${validation.stdout ?? ''}${validation.stderr ?? ''}`.trim()
    const termination = validation.signal ? `signal ${validation.signal}` : `exit code ${validation.status}`

    throw new Error(`Shader validation failed for '${pipelineName}' (${termination})\n${diagnostics}`)
  }
}

module.exports = { prepareValidator, runValidator }
