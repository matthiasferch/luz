require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { EntityLoader, ModelLoader } = require('@luz/graphics')
const { createDemoAssets } = require('../tooling/demo-assets.cjs')
const { validateDemoAssets } = require('../tooling/validate-demo.cjs')
const { createDemoServer } = require('../tooling/serve-demo.cjs')

test('the rigid body showcase loads without local or external assets and physics resets', async () => {
  const documents = createDemoAssets()
  const readJson = async (url) => {
    const filename = new URL(url).pathname.slice('/assets/'.length)

    assert.ok(Object.hasOwn(documents, filename), `Unexpected asset request: ${url}`)

    return structuredClone(documents[filename])
  }
  const loader = new EntityLoader(new ModelLoader(readJson), readJson)

  validateDemoAssets(documents)
  assert.deepEqual(documents, createDemoAssets())
  assert.deepEqual(
    Object.keys(documents).filter((filename) => filename.endsWith('.scene.json')),
    ['scenes/rigid-body-playground.scene.json']
  )

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
test('demo validation rejects broken references, external assets and malformed scenes', () => {
  const documents = createDemoAssets()

  delete documents['models/floor.model.json']

  assert.throws(() => validateDemoAssets(documents), /Missing demo asset/)

  const externalDocuments = createDemoAssets()

  externalDocuments['scenes/rigid-body-playground.scene.json'].entities.Floor.components.model =
    'https://example.test/private.model.json'

  assert.throws(() => validateDemoAssets(externalDocuments), /Unsupported demo reference/)

  const malformedDocuments = createDemoAssets()

  malformedDocuments['scenes/rigid-body-playground.scene.json'].entities.Camera.components.camera.fieldOfView = -1

  assert.throws(() => validateDemoAssets(malformedDocuments), /Invalid demo asset/)

  const textureDocuments = createDemoAssets()

  textureDocuments['models/ball.model.json'].materials.surface.graph.nodes.texture = {
    type: 'imageTexture',
    surface: { path: 'poliigon/private.png' }
  }

  assert.throws(() => validateDemoAssets(textureDocuments), /procedural geometry and materials/)
})
test('preview serves only its build directory, supports HEAD and returns genuine missing-file responses', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'luz-demo-server-'))
  const server = createDemoServer(directory)

  assert.equal(path.dirname(directory), path.resolve(os.tmpdir()))
  assert.ok(path.basename(directory).startsWith('luz-demo-server-'))

  try {
    await fs.writeFile(path.join(directory, 'index.html'), '<!doctype html><title>luz</title>')

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

    const origin = `http://127.0.0.1:${server.address().port}`
    const response = await fetch(origin)
    const head = await fetch(origin, { method: 'HEAD' })

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
    assert.equal(head.status, 200)
    assert.equal(await head.text(), '')
    assert.ok(head.headers.get('etag'))

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
