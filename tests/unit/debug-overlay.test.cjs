require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { afterEach, beforeEach, describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { Camera, Entity, Light, Transform } = require('@luz/core')
const { Body, Cuboid, Cylinder, Ellipsoid, Sphere } = require('@luz/physics')
const { Pool } = require('@luz/serialization')
const { Scene } = require('@luz/scene')
const { Model, Armature, Bone, Mesh } = require('@luz/graphics')
const { Quaternion, Vector3, Matrix4 } = require('@luz/math')
const { DebugRenderer } = require('@luz/graphics')
const { OverlayBatch } = require('../../packages/graphics/debug/overlay-batch.ts')
const { BoundingBoxCalculator } = require('@luz/graphics')
const { createDebugSettings } = require('@luz/graphics')
const { Culling } = require('@luz/graphics')

const frame = { width: 200, height: 100, pixelRatio: 1, lightBatches: [], lightingWidth: 200, lightingHeight: 100 }
const createFixture = () => {
  const uploads = []
  const draws = []
  const resources = []
  const destroyed = []
  const destroyedPrimitives = []

  let uniforms = {}

  const backend = {
    bindUniforms(_program, values) {
      uniforms = { ...uniforms, ...values }
    },
    buffers: {
      create() {
        const resource = {}

        resources.push(resource)

        return resource
      },

      update(resource, vertices) {
        resource.vertices = Array.from(vertices)

        uploads.push(resource.vertices)
      },

      destroy(resource) {
        destroyed.push(resource)
      }
    },
    primitives: {
      create(options) {
        return options
      },

      destroy(primitive) {
        destroyedPrimitives.push(primitive)
      }
    },
    draw(primitive, { instanceCount }) {
      const vertices = primitive.attributes[0].buffer.vertices.slice(0, instanceCount * 6)

      draws.push({ vertices, uniforms: { ...uniforms }, isCone: primitive.vertexCount === 96 })
    }
  }

  return {
    backend,
    uploads,
    draws,
    resources,
    destroyed,
    destroyedPrimitives,
    scene: new Scene(),
    camera: new Camera(),
    overlay: new DebugRenderer(backend)
  }
}

const renderFixture = (fixture, settings, overlayFrame = frame) =>
  fixture.overlay.draw(
    fixture.scene,
    fixture.camera,
    {},
    {
      ...createDebugSettings(),
      areOverlaysVisible: false,
      ...settings
    },
    overlayFrame
  )

const addModel = (fixture, model) => {
  const entity = new Entity()

  entity.components.model = model
  fixture.scene.entities.model = entity

  return entity
}

describe('Geometry overlays', () => {
  it('does no geometry work when disabled, and skips empty scenes', () => {
    const fixture = createFixture()

    fixture.scene.collectEntities = () => {
      throw new Error('Disabled geometry traversed scene')
    }

    renderFixture(fixture, {})
    renderFixture(fixture, {
      areGeometryOverlaysVisible: false,
      areModelBoundingBoxesVisible: true,
      areArmaturesVisible: true,
      areCameraFrustumsVisible: true,
      areLightFrustumsVisible: true,
      areCollidersVisible: true,
      areCollisionsVisible: true
    })

    fixture.scene = new Scene()

    renderFixture(fixture, {
      areArmaturesVisible: true,
      areModelBoundingBoxesVisible: true,
      areCollidersVisible: true,
      areCollisionsVisible: true,
      areCameraFrustumsVisible: true,
      areLightFrustumsVisible: true,
      areBodyBoundingBoxesVisible: true,
      areLightScissorsVisible: true
    })
    assert.equal(fixture.resources.length, 0)
    assert.equal(fixture.draws.length, 0)
  })
  it('excludes the viewing camera and hidden lights, and separates projector colors', () => {
    const fixture = createFixture()
    const light = new Light()

    fixture.scene.entities.projectors = Object.assign(new Entity(), {
      components: { active: fixture.camera, camera: new Camera(), light }
    })

    renderFixture(fixture, { areCameraFrustumsVisible: true, areLightFrustumsVisible: true })
    assert.equal(fixture.draws.length, 4)
    assert.notDeepEqual(fixture.draws[0].uniforms.baseColor, fixture.draws[1].uniforms.baseColor)
    assert.equal(fixture.draws[0].vertices.length, 13 * 6)
    assert.equal(fixture.draws[1].vertices.length, 13 * 6)
    assert.equal(fixture.draws[2].isCone, true)
    assert.equal(fixture.draws[3].isCone, true)
    assert.equal(fixture.draws[2].vertices.length, 6)
    assert.deepEqual(fixture.draws[2].uniforms.baseColor, fixture.draws[0].uniforms.baseColor)

    light.isVisible = false
    delete fixture.scene.entities.projectors.components.camera
    renderFixture(fixture, { areCameraFrustumsVisible: true, areLightFrustumsVisible: true })
    assert.equal(fixture.draws.length, 4)
    fixture.overlay.destroy()
    assert.equal(fixture.destroyed.length, 4)
    assert.equal(fixture.destroyedPrimitives.length, 4)
  })
  it('uses animated bone poses and world transforms, and marks zero-length bones', () => {
    const fixture = createFixture()
    const model = new Model()
    const armature = new Armature()
    const bone = new Bone({ head: new Vector3([1, 2, 3]), tail: new Vector3([1, 3, 3]) })

    model.armatures.skeleton = armature

    armature.bones.push(bone)

    const entity = addModel(fixture, model)

    bone.poseMatrix[12] = 4
    entity.modelMatrix[13] = 5

    renderFixture(fixture, { areArmaturesVisible: true })
    assert.equal(fixture.draws.length, 2)
    assert.equal(fixture.uploads[0].length, 24 * 3)
    assert.deepEqual(fixture.uploads[0].slice(0, 3), [5, 7, 3])
    assert.deepEqual(fixture.uploads[1].slice(0, 6), [5, 7, 3, 5, 7, 3])
    bone.tail.set(bone.head)
    renderFixture(fixture, { areArmaturesVisible: true })
    assert.equal(fixture.draws.length, 3)
    assert.ok(fixture.uploads[2].every(Number.isFinite))

    armature.bones.length = 0

    renderFixture(fixture, { areArmaturesVisible: true })
    assert.equal(fixture.draws.length, 3)
    fixture.overlay.destroy()
    assert.equal(fixture.destroyed.length, 2)
    assert.equal(fixture.destroyedPrimitives.length, 2)
    armature.bones.push(bone)
    renderFixture(fixture, { areArmaturesVisible: true })
    assert.equal(fixture.resources.length, 3)
  })
  it('respects model visibility and reuses buffers across toggles', () => {
    const fixture = createFixture()
    const model = new Model()

    model.setMesh('shape', new Mesh({ vertices: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 0, 0, 0, 0] }))
    addModel(fixture, model)
    renderFixture(fixture, { areModelBoundingBoxesVisible: true })
    renderFixture(fixture, { areGeometryOverlaysVisible: false, areModelBoundingBoxesVisible: true })
    assert.equal(fixture.draws.length, 1)
    renderFixture(fixture, { areModelBoundingBoxesVisible: true })
    assert.equal(fixture.resources.length, 1)
    assert.equal(fixture.draws.length, 2)

    model.isVisible = false

    renderFixture(fixture, { areModelBoundingBoxesVisible: true })
    assert.equal(fixture.draws.length, 2)
  })
  it('uses frustum intersection for body styles independently of model visibility', () => {
    const fixture = createFixture()

    fixture.scene.entities.body = Object.assign(new Entity(), {
      components: { body: Object.assign(new Body(), { volume: new Sphere() }) }
    })
    fixture.camera.frustum.intersectsBoundingBox = () => true

    renderFixture(fixture, { areBodyBoundingBoxesVisible: true })
    assert.equal(fixture.draws[0].uniforms.isDashed, false)

    fixture.camera.frustum.intersectsBoundingBox = () => false

    renderFixture(fixture, { areBodyBoundingBoxesVisible: true })
    assert.equal(fixture.draws[1].uniforms.isDashed, true)
  })
  it('draws contact markers and arrowheads without changing normal length', () => {
    const fixture = createFixture()

    Object.defineProperty(fixture.scene, 'collisionManifolds', {
      value: [{ collisions: [{ point: new Vector3([0, 0, -2]), normal: new Vector3([0, 2, 0]) }] }]
    })
    renderFixture(fixture, { areCollisionsVisible: true })
    assert.equal(fixture.draws.length, 3)
    assert.ok(Math.abs(fixture.uploads[0][4] - 1.92) < 1e-6)
    assert.equal(fixture.uploads[0].length, 6)
    assert.deepEqual(fixture.draws[2].vertices, [0, 0, -2, 0, 2, -2])
    assert.equal(fixture.draws[2].isCone, true)
    assert.equal(fixture.draws[2].uniforms.isCone, true)
    renderFixture(fixture, {})
    assert.equal(fixture.draws.length, 3)
    fixture.overlay.destroy()
    assert.equal(fixture.destroyed.length, 3)
    assert.equal(fixture.destroyedPrimitives.length, 3)
  })
  it('uses lighting-task scissors including rounding and margin, in screen space', () => {
    const fixture = createFixture()
    const light = new Light()
    const scissor = Culling.computeLightScissor(light, fixture.camera, 200, 100, 3)

    assert.ok(scissor)
    renderFixture(
      fixture,
      { areLightScissorsVisible: true },
      { ...frame, lightBatches: [{ light, scissor, entities: [] }] }
    )
    assert.equal(fixture.draws[0].uniforms.isScreenSpace, true)
    assert.ok(Math.abs(fixture.uploads[0][0] - ((scissor.x / 200) * 2 - 1)) < 1e-6)
    assert.ok(Math.abs(fixture.uploads[0][3] - (((scissor.x + scissor.width) / 200) * 2 - 1)) < 1e-6)
  })
})
it('releases a buffer when primitive setup fails and can retry the batch', () => {
  const fixture = createFixture()
  const batch = new OverlayBatch('#ffffff')
  const createPrimitive = fixture.backend.primitives.create

  batch.append([0, 0, 0, 1, 0, 0])

  fixture.backend.primitives.create = () => {
    throw new Error('Setup failed')
  }

  assert.throws(() => batch.draw(fixture.backend), /Setup failed/)
  assert.equal(fixture.destroyed.length, 1)
  assert.equal(fixture.draws.length, 0)

  fixture.backend.primitives.create = createPrimitive

  batch.draw(fixture.backend)
  assert.equal(fixture.resources.length, 2)
  assert.equal(fixture.draws.length, 1)
  batch.destroy(fixture.backend)
  batch.destroy(fixture.backend)
  assert.equal(fixture.destroyed.length, 2)
  assert.equal(fixture.destroyedPrimitives.length, 1)
})
it('retries failed uploads using the existing resources without drawing stale data', () => {
  const fixture = createFixture()
  const batch = new OverlayBatch('#ffffff')
  const updateBuffer = fixture.backend.buffers.update

  batch.append([0, 0, 0, 1, 0, 0])
  batch.draw(fixture.backend)
  batch.reset()
  batch.append([2, 0, 0, 3, 0, 0])

  fixture.backend.buffers.update = () => {
    throw new Error('Upload failed')
  }

  assert.throws(() => batch.draw(fixture.backend), /Upload failed/)
  assert.equal(fixture.draws.length, 1)

  fixture.backend.buffers.update = updateBuffer

  batch.draw(fixture.backend)
  assert.equal(fixture.resources.length, 1)
  assert.deepEqual(fixture.draws[1].vertices, [2, 0, 0, 3, 0, 0])
  batch.destroy(fixture.backend)
  assert.equal(fixture.destroyed.length, 1)
  assert.equal(fixture.destroyedPrimitives.length, 1)
})
it('keeps debug bones and bounds synchronized through animation playback and mixing', async () => {
  const fixture = createFixture()
  const clips = Object.fromEntries(
    [
      ['idle', 0],
      ['reach', 4]
    ].map(([name, distance]) => [
      name,
      {
        type: 'skeletalAnimation',
        schemaVersion: 1,
        duration: 1,
        playback: 'loop',
        isAutoplayEnabled: false,
        keyframes: {
          Root: {
            translation: [
              { time: 0, value: [0, 0, 0] },
              { time: 1, value: [distance, 0, 0] }
            ],
            rotation: [{ time: 0, value: [0, 0, 0, 1] }],
            scale: [{ time: 0, value: [1, 1, 1] }]
          }
        }
      }
    ])
  )
  const model = await Model.deserialize(
    {
      type: 'model',
      armatures: { Rig: { bones: [{ name: 'Root', head: [0, 0, 0], tail: [0, 1, 0] }] } },
      meshes: {
        shape: {
          vertices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
          weights: [0, 1].map((vertex) => ({ vertex, indices: [0, 0, 0, 0], weights: [1, 0, 0, 0] }))
        }
      },
      animations: { idle: 'idle.animation.json', reach: 'reach.animation.json' }
    },
    clips
  )
  const entity = addModel(fixture, model)

  model.animationMixer.setMix({ idle: 0.5, reach: 0.5 }, { transitionDuration: 0, isRestartEnabled: true })
  model.update(entity, 0.5)

  const time = model.animations.reach.time
  const calculator = new BoundingBoxCalculator()

  assert.equal(calculator.calculate(model, entity).minimum.x, 1)
  renderFixture(fixture, { areArmaturesVisible: true, areModelBoundingBoxesVisible: true })
  assert.equal(fixture.uploads[0][0], 1)
  assert.equal(fixture.uploads[1][0], 1)
  assert.equal(model.animations.reach.time, time)
  model.animationMixer.setMix({ reach: 1 })
  model.update(entity, 0)
  assert.equal(calculator.calculate(model, entity).minimum.x, 2)
  assert.equal(model.serialize().meshes.shape.boundingBox, undefined)
})
describe('Current-pose model bounds', () => {
  const createModel = () => {
    const model = new Model()

    model.setMesh(
      'shape',
      new Mesh({
        vertices: [1, 2, 3, 0, 0, 0, 0, 0, -1, -2, -3, 0, 0, 0, 0, 0, 99, 99, 99, 0, 0, 0, 0, 0],
        indices: [0, 1]
      })
    )

    return model
  }

  it('includes only indexed vertices and caches until geometry or transform changes', () => {
    const calculator = new BoundingBoxCalculator()
    const model = createModel()
    const transform = new Transform()
    const boundingBox = calculator.calculate(model, transform)

    assert.deepEqual(Array.from(boundingBox.minimum), [-1, -2, -3])
    assert.deepEqual(Array.from(boundingBox.maximum), [1, 2, 3])
    assert.equal(calculator.calculate(model, transform), boundingBox)

    transform.modelMatrix[0] = -2
    transform.modelMatrix[12] = 10

    const moved = calculator.calculate(model, transform)

    assert.deepEqual(Array.from(moved.minimum), [8, -2, -3])
    assert.deepEqual(Array.from(moved.maximum), [12, 2, 3])

    model.meshes.shape.vertices[0] = 4

    model.meshes.shape.invalidateGeometry()
    assert.equal(calculator.calculate(model, transform).minimum.x, 2)
    model.meshes.shape.indices.push(2)
    assert.equal(calculator.calculate(model, transform).maximum.y, 99)
  })
  it('matches blended skinning, includes unweighted vertices, and invalidates poses', () => {
    const calculator = new BoundingBoxCalculator()
    const model = createModel()
    const transform = new Transform()
    const firstMatrix = Matrix4.createIdentity()
    const secondMatrix = Matrix4.createIdentity()

    firstMatrix[12] = 4
    secondMatrix[13] = 8
    model.isAnimated = true
    model.boneMatrices = new Float32Array([...firstMatrix, ...secondMatrix])

    model.meshes.shape.weights.push({ vertex: 0, indices: [0, 1, 0, 0], weights: [0.5, 0.5, 0, 0] })

    const boundingBox = calculator.calculate(model, transform)

    assert.deepEqual(Array.from(boundingBox.maximum), [3, 6, 3])
    assert.deepEqual(Array.from(boundingBox.minimum), [-1, -2, -3])
    assert.equal(calculator.calculate(model, transform), boundingBox)

    model.boneMatrices[12] = 8

    assert.equal(calculator.calculate(model, transform).maximum.x, 5)

    model.meshes.shape.weights[0].weights = [0, 0, 0, 0]

    model.meshes.shape.invalidateGeometry()
    assert.equal(calculator.calculate(model, transform).maximum.x, 1)
  })
  it('reads binary position offsets and strides and combines meshes', () => {
    const model = new Model()

    model.setMesh(
      'binary',
      new Mesh({
        resolvedGeometry: {
          vertices: new Float32Array([999, 2, 3, 4, 999, -2, -3, -4]),
          indices: new Uint16Array([1]),
          descriptor: {
            byteOffset: 64,
            byteStride: 16,
            count: 2,
            attributes: { position: { byteOffset: 4, format: 'float32x3' } }
          }
        }
      })
    )
    model.setMesh('inline', new Mesh({ vertices: [1, 1, 1, 0, 0, 0, 0, 0] }))

    const calculator = new BoundingBoxCalculator()
    const transform = new Transform()
    const boundingBox = calculator.calculate(model, transform)

    assert.deepEqual(Array.from(boundingBox.minimum), [-2, -3, -4])
    assert.deepEqual(Array.from(boundingBox.maximum), [1, 1, 1])

    model.meshes.binary.resolvedGeometry.vertices[5] = -6

    model.meshes.binary.invalidateGeometry()
    assert.equal(calculator.calculate(model, transform).minimum.x, -6)
    assert.equal(new BoundingBoxCalculator().calculate(new Model(), new Transform()), null)
  })
  it('reads shared vertices once and never scans source geometry on cached, transformed, or posed frames', () => {
    const calculator = new BoundingBoxCalculator()
    const model = createModel()
    const mesh = model.meshes.shape
    const transform = new Transform()
    const reads = { vertices: 0, indices: 0, weights: 0 }
    const trackReads = (values, category) =>
      new Proxy(values, {
        get(target, key, receiver) {
          if (typeof key === 'string' && /^\d+$/.test(key)) {
            reads[category]++
          }

          return Reflect.get(target, key, receiver)
        }
      })

    mesh.vertices = trackReads(mesh.vertices, 'vertices')
    mesh.indices = trackReads([0, 1, 0, 1, 0, 1], 'indices')
    mesh.weights = trackReads([{ vertex: 0, indices: [0, 0, 0, 0], weights: [1, 0, 0, 0] }], 'weights')
    model.isAnimated = true
    model.boneMatrices = new Float32Array(Matrix4.createIdentity())

    const boundingBox = calculator.calculate(model, transform)

    assert.equal(reads.vertices, 6)

    const preparedReads = { ...reads }

    for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
      assert.equal(calculator.calculate(model, transform), boundingBox)
    }

    transform.modelMatrix[12] = 10

    assert.equal(calculator.calculate(model, transform).maximum.x, 11)

    model.boneMatrices[12] = 5

    assert.equal(calculator.calculate(model, transform).maximum.x, 16)
    assert.equal(calculator.calculate(model, new Transform()).maximum.x, 6)
    assert.equal(calculator.calculate(model, transform).maximum.x, 16)
    assert.deepEqual(reads, preparedReads)

    model.isAnimated = false

    assert.equal(calculator.calculate(model, transform).maximum.x, 11)

    mesh.vertices[0] = 4

    calculator.clear()
    assert.equal(calculator.calculate(model, transform).maximum.x, 14)
    assert.ok(reads.vertices > preparedReads.vertices)
  })
  it('keeps rotated world bounds tight and invalidates replaced or removed geometry', () => {
    const calculator = new BoundingBoxCalculator()
    const model = new Model()
    const transform = new Transform()
    const rotation = Math.SQRT1_2

    model.setMesh(
      'shape',
      new Mesh({
        vertices: [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]
      })
    )

    transform.modelMatrix[0] = rotation
    transform.modelMatrix[1] = rotation
    transform.modelMatrix[4] = -rotation
    transform.modelMatrix[5] = rotation

    const boundingBox = calculator.calculate(model, transform)

    assert.ok(Math.abs(boundingBox.maximum.y - Math.SQRT2) < 1e-6)

    model.meshes.shape.vertices = [0, 4, 0, 0, 0, 0, 0, 0]

    assert.ok(Math.abs(calculator.calculate(model, transform).maximum.y - 2 * Math.SQRT2) < 1e-6)
    model.setMesh('shape', new Mesh({ vertices: [0, 8, 0, 0, 0, 0, 0, 0] }))
    assert.ok(Math.abs(calculator.calculate(model, transform).maximum.y - 4 * Math.SQRT2) < 1e-6)
    delete model.meshes.shape
    assert.equal(calculator.calculate(model, transform), null)
  })
})
describe('Debug geometry pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredObjects = new Set()
  const borrowedObjects = new Set()

  beforeEach(() => {
    acquiredObjects.clear()
    borrowedObjects.clear()

    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      assert.equal(borrowedObjects.has(object), false)
      acquiredObjects.add(object)
      borrowedObjects.add(object)

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

  for (const [createShape, createVertices, vertexCount] of [
    [() => new Sphere({ radius: 2 }), 'createSphereVertices', 720],
    [() => new Cuboid({ extents: new Vector3([1, 2, 3]) }), 'createCuboidVertices', 38],
    [() => new Cylinder({ radius: 2, height: 3, axisIndex: 2 }), 'createCylinderVertices', 488],
    [() => new Ellipsoid({ radius: new Vector3([1, 2, 3]) }), 'createEllipsoidVertices', 720]
  ]) {
    const shapeType = createShape().type

    it(`reuses ${shapeType} scratch and keeps returned vertex buffers independent`, () => {
      const overlay = new DebugRenderer({}, {})
      const shape = createShape()

      shape.applyTransform(
        new Transform({
          translation: new Vector3([1, 2, 3]),
          rotation: Quaternion.setFromEulerAngles(0.2, -0.3, 0.4)
        })
      )

      const centerSnapshot = shape.center.clone()
      const axisSnapshots = shape.axes?.map((axis) => axis.clone())
      const vertices = overlay[createVertices](shape)
      const snapshot = vertices.slice()
      const objectCount = acquiredObjects.size

      assert.equal(vertices.length, vertexCount * 3)
      assert.ok(vertices.every(Number.isFinite))
      assert.ok(objectCount > 0)
      assert.equal(borrowedObjects.size, 0)

      for (let iteration = 0; iteration < 5; iteration++) {
        const repeatedVertices = overlay[createVertices](shape)

        assert.deepEqual(repeatedVertices, snapshot)
        assert.notEqual(repeatedVertices, vertices)
        assert.equal(acquiredObjects.size, objectCount)
        assert.equal(borrowedObjects.size, 0)
        repeatedVertices.fill(999)
        assert.deepEqual(vertices, snapshot)
      }

      assert.deepEqual(shape.center, centerSnapshot)
      assert.deepEqual(shape.axes, axisSnapshots)

      shape.center.x += 10

      assert.notDeepEqual(overlay[createVertices](shape), snapshot)
      assert.deepEqual(vertices, snapshot)
      assert.equal(borrowedObjects.size, 0)
    })
    it(`releases ${shapeType} scratch after errors and isolates nested overlay generation`, () => {
      const overlay = new DebugRenderer({}, {})
      const shape = createShape()
      const nestedShape = createShape()
      const expectedVertices = overlay[createVertices](shape)

      nestedShape.center.set([10, 20, 30])

      const expectedNestedVertices = overlay[createVertices](nestedShape)

      Object.defineProperty(shape.center, 'x', {
        configurable: true,
        get() {
          assert.ok(borrowedObjects.size > 0)

          throw new Error('debug geometry failed')
        }
      })
      assert.throws(() => overlay[createVertices](shape), /debug geometry failed/)
      assert.equal(borrowedObjects.size, 0)

      let hasNestedCall = false

      Object.defineProperty(shape.center, 'x', {
        get() {
          if (!hasNestedCall) {
            hasNestedCall = true

            const outerObjects = new Set(borrowedObjects)
            const snapshots = [...outerObjects].map((object) => Array.from(object))

            assert.deepEqual(overlay[createVertices](nestedShape), expectedNestedVertices)
            assert.deepEqual(borrowedObjects, outerObjects)
            assert.deepEqual(
              [...outerObjects].map((object) => Array.from(object)),
              snapshots
            )
          }

          return this[0]
        }
      })
      assert.deepEqual(overlay[createVertices](shape), expectedVertices)
      assert.equal(hasNestedCall, true)
      assert.equal(borrowedObjects.size, 0)
    })
  }

  it('keeps separate overlay resources independent', () => {
    const firstFixture = createFixture()
    const secondFixture = createFixture()
    const body = new Body()

    body.volume = new Sphere()
    firstFixture.scene.entities.shape = Object.assign(new Entity(), { components: { body } })
    secondFixture.scene = firstFixture.scene

    renderFixture(firstFixture, { areCollidersVisible: true })

    const snapshot = firstFixture.uploads[0].slice()

    body.volume.center.x += 10

    renderFixture(secondFixture, { areCollidersVisible: true })
    assert.deepEqual(firstFixture.uploads[0], snapshot)
    assert.notDeepEqual(secondFixture.uploads[0], snapshot)
    assert.equal(borrowedObjects.size, 0)
  })
})
