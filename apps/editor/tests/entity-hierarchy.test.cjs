require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Entity, Camera, Light, TransformAnimation, isTransformAnimation } = require('@luz/core')
const { Scene } = require('@luz/scene')
const { isBody } = require('@luz/physics')
const { Model } = require('@luz/graphics')
const { Culling } = require('@luz/graphics')
const { captureEntityMotionHistory } = require('../../../packages/graphics/rendering/motion-history.ts')
const { EntityLoader, ModelLoader, ModelCompiler } = require('@luz/graphics')

it('renders descendant meshes at world depth and includes descendant lights and shadow casters', () => {
  const scene = new Scene(),
    root = new Entity(),
    child = new Entity()

  scene.entities.root = root
  root.children.mesh = child
  child.components.model = new Model()
  child.components.light = new Light()

  root.translation.set([1, 0, -10])
  child.translation.set([0, 0, -3])

  const camera = new Camera()
  const compiledModel = { primitives: { mesh: { material: { isOpaque: false } } } }

  scene.update(0, false)

  const { transparentBatches, visibleLights } = Culling.cullScene(scene, camera, {
    requireCompiledModel: () => compiledModel
  })

  assert.equal(transparentBatches.length, 1)
  assert.equal(transparentBatches[0].transform, child)
  assert.equal(transparentBatches[0].depth, 13)
  assert.deepEqual([...visibleLights[0].translation], [1, 0, -13])

  const tasks = Culling.buildLightingTasks(scene.collectEntities(), visibleLights, camera, 800, 600, 0)

  assert.ok(tasks[0].entities.includes(child))

  const previousModels = new WeakMap(),
    previousBones = new WeakMap()

  child.components.model.boneMatrices = new Float32Array([1, 2, 3, 4])

  captureEntityMotionHistory(scene, previousModels, previousBones, { requireCompiledModel: () => compiledModel })

  const previousModelMatrix = previousModels.get(child)

  assert.notEqual(previousModelMatrix, child.modelMatrix)
  assert.deepEqual([...previousModelMatrix], [...child.modelMatrix])
  assert.notEqual(previousBones.get(compiledModel), child.components.model.boneMatrices)

  const animation = new TransformAnimation()

  Object.assign(animation, {
    duration: 1 / 60,
    isAutoplayEnabled: true,
    playback: 'once',
    tracks: {
      translation: [0, 5].map((x, index) => ({ time: index / 60, value: [x, 0, 0] }))
    }
  })

  root.components.motion = animation

  scene.captureSimulationState()
  scene.update(1 / 60)
  assert.equal(child.modelMatrix[12] - previousModelMatrix[12], 5)
  assert.equal(visibleLights[0].translation.x, 6)
  assert.equal(previousModelMatrix[12], 1)

  child.components.model.boneMatrices[0] = 7

  assert.equal(previousBones.get(compiledModel)[0], 1)
  captureEntityMotionHistory(scene, previousModels, previousBones, { requireCompiledModel: () => compiledModel })
  assert.equal(previousModels.get(child)[12], 6)
  assert.equal(previousBones.get(compiledModel)[0], 7)
})
it('loads and builds render batches for a synthetic hierarchical scene', async () => {
  const documents = {
    '/scene.scene.json': {
      entities: {
        camera: { components: { camera: { type: 'camera' } } },
        group: {
          translation: [0, 0, -5],
          children: {
            triangle: { components: { model: './triangle.model.json' } },
            lamp: { components: { light: { type: 'light', lightType: 'point' } } }
          }
        }
      }
    },
    '/triangle.model.json': {
      type: 'model',
      meshes: {
        triangle: {
          vertices: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1]
        }
      }
    }
  }
  const loadJson = async (url) => {
    const document = documents[new URL(url).pathname]

    assert.ok(document, `Unexpected asset request: ${url}`)

    return document
  }
  const models = new ModelLoader(loadJson)
  const loader = new EntityLoader(models, loadJson)
  const scene = await loader.loadScene('http://localhost/scene.scene.json')
  const material = { isOpaque: true }
  const compiler = new ModelCompiler(
    { defaultMaterial: material },
    { compile: async () => material },
    {
      compile: () => ({ material })
    }
  )

  for (const entity of scene.collectEntities()) {
    for (const component of Object.values(entity.components)) {
      if (component.type === 'model') {
        await compiler.compile(component, models.findAssetIdentity(component))
      }
    }
  }

  scene.update(0, false)

  const { camera } = scene.selectCamera()
  const batches = Culling.cullScene(scene, camera, compiler)

  assert.equal(batches.opaqueBatches.length, 1)
  assert.equal(batches.allLights.length, 1)
  assert.equal(scene.collectEntities().length, 4)

  for (const batch of batches.opaqueBatches) {
    assert.ok([...batch.transform.modelMatrix].every(Number.isFinite))
  }
})
it('loads, advances, pauses and resets a serialized kinematic platform animation', async () => {
  const loadJson = async () => ({
    entities: {
      Platform: {
        translation: [2, 1, 0],
        components: {
          Body: { type: 'body', mass: 0, motionType: 'kinematic', volume: { type: 'cuboid' } },
          Animation: {
            type: 'animation',
            schemaVersion: 2,
            isAutoplayEnabled: true,
            duration: 8,
            playback: 'loop',
            tracks: {
              translation: [
                { time: 0, value: [0, 0, 0] },
                { time: 2, value: [1, 0, 0] },
                { time: 6, value: [-1, 0, 0] },
                { time: 8, value: [0, 0, 0] }
              ]
            }
          }
        }
      }
    }
  })
  const loader = new EntityLoader(new ModelLoader(loadJson), loadJson)
  const scene = await loader.loadScene('http://localhost/platform.scene.json')

  const platform = scene.entities.Platform
  const animation = Object.values(platform.components).find(isTransformAnimation)
  const body = Object.values(platform.components).find(isBody)

  assert.equal(animation.duration, 8)
  assert.equal(body.motionType, 'kinematic')

  const origin = platform.translation.x

  for (let frame = 0; frame < 120; frame++) {
    scene.update(1 / 60)
  }

  assert.ok(Math.abs(platform.translation.x - origin - 1) < 1e-5)
  platform.animationMixer.pause()
  scene.update(1, false)
  assert.equal(body.linearVelocity.magnitude, 0)

  const pausedTime = platform.animationMixer.animations.Animation.time

  platform.animationMixer.pause()
  scene.update(1, false)
  assert.equal(platform.animationMixer.animations.Animation.time, pausedTime)
  scene.resetSimulation()
  assert.equal(platform.animationMixer.animations.Animation.time, 0)
  assert.equal(platform.translation.x, origin)
})
