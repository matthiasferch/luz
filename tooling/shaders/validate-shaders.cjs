require('../register-assets.cjs')

const childProcess = require('node:child_process')
const fileSystem = require('node:fs')
const fileSystemPromises = require('node:fs/promises')
const operatingSystem = require('node:os')
const path = require('node:path')
const { validateShaderNames } = require('./shader-names.cjs')
const { validateShaderLayout } = require('./shader-layout.cjs')

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'node',
    experimentalDecorators: true
  }
})

const { defaultMaterialGraphSource } = require('../../packages/graphics/compilers/graph-compiler.ts')

const validatorPath = require('glslang-validator-prebuilt-predownloaded').getPath()

const shaderDirectory = path.resolve(__dirname, '../../packages/graphics')
const {
  vertexShaderHeaders: vertexHeaders,
  fragmentShaderHeaders: fragmentHeaders,
  shaderSources,
  pipelineDefinitions
} = require('../../packages/graphics/rendering/shader-catalog.ts')

const validateShaderDirectory = (directory) => {
  for (const entry of fileSystem.readdirSync(directory, { withFileTypes: true })) {
    const shaderPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      validateShaderDirectory(shaderPath)
    } else if (entry.name.endsWith('.glsl')) {
      validateShaderLayout(fileSystem.readFileSync(shaderPath, 'utf8'), shaderPath)
    }
  }
}

const collectPipelineDefinitions = () =>
  Object.entries(pipelineDefinitions).map(([name, definition]) => ({ name, definition }))

const assembleShader = (source, headers) => {
  const shader = `${headers.join('\n')}\n${source}`

  validateShaderNames(shader)

  return shader
}

const validatePipeline = async (pipelineEntry, temporaryDirectory, index) => {
  const vertexSource = shaderSources[pipelineEntry.definition.vertexShader]
  const fragmentSource = shaderSources[pipelineEntry.definition.fragmentShader]
  const materialHeaders = /\bevaluateMaterial\s*\(/.test(fragmentSource) ? [defaultMaterialGraphSource] : []
  const vertexPath = path.join(temporaryDirectory, `${index}.vert`)
  const fragmentPath = path.join(temporaryDirectory, `${index}.frag`)

  await Promise.all([
    fileSystemPromises.writeFile(vertexPath, assembleShader(vertexSource, vertexHeaders)),
    fileSystemPromises.writeFile(fragmentPath, assembleShader(fragmentSource, [...fragmentHeaders, ...materialHeaders]))
  ])

  const validation = childProcess.spawnSync(validatorPath, ['-l', vertexPath, fragmentPath], {
    encoding: 'utf8',
    windowsHide: true
  })

  if (validation.status === 0) {
    return
  }

  const diagnostics = `${validation.stdout ?? ''}${validation.stderr ?? ''}`.trim()

  throw new Error(`Shader validation failed for '${pipelineEntry.name}'\n${diagnostics}`)
}

const validateShaders = async () => {
  validateShaderDirectory(shaderDirectory)
  validateShaderLayout(defaultMaterialGraphSource, 'defaultMaterialGraphSource')

  const temporaryDirectory = await fileSystemPromises.mkdtemp(path.join(operatingSystem.tmpdir(), 'luz-shaders-'))

  try {
    const pipelineEntries = collectPipelineDefinitions()

    for (const [index, pipelineEntry] of pipelineEntries.entries()) {
      await validatePipeline(pipelineEntry, temporaryDirectory, index)
    }

    console.log(`Validated ${pipelineEntries.length} render pipelines`)
  } finally {
    await fileSystemPromises.rm(temporaryDirectory, { recursive: true, force: true })
  }
}

validateShaders().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
