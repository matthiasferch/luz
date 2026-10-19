const fs = require('node:fs')
const path = require('node:path')

const sceneExtension = '.scene.json'

const walkSceneFiles = (directory) => {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return walkSceneFiles(entryPath)
    }

    return entry.isFile() && entry.name.toLowerCase().endsWith(sceneExtension) ? [entryPath] : []
  })
}

const createDisplayName = (id) => {
  const name = path.posix.basename(id).slice(0, -sceneExtension.length).replace(/[_-]+/g, ' ').trim()

  return name ? name[0].toUpperCase() + name.slice(1) : id
}

const hasComponent = (entity, name) => {
  const components = entity && typeof entity === 'object' ? entity.components : undefined

  return (
    components &&
    typeof components === 'object' &&
    (Object.prototype.hasOwnProperty.call(components, name[0].toUpperCase() + name.slice(1)) ||
      Object.values(components).some(
        (component) =>
          component?.type === name ||
          (name === 'model' && typeof component === 'string' && /\.model\.json(?:[?#].*)?$/i.test(component))
      ))
  )
}

const createDescriptorFromFile = (filePath, sceneDirectory) => {
  const id = path.relative(sceneDirectory, filePath).split(path.sep).join('/')
  const descriptor = {
    id,
    label: createDisplayName(id),
    url: `./assets/scenes/${id.split('/').map(encodeURIComponent).join('/')}`,
    byteLength: fs.statSync(filePath).size,
    isValid: false,
    entities: 0,
    models: 0,
    lights: 0,
    cameras: 0,
    hasEnvironment: false
  }

  try {
    const scene = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    const visit = (entity, documentPath, chain) => {
      if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
        throw new Error(`Invalid entity in '${documentPath}'`)
      }

      if (entity.entity) {
        const reference = path.resolve(path.dirname(documentPath), entity.entity)

        if (chain.includes(reference)) {
          throw new Error(`Recursive entity reference: ${[...chain, reference].join(' -> ')}`)
        }

        const source = JSON.parse(fs.readFileSync(reference, 'utf8'))

        return visit(source, reference, [...chain, reference])
      }

      return [entity, ...Object.values(entity.children ?? {}).flatMap((child) => visit(child, documentPath, chain))]
    }
    const entities = Object.values(scene.entities ?? {}).flatMap((entity) => visit(entity, filePath, [filePath]))

    descriptor.isValid = true
    descriptor.entities = entities.length
    descriptor.models = entities.filter((entity) => hasComponent(entity, 'model')).length
    descriptor.lights = entities.filter((entity) => hasComponent(entity, 'light')).length
    descriptor.cameras = entities.filter((entity) => hasComponent(entity, 'camera')).length
    descriptor.hasEnvironment = Boolean(scene.environment && typeof scene.environment === 'object')
  } catch (error) {
    descriptor.error = error instanceof Error ? error.message : String(error)
  }

  return descriptor
}

const scanSceneCatalog = (sceneDirectory) =>
  walkSceneFiles(sceneDirectory)
    .map((filePath) => createDescriptorFromFile(filePath, sceneDirectory))
    .sort((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id))

module.exports = { scanSceneCatalog }
