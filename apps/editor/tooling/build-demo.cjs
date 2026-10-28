const fs = require('node:fs/promises')
const path = require('node:path')
const os = require('node:os')
const webpack = require('webpack')
const createWebpackConfiguration = require('../webpack.config')
const { createDemoAssets } = require('./demo-assets.cjs')
const { readDemoTextures } = require('./demo-textures.cjs')
const { readCharacterGeometry } = require('./demo-character.cjs')
const { MAXIMUM_FILE_BYTES, validateDemoAssets } = require('./validate-demo.cjs')

const buildDemo = async () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const geometry = readCharacterGeometry()

  validateDemoAssets(documents, textures, geometry)

  const assetDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'luz-demo-assets-'))

  if (
    path.dirname(assetDirectory) !== path.resolve(os.tmpdir()) ||
    !path.basename(assetDirectory).startsWith('luz-demo-assets-')
  ) {
    throw new Error('Unexpected temporary demo directory')
  }

  try {
    for (const [filename, document] of Object.entries(documents)) {
      const target = path.join(assetDirectory, filename)

      await fs.mkdir(path.dirname(target), { recursive: true })

      await fs.writeFile(target, JSON.stringify(document))
    }

    for (const [filename, contents] of Object.entries({ ...textures, ...geometry })) {
      const target = path.join(assetDirectory, filename)

      await fs.mkdir(path.dirname(target), { recursive: true })

      await fs.writeFile(target, contents)
    }

    for (const filename of [
      'textures/galvanizedMetal/LICENSE.txt',
      'environments/studio/LICENSE.txt',
      'character/NOTICE.txt'
    ]) {
      const target = path.join(assetDirectory, filename)

      await fs.mkdir(path.dirname(target), { recursive: true })

      await fs.copyFile(path.resolve(__dirname, '../demo-assets', filename), target)
    }

    const configuration = createWebpackConfiguration({ demoAssetsDirectory: assetDirectory }, { mode: 'production' })
    const compiler = webpack(configuration)

    try {
      const statistics = await new Promise((resolve, reject) => {
        compiler.run((error, result) => (error ? reject(error) : resolve(result)))
      })

      console.log(statistics.toString({ colors: process.stdout.isTTY, modules: false, assets: false }))

      if (statistics.hasErrors()) {
        throw new Error('Demo compilation failed')
      }

      for (const asset of statistics.compilation.getAssets()) {
        if (asset.source.size() > MAXIMUM_FILE_BYTES) {
          throw new Error(`Demo output exceeds 25 MiB: ${asset.name}`)
        }
      }
    } finally {
      await new Promise((resolve, reject) => compiler.close((error) => (error ? reject(error) : resolve())))
    }
  } finally {
    await fs.rm(assetDirectory, { recursive: true, force: true })
  }
}

buildDemo().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
