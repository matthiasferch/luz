require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { afterEach, beforeEach, describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { BoundingBox, Camera, Entity, Light, Transform } = require('@luz/core')
const { Model } = require('@luz/graphics')
const { Body, Cuboid } = require('@luz/physics')
const { Pool } = require('@luz/serialization')
const { Scene } = require('@luz/scene')
const { Vector3 } = require('@luz/math')
const { Culling } = require('@luz/graphics')

const createFixture = () => {
  const scene = new Scene()
  const camera = new Camera()
  const renderModel = {
    primitives: { solid: { material: { isOpaque: true } }, glass: { material: { isOpaque: false } } }
  }
  const models = { requireCompiledModel: () => renderModel }

  camera.frustum.clipPlanes.set([1, 20])
  camera.frustum.applyTransform(new Transform())

  for (const [name, position] of [
    ['visible', [0, 0, -5]],
    ['hidden', [100, 0, -5]]
  ]) {
    const entity = new Entity()
    const body = new Body()

    body.volume = new Cuboid()
    entity.components.body = body
    entity.components.model = new Model()
    scene.entities[name] = entity

    entity.translation.set(position)
    entity.refreshWorldTransform()
    body.applyTransform(entity)
  }

  const light = new Light()

  light.shadowCamera.frustum.clipPlanes.set([1, 10])
  light.shadowCamera.frustum.applyTransform(new Transform())

  scene.entities.light = new Entity()
  scene.entities.light.components.light = light

  return { scene, camera, models, light }
}

describe('Culling pooling', () => {
  it('culls point range independently of shadow faces and prepares six caster lists', () => {
    const { scene, camera, models, light } = createFixture()
    const transform = new Transform()

    light.lightType = 'point'
    light.range = 6

    light.clipPlanes.set([0.1, 20])
    transform.update(0)
    light.update(transform, 0)
    camera.clipPlanes.set([0.1, 20])
    camera.updateFromMatrix(transform.modelMatrix)
    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [light])

    const [task] = Culling.buildLightingTasks(scene.collectEntities(), [light], camera, 800, 600, 3)

    assert.deepEqual(task.scissor, { x: 0, y: 0, width: 800, height: 600 })
    assert.equal(task.shadowEntities.length, 6)
    assert.ok(task.shadowEntities[5].includes(scene.entities.visible))
    assert.equal(task.shadowEntities[4].includes(scene.entities.visible), false)
    assert.ok(task.shadowEntities.every((entities) => !entities.includes(scene.entities.hidden)))
    transform.translation.set([100, 0, 0])
    transform.update(0)
    light.update(transform, 0)
    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [])
    assert.equal(Culling.computeLightScissor(light, camera, 800, 600, 0), null)
  })
  it('keeps directional lighting unbounded while culling shadow casters to its orthographic volume', () => {
    const { scene, camera, models, light } = createFixture()

    light.lightType = 'directional'
    light.shadowCamera.frustum.orthographicHeight = 4
    light.boundingBox = new BoundingBox([new Vector3([1000, 1000, 1000])])

    assert.equal(camera.frustum.intersectsBoundingBox(light.boundingBox), false)
    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [light])

    const [task] = Culling.buildLightingTasks(scene.collectEntities(), [light], camera, 800, 600, 30)

    assert.deepEqual(task.scissor, { x: 0, y: 0, width: 800, height: 600 })
    assert.ok(task.entities.includes(scene.entities.visible))
    assert.equal(task.entities.includes(scene.entities.hidden), false)

    light.isVisible = false

    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [])
    assert.deepEqual(Culling.buildLightingTasks(scene.collectEntities(), [light], camera, 800, 600, 0), [])
  })

  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredBuffers = new Set()
  const borrowedObjects = new Set()

  beforeEach(() => {
    acquiredBuffers.clear()
    borrowedObjects.clear()

    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      assert.equal(borrowedObjects.has(object), false)
      borrowedObjects.add(object)

      if (object.boundingBox && object.position) {
        acquiredBuffers.add(object)
      }

      return object
    }
    Pool.prototype.release = function (object) {
      assert.equal(borrowedObjects.delete(object), true)
      releaseObject.call(this, object)
    }
  })
  afterEach(() => {
    Pool.prototype.acquire = acquireObject
    Pool.prototype.release = releaseObject
  })
  it('reuses bounds and depth scratch while returning independent render batches and lighting tasks', () => {
    const { scene, camera, models, light } = createFixture()
    const result = Culling.cullScene(scene, camera, models)
    const tasks = Culling.buildLightingTasks(scene.collectEntities(), result.visibleLights, camera, 800, 600, 0)
    const bufferCount = acquiredBuffers.size

    assert.equal(result.opaqueBatches.length, 1)
    assert.equal(result.transparentBatches.length, 1)
    assert.equal(result.transparentBatches[0].transform, scene.entities.visible)
    assert.equal(result.transparentBatches[0].depth, 5)
    assert.deepEqual(result.opaqueBatches[0].meshes, ['solid'])
    assert.deepEqual(result.transparentBatches[0].meshes, ['glass'])
    assert.ok(tasks[0].entities.includes(scene.entities.visible))
    assert.equal(tasks[0].entities.includes(scene.entities.hidden), false)
    assert.equal(light.boundingBox, null)
    assert.ok(bufferCount > 0)

    for (let iteration = 0; iteration < 10; iteration++) {
      const repeatedResult = Culling.cullScene(scene, camera, models)
      const repeatedTasks = Culling.buildLightingTasks(
        scene.collectEntities(),
        repeatedResult.visibleLights,
        camera,
        800,
        600,
        0
      )

      assert.deepEqual(repeatedResult, result)
      assert.deepEqual(repeatedTasks, tasks)
      assert.notEqual(repeatedResult.opaqueBatches, result.opaqueBatches)
      assert.notEqual(repeatedTasks[0].entities, tasks[0].entities)
      assert.equal(acquiredBuffers.size, bufferCount)
      assert.equal(borrowedObjects.size, 0)

      repeatedResult.opaqueBatches[0].meshes.length = 0
      repeatedTasks[0].entities.length = 0

      assert.deepEqual(result.opaqueBatches[0].meshes, ['solid'])
      assert.ok(tasks[0].entities.includes(scene.entities.visible))
    }

    scene.entities.visible.translation.z = -9

    scene.entities.visible.refreshWorldTransform()
    scene.entities.visible.components.body.applyTransform(scene.entities.visible)
    assert.equal(Culling.cullScene(scene, camera, models).transparentBatches[0].depth, 9)
    assert.equal(result.transparentBatches[0].depth, 5)
  })
  it('preserves any-body visibility, bodyless entities, cached light bounds and the light fallback', () => {
    const { scene, camera, models, light } = createFixture()
    const additionalBody = new Body()

    additionalBody.volume = new Cuboid({ origin: new Vector3([0, 0, -4]) })
    scene.entities.hidden.components.additionalBody = additionalBody
    scene.entities.bodyless = new Entity()
    scene.entities.bodyless.components.model = new Model()

    assert.equal(Culling.cullScene(scene, camera, models).opaqueBatches.length, 3)

    const hiddenLight = new Light()
    const cachedBoundingBox = new BoundingBox([new Vector3([100, 0, -4])])

    hiddenLight.boundingBox = cachedBoundingBox
    scene.entities.otherLight = new Entity()
    scene.entities.otherLight.components.light = hiddenLight

    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [light])
    assert.equal(hiddenLight.boundingBox, cachedBoundingBox)
    assert.deepEqual(cachedBoundingBox.minimum.xyz, [100, 0, -4])
    light.shadowCamera.frustum.applyTransform(new Transform({ translation: new Vector3([100, 0, 0]) }))
    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [light, hiddenLight])

    hiddenLight.isVisible = false

    assert.deepEqual(Culling.cullScene(scene, camera, models).visibleLights, [light])
    assert.equal(borrowedObjects.size, 0)
  })
  it('unwinds culling buffers when a bounds check or model lookup throws', () => {
    const { scene, camera, models } = createFixture()
    const intersectsBoundingBox = camera.frustum.intersectsBoundingBox

    camera.frustum.intersectsBoundingBox = () => {
      assert.ok(borrowedObjects.size > 0)

      throw new Error('bounds check failed')
    }

    assert.throws(() => Culling.cullScene(scene, camera, models), /bounds check failed/)
    assert.equal(borrowedObjects.size, 0)

    camera.frustum.intersectsBoundingBox = intersectsBoundingBox

    assert.throws(
      () =>
        Culling.cullScene(scene, camera, {
          requireCompiledModel: () => {
            throw new Error('model lookup failed')
          }
        }),
      /model lookup failed/
    )
    assert.equal(borrowedObjects.size, 0)
    assert.equal(Culling.cullScene(scene, camera, models).opaqueBatches.length, 1)
    assert.equal(borrowedObjects.size, 0)
  })
  it('preserves outer bounds and depth buffers during nested culling', () => {
    const { scene, camera, models } = createFixture()
    const nestedFixture = createFixture()
    const expectedResult = Culling.cullScene(scene, camera, models)
    const expectedNestedResult = Culling.cullScene(nestedFixture.scene, nestedFixture.camera, nestedFixture.models)
    const intersectsBoundingBox = camera.frustum.intersectsBoundingBox

    let hasNestedCall = false

    camera.frustum.intersectsBoundingBox = function (boundingBox) {
      if (!hasNestedCall) {
        hasNestedCall = true

        const outerObjects = new Set(borrowedObjects)
        const snapshot = JSON.stringify([...outerObjects])

        assert.deepEqual(
          Culling.cullScene(nestedFixture.scene, nestedFixture.camera, nestedFixture.models),
          expectedNestedResult
        )
        assert.deepEqual(borrowedObjects, outerObjects)
        assert.equal(JSON.stringify([...outerObjects]), snapshot)
      }

      return intersectsBoundingBox.call(this, boundingBox)
    }

    assert.deepEqual(Culling.cullScene(scene, camera, models), expectedResult)
    assert.equal(hasNestedCall, true)
    assert.equal(borrowedObjects.size, 0)
  })
})
