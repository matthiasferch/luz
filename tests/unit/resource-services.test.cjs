require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { ImageLoader, EnvironmentLoader, EntityLoader, ModelManager, Model, Mesh } = require('@luz/graphics')
const { Entity } = require('@luz/core')
const { Scene } = require('@luz/scene')
const { createBackend } = require('../fixtures/renderer-backend.cjs')

it('resolves environment references relative to a scene without GPU compilation', async () => {
  const loader = new EntityLoader()
  const scene = await loader.loadSceneData(
    {
      entities: {},
      environment: { sky: '../maps/sky.hdr', irradiance: 'diffuse.ktx', radiance: '/maps/specular.ktx', rotation: 0.5 }
    },
    'https://assets.test/scenes/room.scene.json'
  )

  assert.deepEqual(scene.environment, {
    sky: 'https://assets.test/maps/sky.hdr',
    irradiance: 'https://assets.test/scenes/diffuse.ktx',
    radiance: 'https://assets.test/maps/specular.ktx',
    rotation: 0.5
  })
})
it('retries failed image requests and prevents cancelled requests from evicting new sources', async () => {
  const image = { width: 1, height: 1 }
  const requests = []

  let rejectSource

  const loader = new ImageLoader({
    baseUrl: 'https://assets.test/maps/',
    decodeImage: async () => image,

    readBinary: (url) => {
      requests.push(url)

      if (requests.length === 1) {
        return Promise.reject(new Error('transport failed'))
      }

      if (requests.length === 2) {
        return new Promise((_resolve, reject) => {
          rejectSource = reject
        })
      }

      return Promise.resolve(new ArrayBuffer(0))
    }
  })

  await assert.rejects(loader.loadSource('sky.png'), /transport failed/)

  const staleRequest = loader.loadSource('sky.png')
  const staleAssertion = assert.rejects(staleRequest, /stale transport/)

  loader.beginReload()

  const replacement = await loader.loadSource('sky.png')

  rejectSource(new Error('stale transport'))

  await staleAssertion
  assert.equal(await loader.loadSource('sky.png'), replacement)
  assert.equal(replacement.image, image)
  assert.deepEqual(requests, Array(3).fill('https://assets.test/maps/sky.png'))
  loader.clear()
})
it('shares decoded images between material textures and environment assembly', async () => {
  const image = { width: 1, height: 1 }
  const requests = []
  const images = new ImageLoader({
    baseUrl: 'https://assets.test/maps/',
    decodeImage: async () => image,

    readBinary: async (url) => {
      requests.push(url)

      return new ArrayBuffer(0)
    }
  })
  const environments = new EnvironmentLoader(images)
  const materialImage = images.loadImage('shared.png')
  const definition = { irradiance: 'shared.png', radiance: './shared.png', sky: 'sky.png', rotation: 0.5 }
  const pendingEnvironment = environments.load(definition)

  definition.rotation = 1

  const environment = await pendingEnvironment

  assert.equal(environment.irradiance.image, await materialImage)
  assert.equal(environment.radiance, environment.irradiance)
  assert.equal(environment.sky.image, image)
  assert.equal(environment.rotation, 0.5)
  assert.deepEqual(requests, ['https://assets.test/maps/shared.png', 'https://assets.test/maps/sky.png'])

  const withoutSky = await environments.load({ irradiance: 'shared.png', radiance: 'shared.png', sky: '' })

  assert.equal(withoutSky.sky, undefined)
  assert.equal(withoutSky.rotation, 0)
  assert.equal(requests.length, 2)
  images.clear()
})
it('retries a failed environment image without refetching its successful companions', async () => {
  const requests = []

  let isSkyAvailable = false

  const images = new ImageLoader({
    baseUrl: 'https://assets.test/',
    decodeImage: async () => ({ width: 1, height: 1 }),

    readBinary: async (url) => {
      requests.push(url)

      if (url.endsWith('sky.png') && !isSkyAvailable) {
        throw new Error('sky unavailable')
      }

      return new ArrayBuffer(0)
    }
  })
  const environments = new EnvironmentLoader(images)
  const definition = { irradiance: 'diffuse.png', radiance: 'specular.png', sky: 'sky.png' }

  await assert.rejects(environments.load(definition), /sky unavailable/)

  isSkyAvailable = true

  const environment = await environments.load(definition)

  assert.equal(environment.sky.kind, 'image')
  assert.deepEqual(requests, [
    'https://assets.test/diffuse.png',
    'https://assets.test/specular.png',
    'https://assets.test/sky.png',
    'https://assets.test/sky.png'
  ])
  images.clear()
})
it('decodes HDR and KTX sources without invoking the host image decoder', async () => {
  const header = new TextEncoder().encode('#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 1 +X 1\n')
  const hdrBytes = new Uint8Array(header.length + 12)

  hdrBytes.set(header)
  hdrBytes.set([2, 2, 0, 1, 129, 128, 129, 128, 129, 128, 129, 129], header.length)

  const ktxBytes = new Uint8Array(72)

  ktxBytes.set([0xab, 0x4b, 0x54, 0x58, 0x20, 0x31, 0x31, 0xbb, 0x0d, 0x0a, 0x1a, 0x0a])

  const headerValues = [0x04030201, 0x1401, 1, 0x1908, 0x8058, 0x1908, 1, 1, 0, 0, 1, 1, 0, 4]
  const view = new DataView(ktxBytes.buffer)

  headerValues.forEach((value, index) => view.setUint32(12 + index * 4, value, true))
  ktxBytes.set([255, 128, 64, 255], 68)

  const images = new ImageLoader({
    baseUrl: 'https://assets.test/',
    decodeImage: async () => {
      throw new Error('unexpected host decoding')
    },

    readBinary: async (url) => (url.includes('.HDR') ? hdrBytes.buffer : ktxBytes.buffer)
  })
  const hdrSource = await images.loadSource('light.HDR?version=1')
  const ktxSource = await images.loadSource('surface.ktx#level')

  assert.equal(hdrSource.kind, 'hdr')
  assert.equal(hdrSource.width, 1)
  assert.equal(hdrSource.height, 1)
  assert.deepEqual([...hdrSource.data], [186, 186, 186, 255])
  assert.equal(ktxSource.kind, 'ktx')
  assert.equal(ktxSource.container.pixelWidth, 1)
  assert.deepEqual([...ktxSource.container.levels[0].faces[0]], [255, 128, 64, 255])
  images.clear()
})
it('shares compiled model assets and keeps them alive until the final scene releases them', async () => {
  const backend = createBackend()
  const resources = new ModelManager(backend, {
    resolveSurface: async () => {
      throw new Error('unexpected image')
    },

    readJson: async () => ({ type: 'model', meshes: { triangle: { vertices: [0, 0, 0, 0, 0, 0, 0, 1] } } })
  })
  const firstModel = await resources.load('https://assets.test/model.json')
  const secondModel = await resources.load('https://assets.test/model.json')
  const firstScene = new Scene()
  const secondScene = new Scene()

  firstScene.entities.model = new Entity()
  firstScene.entities.model.components.model = firstModel
  secondScene.entities.model = new Entity()
  secondScene.entities.model.components.model = secondModel

  const firstPrimitive = resources.compiler.requireCompiledModel(firstModel).primitives.triangle
  const secondPrimitive = resources.compiler.requireCompiledModel(secondModel).primitives.triangle

  assert.equal(firstPrimitive, secondPrimitive)
  resources.releaseScene(firstScene)
  assert.ok(backend.allocations.has(secondPrimitive))
  resources.releaseScene(secondScene)
  assert.equal(backend.allocations.size, 0)
  resources.destroy()
  resources.destroy()

  await assert.rejects(resources.load('https://assets.test/model.json'), { name: 'AbortError' })
})
it('releases prepared models when another model in the scene fails compilation', async () => {
  const backend = createBackend()
  const resources = new ModelManager(backend, {
    resolveSurface: async () => {
      throw new Error('unexpected image')
    }
  })
  const scene = new Scene()
  const failedMesh = new Mesh({ vertices: [0, 0, 0, 0, 0, 0, 0, 1] })
  const successfulModel = new Model({ meshes: { triangle: new Mesh({ vertices: [0, 0, 0, 0, 0, 0, 0, 1] }) } })
  const failedModel = new Model({ meshes: { triangle: failedMesh } })
  const createPrimitive = backend.primitives.create

  scene.entities.success = new Entity()
  scene.entities.success.components.model = successfulModel
  scene.entities.failure = new Entity()
  scene.entities.failure.components.model = failedModel
  backend.primitives.create = (mesh, material) => {
    if (mesh === failedMesh) {
      throw new Error('mesh allocation failed')
    }

    return createPrimitive(mesh, material)
  }

  await assert.rejects(resources.prepareScene(scene), /mesh allocation failed/)
  assert.equal(backend.allocations.size, 0)
  assert.throws(() => resources.compiler.requireCompiledModel(successfulModel), /not been compiled/)
  resources.destroy()
})
