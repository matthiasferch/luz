const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')

const sourceDirectory = path.resolve(__dirname, '../public/assets')
const destinationDirectory = path.resolve(__dirname, '../demo-assets/character')
const hashes = {}

const sortDocument = (value) => {
  if (Array.isArray(value)) {
    return value.map(sortDocument)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortDocument(value[key])])
    )
  }

  return value
}

const writeAsset = (filename, contents) => {
  const destination = path.join(destinationDirectory, filename)

  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, contents)

  hashes[filename] = createHash('sha256').update(contents).digest('hex')
}

for (const [sourceName, name] of [
  ['Alpha_Joints-819b3e69dcf9', 'character-joints'],
  ['Alpha_Surface-c39706f2c7ea', 'character-surface']
]) {
  const model = JSON.parse(fs.readFileSync(path.join(sourceDirectory, 'models', `${sourceName}.model.json`), 'utf8'))

  delete model.$schema

  model.geometry.uri = `${name}.geometry`

  writeAsset(`models/${name}.geometry`, fs.readFileSync(path.join(sourceDirectory, 'models', `${sourceName}.geometry`)))

  for (const [clipName, reference] of Object.entries(model.animations)) {
    if (!/^\.\.\/animations\/[a-f0-9]{64}\.animation\.json$/.test(reference)) {
      throw new Error(`Unexpected character animation: ${reference}`)
    }

    const animation = JSON.parse(fs.readFileSync(path.resolve(sourceDirectory, 'models', reference), 'utf8'))

    delete animation.$schema

    animation.isAutoplayEnabled = clipName === 'Idle'
    animation.playback = clipName === 'Jump' || clipName.includes('Turn') ? 'once' : 'loop'

    const contents = JSON.stringify(sortDocument(animation))
    const digest = createHash('sha256').update(contents).digest('hex')

    writeAsset(`animations/${digest}.animation.json`, contents)

    model.animations[clipName] = `../animations/${digest}.animation.json`
  }

  writeAsset(`models/${name}.model.json`, JSON.stringify(model))
}

fs.writeFileSync(path.join(destinationDirectory, 'manifest.json'), JSON.stringify(sortDocument(hashes), null, 2) + '\n')
console.log(`Prepared ${Object.keys(hashes).length} character assets.`)
