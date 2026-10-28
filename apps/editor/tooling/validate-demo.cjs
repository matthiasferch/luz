const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const Ajv = require('ajv')
const { textureHashes } = require('./demo-textures.cjs')
const { characterHashes } = require('./demo-character.cjs')

const MAXIMUM_FILE_BYTES = 25 * 1024 * 1024
const schemaDirectory = path.resolve(__dirname, '../../../packages/formats/schemas')
const validator = new Ajv({ allErrors: true })

for (const filename of fs.readdirSync(schemaDirectory)) {
  validator.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDirectory, filename), 'utf8')))
}

const validateDemoAssets = (documents, textures = {}, geometry = {}) => {
  for (const [filename, contents] of Object.entries(textures)) {
    if (!Object.hasOwn(textureHashes, filename) || !Buffer.isBuffer(contents)) {
      throw new Error(`Unsupported demo texture: ${filename}`)
    }

    if (contents.length > MAXIMUM_FILE_BYTES) {
      throw new Error(`Demo asset exceeds 25 MiB: ${filename}`)
    }

    if (createHash('sha256').update(contents).digest('hex') !== textureHashes[filename]) {
      throw new Error(`Demo texture does not match the licensed source: ${filename}`)
    }
  }

  for (const [filename, contents] of Object.entries(geometry)) {
    if (!filename.endsWith('.geometry') || !Object.hasOwn(characterHashes, filename) || !Buffer.isBuffer(contents)) {
      throw new Error(`Unsupported demo geometry: ${filename}`)
    }

    if (contents.length > MAXIMUM_FILE_BYTES) {
      throw new Error(`Demo asset exceeds 25 MiB: ${filename}`)
    }

    if (createHash('sha256').update(contents).digest('hex') !== characterHashes[filename]) {
      throw new Error(`Demo geometry does not match the character manifest: ${filename}`)
    }
  }

  for (const [filename, document] of Object.entries(documents)) {
    const schema = /^scenes\/[a-zA-Z0-9-]+\.scene\.json$/.test(filename)
      ? 'scene.schema.json'
      : /^models\/[a-zA-Z0-9-]+\.model\.json$/.test(filename)
        ? 'model.schema.json'
        : /^animations\/[a-f0-9]{64}\.animation\.json$/.test(filename)
          ? 'skeletal-animation.schema.json'
          : undefined

    if (!schema) {
      throw new Error(`Unsupported demo asset path: ${filename}`)
    }

    if (Buffer.byteLength(JSON.stringify(document)) > MAXIMUM_FILE_BYTES) {
      throw new Error(`Demo asset exceeds 25 MiB: ${filename}`)
    }

    if (!validator.validate(schema, document)) {
      throw new Error(`Invalid demo asset '${filename}': ${validator.errorsText()}`)
    }

    const visit = (value) => {
      if (!value || typeof value !== 'object') {
        return
      }

      if (value.entity) {
        throw new Error(`Demo entities must be embedded in their scene: ${filename}`)
      }

      if (value.geometry) {
        const reference = value.geometry.uri

        if (!/^[a-zA-Z0-9-]+\.geometry$/.test(reference)) {
          throw new Error(`Unsupported demo geometry reference '${reference}' in '${filename}'`)
        }

        const dependency = path.posix.join(path.posix.dirname(filename), reference)

        if (!Object.hasOwn(geometry, dependency)) {
          throw new Error(`Missing demo geometry '${dependency}' in '${filename}'`)
        }

        if (geometry[dependency].length !== value.geometry.byteLength) {
          throw new Error(`Incorrect demo geometry length '${dependency}' in '${filename}'`)
        }
      }

      for (const reference of Object.values(value.animations ?? {})) {
        if (!/^\.\.\/animations\/[a-f0-9]{64}\.animation\.json$/.test(reference)) {
          throw new Error(`Unsupported demo animation reference '${reference}' in '${filename}'`)
        }

        const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(filename), reference))

        if (!Object.hasOwn(documents, dependency)) {
          throw new Error(`Missing demo animation '${dependency}' in '${filename}'`)
        }
      }

      if (value.environment) {
        for (const name of ['sky', 'radiance', 'irradiance']) {
          const reference = value.environment[name]

          if (!/^\.\.\/environments\/studio\/(sky|radiance|irradiance)\.ktx$/.test(reference)) {
            throw new Error(`Unsupported demo environment reference '${reference}' in '${filename}'`)
          }

          const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(filename), reference))

          if (!Object.hasOwn(textures, dependency)) {
            throw new Error(`Missing approved demo environment '${dependency}' in '${filename}'`)
          }
        }
      }

      if (value.surface?.path && !Object.hasOwn(textures, value.surface.path)) {
        throw new Error(`Missing approved demo texture '${value.surface.path}' in '${filename}'`)
      }

      for (const component of Object.values(value.components ?? {})) {
        if (typeof component !== 'string') {
          continue
        }

        if (!/^\.\.\/models\/[a-zA-Z0-9-]+\.model\.json$/.test(component)) {
          throw new Error(`Unsupported demo reference '${component}' in '${filename}'`)
        }

        const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(filename), component))

        if (!Object.hasOwn(documents, dependency)) {
          throw new Error(`Missing demo asset '${dependency}' referenced by '${filename}'`)
        }
      }

      for (const child of Object.values(value)) {
        visit(child)
      }
    }

    visit(document)
  }

  const scenes = Object.keys(documents).filter((filename) => filename.endsWith('.scene.json'))

  if (scenes.length === 0) {
    throw new Error('The demo needs at least one scene')
  }

  for (const scene of scenes) {
    const entities = Object.values(documents[scene].entities)

    if (
      !entities.some((entity) =>
        Object.values(entity.components ?? {}).some((component) => component.type === 'camera')
      )
    ) {
      throw new Error(`Demo scene needs a camera: ${scene}`)
    }
  }
}

module.exports = { MAXIMUM_FILE_BYTES, validateDemoAssets }
