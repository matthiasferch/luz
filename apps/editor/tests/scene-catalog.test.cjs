const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { scanSceneCatalog } = require('../tooling/scene-catalog')

const writeScene = (filePath, scene) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(scene))
}

test('counts hierarchical assets per placement and reports reference cycles', (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'luz-hierarchy-catalog-'))

  context.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  writeScene(path.join(directory, 'chair.entity.json'), {
    children: { mesh: { components: { visual: '../models/chair.model.json', lamp: { type: 'light' } } } }
  })
  writeScene(path.join(directory, 'room.scene.json'), {
    entities: {
      one: { entity: './chair.entity.json' },
      two: { entity: './chair.entity.json' }
    }
  })

  let [scene] = scanSceneCatalog(directory)

  assert.equal(scene.entities, 4)
  assert.equal(scene.models, 2)
  assert.equal(scene.lights, 2)
  writeScene(path.join(directory, 'chair.entity.json'), { entity: './chair.entity.json' })

  ;[scene] = scanSceneCatalog(directory)

  assert.equal(scene.isValid, false)
  assert.match(scene.error, /Recursive entity reference/)
})
test('discovers recursive scenes with deterministic metadata and malformed entries', (context) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'luz-scenes-'))

  context.after(() => fs.rmSync(directory, { recursive: true, force: true }))

  const scene = {
    environment: { sky: 'sky.ktx' },
    entities: {
      camera: { components: { Camera: {} } },
      light: { components: { Light: {} } },
      model: { components: { Model: {} } },
      combined: { components: { Model: {}, Light: {} } }
    }
  }
  const nestedPath = path.join(directory, 'nested', 'zebra_scene.scene.json')

  writeScene(nestedPath, scene)
  writeScene(path.join(directory, 'alpha.scene.json'), { entities: {} })
  fs.writeFileSync(path.join(directory, 'broken.scene.json'), '{ nope')
  fs.writeFileSync(path.join(directory, 'ignored.json'), '{}')

  const catalog = scanSceneCatalog(directory)

  assert.deepEqual(
    catalog.map(({ id }) => id),
    ['alpha.scene.json', 'broken.scene.json', 'nested/zebra_scene.scene.json']
  )

  const nested = catalog[2]

  assert.equal(nested.label, 'Zebra scene')
  assert.equal(nested.url, './assets/scenes/nested/zebra_scene.scene.json')
  assert.equal(nested.byteLength, fs.statSync(nestedPath).size)
  assert.equal(nested.entities, 4)
  assert.equal(nested.models, 2)
  assert.equal(nested.lights, 2)
  assert.equal(nested.cameras, 1)
  assert.equal(nested.hasEnvironment, true)

  const invalidScene = catalog[1]

  assert.equal(invalidScene.isValid, false)
  assert.match(invalidScene.error, /JSON|position|property/i)
})
