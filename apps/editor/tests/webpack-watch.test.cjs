const assert = require('node:assert/strict')
const path = require('node:path')
const test = require('node:test')

const createWebpackConfiguration = require('../webpack.config')
const { scanSceneCatalog } = require('../tooling/scene-catalog')

const assertEmbeddedSceneCatalog = (definitions) => {
  const scenes = JSON.parse(definitions.__EDITOR_SCENES__)

  assert.deepEqual(scenes, scanSceneCatalog(path.resolve(__dirname, '../public/assets/scenes')))
  assert.ok(scenes.every((scene) => scene.id.endsWith('.scene.json')))
}

test('development server exposes a live scene catalog without watching exported assets', () => {
  const configuration = createWebpackConfiguration({ WEBPACK_SERVE: true })
  const assetDirectory = path.resolve(__dirname, '../public/assets')
  const definitions = configuration.plugins.find((plugin) => plugin.constructor.name === 'DefinePlugin').definitions

  assert.equal(configuration.devServer.watchFiles, undefined)
  assert.equal(definitions.__EDITOR_DEVELOPMENT__, 'true')
  assertEmbeddedSceneCatalog(definitions)
  assert.equal(typeof configuration.devServer.setupMiddlewares, 'function')
  assert.equal(configuration.devServer.static[0].directory, assetDirectory)
  assert.equal(configuration.devServer.static[0].publicPath, '/assets')
  assert.equal(configuration.devServer.static[0].watch, false)
  assert.equal(
    configuration.plugins.some((plugin) => plugin.constructor.name === 'CopyPlugin'),
    false
  )
})
test('development server treats a missing optional Blender export marker as no content', async () => {
  const configuration = createWebpackConfiguration({ WEBPACK_SERVE: true })
  const middlewares = configuration.devServer.setupMiddlewares([])
  const middleware = middlewares.find(({ name }) => name === 'luz-scene-export-status').middleware

  const statusCode = await new Promise((resolve) => {
    const response = {
      statusCode: 0,
      setHeader: () => {},

      end: () => resolve(response.statusCode)
    }

    middleware({ url: '/assets/scenes/__missing__.export.json' }, response, () => resolve('next'))
  })

  assert.equal(statusCode, 204)
})
test('production build supports optional local assets', () => {
  const configuration = createWebpackConfiguration()
  const definitions = configuration.plugins.find((plugin) => plugin.constructor.name === 'DefinePlugin').definitions
  const copyPlugin = configuration.plugins.find((plugin) => plugin.constructor.name === 'CopyPlugin')

  assert.ok(copyPlugin)
  assert.equal(copyPlugin.patterns[0].from, 'public/assets/')
  assert.equal(copyPlugin.patterns[0].noErrorOnMissing, true)
  assert.equal(
    copyPlugin.patterns.some((pattern) => pattern.from === 'src/rendering/'),
    false
  )
  assert.ok(configuration.module.rules.some((rule) => rule.type === 'asset/source'))
  assert.equal(definitions.__EDITOR_DEVELOPMENT__, 'false')
  assertEmbeddedSceneCatalog(definitions)
})
