require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { EntityLoader, EnvironmentLoader, ImageLoader, ModelLoader } = require('@luz/graphics')
const { createDemoAssets } = require('../tooling/demo-assets.cjs')
const { readDemoTextures } = require('../tooling/demo-textures.cjs')
const { validateDemoAssets } = require('../tooling/validate-demo.cjs')
const { createDemoServer } = require('../tooling/serve-demo.cjs')

test('the rigid body showcase loads with bundled assets and physics resets', async () => {
  const documents = createDemoAssets()
  const textures = readDemoTextures()
  const readJson = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)

    assert.ok(Object.hasOwn(documents, filename), `Unexpected asset request: ${url}`)

    return structuredClone(documents[filename])
  }
  const loader = new EntityLoader(new ModelLoader(readJson), readJson)

  validateDemoAssets(documents, textures)
  assert.deepEqual(documents, createDemoAssets())
  assert.deepEqual(
    Object.keys(documents).filter((filename) => filename.endsWith('.scene.json')),
    ['scenes/rigid-body-playground.scene.json']
  )

  const material = documents['models/cube.model.json'].materials.surface

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

  for (const document of Object.values(documents).filter((document) => document.type === 'model')) {
    for (const mesh of Object.values(document.meshes)) {
      assert.equal(mesh.vertices.length % 8, 0)

      for (let offset = 0; offset < mesh.vertices.length; offset += 8) {
        assert.ok(
          Math.abs(Math.hypot(...mesh.vertices.slice(offset + 3, offset + 6)) - 1) < 0.00001,
          'Vertex normals use the engine position/normal/UV layout'
        )
      }

      assert.ok(mesh.indices.every((index) => index >= 0 && index < mesh.vertices.length / 8))
    }
  }

  const scene = await loader.loadScene('https://example.test/assets/scenes/rigid-body-playground.scene.json')

  scene.selectCamera()
  scene.update(0)

  const ball = scene.entities.Sphere
  const initialHeight = ball.translation.y

  for (let frame = 0; frame < 120; frame++) {
    scene.update(1 / 60)
  }

  assert.ok(ball.translation.y < initialHeight - 1, 'Ball falls when simulation runs')
  assert.ok(ball.translation.y > 0.5, 'Ball remains above the floor')
  scene.resetSimulation()
  assert.equal(ball.translation.y, initialHeight)
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

  delete documents['models/floor.model.json']

  assert.throws(() => validateDemoAssets(documents, textures), /Missing demo asset/)

  const externalDocuments = createDemoAssets()

  externalDocuments['scenes/rigid-body-playground.scene.json'].entities.Floor.components.model =
    'https://example.test/private.model.json'

  assert.throws(() => validateDemoAssets(externalDocuments, textures), /Unsupported demo reference/)

  const malformedDocuments = createDemoAssets()

  malformedDocuments['scenes/rigid-body-playground.scene.json'].entities.Camera.components.camera.fieldOfView = -1

  assert.throws(() => validateDemoAssets(malformedDocuments, textures), /Invalid demo asset/)

  const textureDocuments = createDemoAssets()

  textureDocuments['models/ball.model.json'].materials.surface.graph.nodes.texture = {
    type: 'imageTexture',
    surface: { path: 'poliigon/private.png' }
  }

  assert.throws(() => validateDemoAssets(textureDocuments, textures), /Missing approved demo texture/)
  assert.throws(() => validateDemoAssets(createDemoAssets()), /Missing approved demo texture/)
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

  delete textures['environments/studio/radiance.ktx']

  assert.throws(() => validateDemoAssets(documents, textures), /Missing approved demo environment/)

  documents['scenes/rigid-body-playground.scene.json'].environment.sky = 'https://example.test/private.ktx'

  assert.throws(() => validateDemoAssets(documents, readDemoTextures()), /Unsupported demo environment reference/)
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
