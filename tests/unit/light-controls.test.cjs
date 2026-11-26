require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { BoundingBox, Camera, Entity, Light } = require('@luz/core')
const { Scene } = require('@luz/scene')
const { Model } = require('@luz/graphics')
const { Culling } = require('@luz/graphics')

describe('Scene light controls', () => {
  it('culls lights with uncached frustum bounds without constructing a polygon', () => {
    const scene = new Scene()
    const entity = new Entity()
    const camera = new Camera()
    const light = new Light()
    const boundingBoxes = []

    entity.components.light = light
    scene.entities.light = entity
    camera.frustum.intersectsBoundingBox = (boundingBox) => {
      boundingBoxes.push(boundingBox)

      return true
    }

    const result = Culling.cullScene(scene, camera, {
      requireCompiledModel() {
        throw new Error('No model expected')
      }
    })
    const expectedBoundingBox = new BoundingBox(light.shadowCamera.frustum.calculateVertices())

    assert.equal(light.boundingBox, null)
    assert.deepEqual(result.visibleLights, [light])
    assert.equal(boundingBoxes.length, 1)
    assert.ok(boundingBoxes[0] instanceof BoundingBox)
    assert.deepEqual(boundingBoxes[0].minimum.xyz, expectedBoundingBox.minimum.xyz)
    assert.deepEqual(boundingBoxes[0].maximum.xyz, expectedBoundingBox.maximum.xyz)
  })
  it('builds a lighting task for every enabled scene light without positional limits', () => {
    const lights = [new Light(), new Light(), new Light(), new Light()]
    const tasks = Culling.buildLightingTasks([], lights, new Camera(), 1280, 720, 0)

    assert.deepEqual(
      tasks.map(({ light }) => light),
      lights
    )
  })
  it('omits invisible lights even when frustum culling falls back to all lights', () => {
    const scene = new Scene(),
      entity = new Entity(),
      camera = new Camera()
    const hiddenLight = new Light()
    const visibleLight = new Light()

    hiddenLight.isVisible = false
    entity.components.hidden = hiddenLight
    entity.components.isVisible = visibleLight
    scene.entities.lights = entity

    scene.update(0, false)

    camera.frustum.intersectsBoundingBox = () => false

    const result = Culling.cullScene(scene, camera, {
      requireCompiledModel() {
        throw new Error('No model expected')
      }
    })

    assert.deepEqual(result.allLights, [visibleLight])
    assert.deepEqual(result.visibleLights, [visibleLight])
    assert.deepEqual(
      Culling.buildLightingTasks([], [hiddenLight, visibleLight], camera, 100, 100, 0).map((batch) => batch.light),
      [visibleLight]
    )
  })
  it('hides opaque and transparent meshes without hiding sibling or child models', () => {
    const scene = new Scene(),
      entity = new Entity(),
      child = new Entity()
    const hiddenModel = new Model(),
      sibling = new Model(),
      descendant = new Model()

    entity.components.hidden = hiddenModel
    entity.components.sibling = sibling
    child.components.model = descendant
    entity.children.child = child
    scene.entities.root = entity
    hiddenModel.isVisible = false

    const compiler = {
      requireCompiledModel(source) {
        return {
          source,
          primitives: {
            opaque: { material: { isOpaque: true } },
            glass: { material: { isOpaque: false } }
          }
        }
      }
    }
    const camera = new Camera()

    let result = Culling.cullScene(scene, camera, compiler)

    assert.deepEqual(
      result.opaqueBatches.map((batch) => batch.model.source),
      [sibling, descendant]
    )
    assert.deepEqual(
      result.transparentBatches.map((batch) => batch.model.source),
      [sibling, descendant]
    )

    hiddenModel.isVisible = true
    result = Culling.cullScene(scene, camera, compiler)

    assert.equal(result.opaqueBatches.length, 3)
    assert.equal(result.transparentBatches.length, 3)
  })
})
