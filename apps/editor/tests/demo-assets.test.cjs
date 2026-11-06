require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { Vector3 } = require('@luz/math')
const { EntityLoader, EnvironmentLoader, ImageLoader, ModelLoader, isModel } = require('@luz/graphics')
const { AnimationController } = require('../src/runtime/animation-controller.ts')
const { SimulationController } = require('../src/runtime/simulation-controller.ts')
const { createDemoAssets, readDemoGeometry } = require('../tooling/demo-assets.cjs')
const { readDemoTextures } = require('../tooling/demo-textures.cjs')
const { validateDemoAssets } = require('../tooling/validate-demo.cjs')
const { createDemoServer } = require('../tooling/serve-demo.cjs')

test('the rigid body showcase starts physics on load and preserves manual reset', async () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const readJson = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)

    assert.ok(Object.hasOwn(documents, filename), `Unexpected asset request: ${url}`)

    return structuredClone(documents[filename])
  }
  const geometry = readDemoGeometry()
  const readBinary = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)
    const contents = geometry[filename]

    assert.ok(contents, `Unexpected geometry request: ${url}`)

    return contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength)
  }
  const loader = new EntityLoader(new ModelLoader(readJson, readBinary), readJson)

  validateDemoAssets(documents, textures, readDemoGeometry())
  assert.deepEqual(documents, createDemoAssets())
  assert.deepEqual(
    Object.keys(documents).filter((filename) => filename.endsWith('.scene.json')),
    ['scenes/rigid-body-playground.scene.json', 'scenes/sala-character.scene.json', 'scenes/light-chamber.scene.json']
  )

  const material = documents['models/playground-cuboid.model.json'].materials.surface

  assert.equal(material.graph.nodes.baseColor.surface.colorSpace, 'sRGB')
  assert.equal(material.graph.nodes.normalTexture.surface.colorSpace, 'linear')
  assert.equal(material.graph.nodes.normal.type, 'normalMap')
  assert.equal(material.graph.nodes.normal.properties.space, 'TANGENT')
  assert.equal(material.graph.outputs.normal.node, 'normal')

  for (const output of ['baseColor', 'metallic', 'roughness']) {
    const texture = material.graph.nodes[material.graph.outputs[output].node].surface

    assert.ok(Object.hasOwn(textures, texture.path))
    assert.equal(texture.areMipmapsEnabled, true)
  }

  for (const document of Object.values(documents).filter(
    (document) => document.type === 'model' && !document.geometry
  )) {
    for (const mesh of Object.values(document.meshes)) {
      assert.equal(mesh.vertices.length % 8, 0)

      for (let offset = 0; offset < mesh.vertices.length; offset += 8) {
        assert.ok(
          Math.abs(Math.hypot(...mesh.vertices.slice(offset + 3, offset + 6)) - 1) < 0.00001,
          'Vertex normals use the engine position/normal/UV layout'
        )
      }

      assert.ok(mesh.indices.every((index) => index >= 0 && index < mesh.vertices.length / 8))

      for (let offset = 0; offset < mesh.indices.length; offset += 3) {
        const triangle = mesh.indices
          .slice(offset, offset + 3)
          .map((index) => mesh.vertices.slice(index * 8, index * 8 + 6))
        const edgeA = Vector3.subtract(new Vector3(triangle[1].slice(0, 3)), new Vector3(triangle[0].slice(0, 3)))
        const edgeB = Vector3.subtract(new Vector3(triangle[2].slice(0, 3)), new Vector3(triangle[0].slice(0, 3)))
        const normal = new Vector3(triangle[0].slice(3))

        assert.ok(
          Vector3.calculateDotProduct(Vector3.calculateCrossProduct(edgeA, edgeB), normal) > 0,
          'Triangle winding agrees with outward normals'
        )
      }
    }
  }

  const scene = await loader.loadScene('https://example.test/assets/scenes/rigid-body-playground.scene.json')
  const simulation = new SimulationController({ timeScale: 1, gravity: null })

  simulation.applyImportedState(scene)
  assert.equal(simulation.isRunning, true)
  scene.selectCamera()
  scene.update(0)

  const ball = scene.entities.Sphere
  const initialHeight = ball.translation.y
  const platform = scene.entities.Platform
  const initialPlatformPosition = [...platform.translation]
  const animationController = new AnimationController(scene)
  const [animationGroup] = animationController.collectGroups()
  const platformMotion = platform.animationMixer.animations.Timeline
  const dynamicEntities = Object.entries(scene.entities).filter(
    ([, entity]) => entity.components.Body?.motionType === 'dynamic'
  )
  const initialPositions = new Map(dynamicEntities.map(([name, entity]) => [name, [...entity.translation]]))
  const floor = scene.entities.Floor.components.Body.volume
  const floorExtent = floor.extents.x
  const platformExtent = platform.components.Body.volume.extents.x

  let minimumPlatformPosition = platform.translation.x
  let maximumPlatformPosition = platform.translation.x

  assert.equal(platform.components.Body.motionType, 'kinematic')
  assert.equal(animationGroup.clips.length, 1)
  assert.equal(animationGroup.clips[0].isPlaying, true, 'Platform animation starts on load')
  assert.equal(platformMotion.playbackMode, 'loop')
  assert.equal(platformMotion.duration, 8)
  assert.deepEqual([...new Set(dynamicEntities.map(([, entity]) => entity.components.Body.volume.type))].sort(), [
    'cuboid',
    'sphere'
  ])

  for (let frame = 0; frame < 600; frame++) {
    scene.update(simulation.timeScale / 60, simulation.isRunning)

    minimumPlatformPosition = Math.min(minimumPlatformPosition, platform.translation.x)
    maximumPlatformPosition = Math.max(maximumPlatformPosition, platform.translation.x)

    assert.ok(Math.abs(platform.translation.x) + platformExtent < floorExtent, 'Platform stays fully over the floor')

    for (const [name, entity] of dynamicEntities) {
      assert.ok([...entity.translation, ...entity.rotation].every(Number.isFinite), `${name} stays finite`)

      const isOverFloor =
        Math.abs(entity.translation.x - floor.center.x) <= floor.extents.x &&
        Math.abs(entity.translation.z - floor.center.z) <= floor.extents.z

      if (isOverFloor) {
        assert.ok(entity.translation.y > 0.15, `${name} stays above the floor while supported`)
      }
    }

    for (const name of ['Cuboid', 'Block']) {
      const box = scene.entities[name]

      assert.ok(Math.abs(box.translation.x - platform.translation.x) < 0.2, `${name} follows the moving platform`)
      assert.ok(Math.abs(box.translation.y - initialPositions.get(name)[1]) < 0.08, `${name} stays stacked`)
    }

    if ((frame + 1) % 120 === 0) {
      const expectedPosition = [0, 5.5, 0, -5.5][((frame + 1) / 120 - 1) % 4]

      assert.ok(Math.abs(platform.translation.x - expectedPosition) < 0.0001)
    }
  }

  assert.equal(platformMotion.state, 'playing', 'Platform keeps playing beyond the first loop')
  assert.ok(Math.abs(platformMotion.time - 2) < 0.0001, 'Platform wraps its eight-second animation')
  assert.ok(minimumPlatformPosition - platformExtent < -floorExtent + 0.21, 'Platform reaches the left edge')
  assert.ok(maximumPlatformPosition + platformExtent > floorExtent - 0.21, 'Platform reaches the right edge')
  assert.ok(ball.translation.y < initialHeight - 1, 'Ball falls when simulation runs')
  assert.ok(ball.translation.z > floor.center.z + floor.extents.z, 'Ball rolls beyond the finite floor')
  assert.ok(ball.translation.y < 0, 'Ball falls after rolling off the edge')
  animationController.control(animationGroup.key, 'pause')

  const pausedPlatformPosition = [...platform.translation]

  scene.update(1 / 60, simulation.isRunning)
  assert.deepEqual([...platform.translation], pausedPlatformPosition, 'Animation controls pause the platform')
  simulation.reset(scene)
  assert.deepEqual([...platform.translation], initialPlatformPosition)
  assert.equal(platformMotion.time, 0)
  scene.update(1 / 60, simulation.isRunning)
  assert.equal(simulation.isRunning, false)
  assert.equal(ball.translation.y, initialHeight)

  for (const [name, entity] of dynamicEntities) {
    assert.deepEqual([...entity.translation], initialPositions.get(name), `${name} resets to its starting position`)
  }

  const reloadedScene = await loader.loadScene('https://example.test/assets/scenes/rigid-body-playground.scene.json')

  simulation.applyImportedState(reloadedScene)
  assert.equal(simulation.isRunning, true, 'Loading another scene starts physics even after a reset')
})
test('the playground preserves beveled normals and unstretched Blender texture coordinates', () => {
  const documents = createDemoAssets()
  const geometry = readDemoGeometry()

  for (const name of ['platform', 'cuboid', 'block']) {
    const model = documents[`models/playground-${name}.model.json`]
    const contents = geometry[`models/${model.geometry.uri}`]
    const descriptor = model.meshes.shape.vertices
    const vertices = Array.from({ length: descriptor.count }, (_value, index) =>
      Array.from({ length: 8 }, (_component, component) =>
        contents.readFloatLE(descriptor.byteOffset + index * descriptor.byteStride + component * 4)
      )
    )

    assert.ok(vertices.length > 24, `${name} includes the bevel geometry`)
    assert.ok(
      vertices.some((vertex) => vertex.slice(3, 6).filter((value) => Math.abs(value) > 0.01).length > 1),
      `${name} retains interpolated bevel normals`
    )

    for (const vertex of vertices) {
      assert.ok(Math.abs(Math.hypot(...vertex.slice(3, 6)) - 1) < 0.00001)
    }

    const topVertices = vertices.filter((vertex) => Math.abs(vertex[4] - 1) < 0.000001)
    const origin = topVertices[0]

    assert.ok(topVertices.length >= 4, `${name} retains its flat top`)

    for (const vertex of topVertices) {
      const distance = Math.hypot(vertex[0] - origin[0], vertex[2] - origin[2])
      const textureDistance = Math.hypot(vertex[6] - origin[6], vertex[7] - origin[7])

      assert.ok(Math.abs(distance - textureDistance) < 0.00001, `${name} uses one texture tile per meter`)
    }
  }

  geometry['models/playground-platform.geometry'][16] ^= 1

  assert.throws(
    () => validateDemoAssets(documents, readDemoTextures(), geometry),
    /does not match the approved manifest/
  )
})
test('the character showcase loads shared clips and keeps both meshes synchronized through playback', async () => {
  const documents = createDemoAssets()
  const geometry = readDemoGeometry()
  const requests = new Map()
  const readJson = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)

    assert.ok(Object.hasOwn(documents, filename), `Unexpected character request: ${url}`)
    requests.set(filename, (requests.get(filename) ?? 0) + 1)

    return structuredClone(documents[filename])
  }

  const readBinary = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)
    const contents = geometry[filename]

    assert.ok(contents, `Unexpected geometry request: ${url}`)

    return contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength)
  }
  const loader = new EntityLoader(new ModelLoader(readJson, readBinary), readJson)
  const scene = await loader.loadScene('https://example.test/assets/scenes/sala-character.scene.json')
  const controller = new AnimationController(scene)
  const groups = controller.collectGroups()
  const models = [...scene.entities.Character.iterateEntries('Character')].flatMap(([, entity]) =>
    Object.values(entity.components).filter(isModel)
  )

  assert.equal(groups.length, 1)
  assert.equal(groups[0].clips.length, 12)
  assert.equal(models.length, 2)
  assert.deepEqual(
    groups[0].clips.filter(({ isPlaying }) => isPlaying).map(({ name }) => name),
    ['Walking']
  )
  assert.equal(groups[0].clips.find(({ name }) => name === 'Walking').playback, 'loop')

  for (const [filename, count] of requests) {
    if (filename.startsWith('animations/')) {
      assert.equal(count, 1, 'Both skinned meshes share one download per clip')
    }
  }

  scene.selectCamera()
  scene.update(0)

  const initialPose = [...models[0].boneMatrices]

  scene.update(0.5, false)
  assert.notDeepEqual([...models[0].boneMatrices], initialPose, 'Walking animates without starting physics')

  const walkingDuration = models[0].animations.Walking.duration

  scene.update(walkingDuration * 2, false)

  for (const model of models) {
    assert.equal(model.animations.Walking.state, 'playing', 'Walking continues beyond the end of the clip')
    assert.ok(Math.abs(model.animations.Walking.time - 0.5) < 0.00001, 'Walking wraps on each loop')
    assert.equal(model.animations.Idle.state, 'stopped')
  }

  controller.control(groups[0].key, 'pause')

  const pausedPose = [...models[0].boneMatrices]

  scene.update(0.5, false)
  assert.deepEqual([...models[0].boneMatrices], pausedPose)
  controller.seek(groups[0].key, 0)
  scene.update(0.5, true)

  for (const model of models) {
    assert.equal(model.animations.Walking.time, 0, 'Reset rewinds and pauses animation even while physics runs')
    assert.equal(model.animations.Walking.weight, 1, 'Reset preserves the selected animation')
  }

  controller.control(groups[0].key, 'resume')
  scene.update(0.25, true)
  assert.equal(models[0].animations.Walking.time, 0.25)

  for (const clip of groups[0].clips) {
    controller.setMix(groups[0].key, { [clip.name]: 1 }, 0.2, true)
    scene.update(0.5, false)

    for (const model of models) {
      assert.ok([...model.boneMatrices].every(Number.isFinite), clip.name)
      assert.equal(model.animations[clip.name].weight, 1)
      assert.equal(model.animations[clip.name].time, models[0].animations[clip.name].time)
    }
  }

  controller.control(groups[0].key, 'stop')
  assert.ok(controller.collectGroups()[0].clips.every(({ isPlaying }) => !isPlaying))
})
test('the light chamber loads independently and loops its spotlight through a visible sweep', async () => {
  const documents = createDemoAssets()
  const readJson = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)

    assert.ok(filename.includes('chamber'), `The chamber does not load another scene's models: ${filename}`)

    return structuredClone(documents[filename])
  }
  const scene = await new EntityLoader(new ModelLoader(readJson), readJson).loadScene(
    'https://example.test/assets/scenes/light-chamber.scene.json'
  )
  const controller = new AnimationController(scene)
  const [group] = controller.collectGroups()
  const spotlight = scene.entities['Sweeping spotlight'].components.light
  const skylight = scene.entities.Skylight.components.light
  const animation = scene.entities['Sweeping spotlight'].animationMixer.animations['Spotlight sweep']

  scene.selectCamera()
  scene.update(0, false)

  const initialDirection = [...spotlight.direction]

  assert.equal(group.clips.length, 1)
  assert.equal(group.clips[0].isPlaying, true)
  assert.equal(animation.playbackMode, 'loop')

  for (const light of [skylight, spotlight]) {
    assert.ok(light.direction.y > 0.3, 'Light points down into the gallery')
    assert.ok(light.volumetricIntensity > 0 && light.volumetricDensity > 0, 'Light contributes visible scattering')
  }

  scene.update(animation.duration / 4, false)

  const firstDirection = [...spotlight.direction]

  scene.update(animation.duration / 2, false)

  const oppositeDirection = [...spotlight.direction]

  assert.ok(
    Math.hypot(...firstDirection.map((value, index) => value - oppositeDirection[index])) > 0.4,
    'The spotlight changes direction rather than just rolling around its beam'
  )
  scene.update(animation.duration / 4, false)
  assert.ok(Math.hypot(...initialDirection.map((value, index) => value - spotlight.direction[index])) < 0.00001)
  assert.equal(animation.state, 'playing')
  controller.control(group.key, 'pause')

  const pausedDirection = [...spotlight.direction]

  scene.update(1, false)
  assert.deepEqual([...spotlight.direction], pausedDirection)
  controller.control(group.key, 'resume')
  scene.update(1, false)
  assert.notDeepEqual([...spotlight.direction], pausedDirection)

  const camera = scene.entities.Camera.components.camera

  camera.aspect = 390 / 844

  scene.update(0, false)

  const sculpturePosition = scene.entities['Orbit sculpture'].translation

  for (const x of [-1.08, 1.08]) {
    for (const y of [-1.08, 1.08]) {
      for (const z of [-1.08, 1.08]) {
        const position = camera.viewMatrix.transformVector3(
          new Vector3([sculpturePosition.x + x, sculpturePosition.y + y, sculpturePosition.z + z])
        )
        const halfHeight = -position.z * Math.tan((camera.fieldOfView * Math.PI) / 360)

        assert.ok(position.z < 0, 'Sculpture is in front of the camera')
        assert.ok(Math.abs(position.x) < halfHeight * camera.aspect, 'Sculpture fits a portrait viewport horizontally')
        assert.ok(Math.abs(position.y) < halfHeight, 'Sculpture fits a portrait viewport vertically')
      }
    }
  }
})
test('the bundled studio loads HDR lighting and roughness mips separately from the black sky', async () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const baseUrl = 'https://example.test/assets/scenes/rigid-body-playground.scene.json'
  const imageLoader = new ImageLoader({
    baseUrl,
    decodeImage: async () => assert.fail('The studio environment should use prefiltered KTX cubemaps'),

    readBinary: async (url) => {
      const filename = new URL(url).pathname.slice('/assets/'.length)
      const contents = textures[filename]

      assert.ok(contents, `Unexpected environment request: ${url}`)

      return contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength)
    }
  })
  const environment = await new EnvironmentLoader(imageLoader).load(
    documents['scenes/rigid-body-playground.scene.json'].environment
  )

  for (const source of [environment.radiance, environment.irradiance, environment.sky]) {
    assert.equal(source.kind, 'ktx')
    assert.equal(source.container.numberOfFaces, 6)
    assert.equal(source.container.glInternalFormat, 0x881a)
  }

  assert.equal(environment.radiance.container.pixelWidth, 128)
  assert.equal(environment.radiance.container.numberOfMipmapLevels, 8)
  assert.equal(environment.irradiance.container.pixelWidth, 32)
  assert.equal(environment.irradiance.container.numberOfMipmapLevels, 1)
  assert.ok(
    environment.radiance.container.levels[0].faces.some((face) => {
      const values = new Uint16Array(face.buffer, face.byteOffset, face.byteLength / 2)

      return values.some((value, index) => index % 4 !== 3 && value > 0x3c00 && value < 0x7c00)
    }),
    'The studio retains HDR highlights above one'
  )
  assert.equal(environment.sky.container.pixelWidth, 1)

  for (const face of environment.sky.container.levels[0].faces) {
    assert.deepEqual([...new Uint16Array(face.buffer, face.byteOffset, 4)], [0, 0, 0, 0x3c00])
  }
})
test('demo validation rejects broken references, external assets and malformed scenes', () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const geometry = readDemoGeometry()

  delete documents['models/floor.model.json']

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /Missing demo asset/)

  const externalDocuments = createDemoAssets()

  externalDocuments['scenes/rigid-body-playground.scene.json'].entities.Floor.components.model =
    'https://example.test/private.model.json'

  assert.throws(() => validateDemoAssets(externalDocuments, textures, geometry), /Unsupported demo reference/)

  const malformedDocuments = createDemoAssets()

  malformedDocuments['scenes/rigid-body-playground.scene.json'].entities.Camera.components.Camera.fieldOfView = -1

  assert.throws(() => validateDemoAssets(malformedDocuments, textures, geometry), /Invalid demo asset/)

  const textureDocuments = createDemoAssets()

  textureDocuments['models/playground-sphere.model.json'].materials.surface.graph.nodes.texture = {
    type: 'imageTexture',
    surface: { path: 'poliigon/private.png' }
  }

  assert.throws(() => validateDemoAssets(textureDocuments, textures, geometry), /Missing approved demo texture/)
  assert.throws(() => validateDemoAssets(createDemoAssets(), {}, geometry), /Missing approved demo texture/)
  assert.throws(
    () => validateDemoAssets(createDemoAssets(), { ...textures, 'textures/private.jpg': Buffer.from('unapproved') }),
    /Unsupported demo texture/
  )

  textures['textures/galvanizedMetal/normal.jpg'] = Buffer.from('modified')

  assert.throws(() => validateDemoAssets(createDemoAssets(), textures), /does not match the licensed source/)
})
test('demo validation rejects missing or external environment maps', () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const geometry = readDemoGeometry()

  delete textures['environments/studio/radiance.ktx']

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /Missing approved demo environment/)

  documents['scenes/rigid-body-playground.scene.json'].environment.sky = 'https://example.test/private.ktx'

  assert.throws(
    () => validateDemoAssets(documents, readDemoTextures(), geometry),
    /Unsupported demo environment reference/
  )
})
test('demo validation rejects missing, external and altered character dependencies', () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const geometry = readDemoGeometry()
  const model = documents['models/character-surface.model.json']
  const idleReference = model.animations.Idle
  const idlePath = path.posix.normalize(path.posix.join('models', idleReference))
  const idleDocument = documents[idlePath]

  assert.throws(() => validateDemoAssets(documents, textures), /Missing demo geometry/)

  delete documents[idlePath]

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /Missing demo animation/)

  documents[idlePath] = idleDocument
  model.animations.Idle = 'https://example.test/private.animation.json'

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /Unsupported demo animation reference/)

  model.animations.Idle = idleReference
  model.geometry.uri = '../private.geometry'

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /Unsupported demo geometry reference/)

  model.geometry.uri = 'character-surface.geometry'
  model.geometry.byteLength += 1

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /Incorrect demo geometry length/)

  model.geometry.byteLength -= 1
  geometry['models/character-surface.geometry'][0] ^= 1

  assert.throws(() => validateDemoAssets(documents, textures, geometry), /does not match the approved manifest/)
})
test('preview serves only its build directory, supports HEAD and returns genuine missing-file responses', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'luz-demo-server-'))
  const server = createDemoServer(directory)

  assert.equal(path.dirname(directory), path.resolve(os.tmpdir()))
  assert.ok(path.basename(directory).startsWith('luz-demo-server-'))

  try {
    await fs.writeFile(path.join(directory, 'index.html'), '<!doctype html><title>luz</title>')

    const texture = readDemoTextures()['textures/galvanizedMetal/baseColor.jpg']

    await fs.writeFile(path.join(directory, 'texture.jpg'), texture)

    await fs.writeFile(path.join(directory, 'sky.ktx'), readDemoTextures()['environments/studio/sky.ktx'])

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

    const origin = `http://127.0.0.1:${server.address().port}`
    const response = await fetch(origin)
    const head = await fetch(origin, { method: 'HEAD' })

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.equal(head.status, 200)
    assert.equal(await head.text(), '')
    assert.ok(head.headers.get('etag'))

    const textureResponse = await fetch(origin + '/texture.jpg')

    assert.equal(textureResponse.status, 200)
    assert.equal(textureResponse.headers.get('content-type'), 'image/jpeg')
    assert.deepEqual(Buffer.from(await textureResponse.arrayBuffer()), texture)

    const environmentResponse = await fetch(origin + '/sky.ktx', { method: 'HEAD' })

    assert.equal(environmentResponse.status, 200)
    assert.equal(environmentResponse.headers.get('content-type'), 'image/ktx')

    for (const route of ['/missing.js', '/__luz/scenes', '/local-assets/private.png', '/%2e%2e%5cpackage.json']) {
      const missing = await fetch(origin + route)

      assert.equal(missing.status, 404, route)
      assert.equal(await missing.text(), '')
    }

    assert.equal((await fetch(origin, { method: 'POST' })).status, 405)
  } finally {
    server.closeAllConnections()

    await new Promise((resolve) => server.close(resolve))

    await fs.rm(directory, { recursive: true, force: true })
  }
})
