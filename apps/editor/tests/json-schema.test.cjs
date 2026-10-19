require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Ajv = require('ajv')
const { Scene } = require('@luz/scene')
const { RenderPipeline } = require('@luz/graphics')
const { Body, Biped, Sphere, Cuboid, Ellipsoid, Cylinder, Plane, Ray, Polygon } = require('@luz/physics')
const { Entity } = require('@luz/core')
const { Vector3 } = require('@luz/math')
const { materialNodeLayouts } = require('@luz/formats')

const editorRoot = path.join(__dirname, '..')
const schemaDirectory = path.join(editorRoot, '..', '..', 'packages', 'formats', 'schemas')
const assetDirectories = [
  ...['models', 'animations', 'scenes']
    .map((directory) => path.join(editorRoot, 'public', 'assets', directory))
    .filter((directory) => fs.existsSync(directory)),
  path.join(editorRoot, '../../packages/graphics/rendering/pipelines'),
  path.join(editorRoot, '../../packages/graphics/debug/pipelines')
]

const findJsonFiles = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? findJsonFiles(path.join(directory, entry.name))
        : entry.name.endsWith('.json')
          ? [path.join(directory, entry.name)]
          : []
    )

const findKeyword = (value, keyword, location = '#') => {
  if (!value || typeof value !== 'object') {
    return []
  }

  return Object.entries(value).flatMap(([key, child]) => [
    ...(key === keyword ? [`${location}/${key}`] : []),
    ...findKeyword(child, keyword, `${location}/${key}`)
  ])
}

describe('JSON schemas', () => {
  const schemaFiles = findJsonFiles(schemaDirectory)
  const schemas = schemaFiles.map((file) => ({ file, schema: JSON.parse(fs.readFileSync(file, 'utf8')) }))
  const ajv = new Ajv({ allErrors: true, jsonPointers: true, schemaId: 'auto' })

  for (const { file, schema } of schemas) {
    ajv.addSchema(schema, path.basename(file))
  }

  it('compiles every Draft 7 schema without newer-draft keywords', () => {
    for (const { file, schema } of schemas) {
      assert.equal(schema.$schema, 'http://json-schema.org/draft-07/schema#', path.basename(file))
      assert.deepEqual(findKeyword(schema, '$defs'), [], `${path.basename(file)} uses the post-Draft-7 $defs keyword`)
      assert.ok(ajv.getSchema(path.basename(file)), `could not compile ${path.basename(file)}`)
    }
  })
  it('accepts mesh boundingBox and rejects the previous bounds property', () => {
    const validate = ajv.getSchema('model.schema.json')
    const boundingBox = { minimum: [-1, -2, -3], maximum: [4, 5, 6] }
    const mesh = { topology: 'triangles', vertices: [], boundingBox }

    assert.equal(validate({ type: 'model', meshes: { shape: mesh } }), true, JSON.stringify(validate.errors))
    assert.equal(
      validate({ type: 'model', meshes: { shape: { topology: 'triangles', vertices: [], bounds: boundingBox } } }),
      false
    )
    assert.ok(validate.errors.some((error) => error.params.additionalProperty === 'bounds'))
  })
  it('validates and round-trips default and configured scene simulation settings', async () => {
    const validate = ajv.getSchema('scene.schema.json')
    const configuredScene = await Scene.deserialize({
      entities: {},
      linearDamping: 0.3,
      angularDamping: 0.4,
      fixedTimeStep: 1 / 120,
      maximumSubsteps: 8,
      synchronizationPolicy: 'retain'
    })

    assert.equal(configuredScene.synchronizationPolicy, 'retain')

    for (const scene of [new Scene(), configuredScene]) {
      const document = JSON.parse(JSON.stringify(scene.serialize()))

      assert.equal(document.synchronizationPolicy, scene.synchronizationPolicy)
      assert.equal('catchUpPolicy' in document, false)
      assert.ok(validate(document), ajv.errorsText(validate.errors))

      const restored = await Scene.deserialize(document)

      assert.deepEqual(restored.serialize(), document)
    }

    for (const settings of [
      { linearDamping: -1 },
      { angularDamping: -1 },
      { fixedTimeStep: 0 },
      { maximumSubsteps: 0 },
      { maximumSubsteps: 1.5 },
      { synchronizationPolicy: 'invalid' }
    ]) {
      const document = { entities: {}, ...settings }

      assert.equal(validate(document), false)

      await assert.rejects(Scene.deserialize(document), /damping|fixed-step/)
    }
  })
  it('validates complete pipeline serialization and rejects unsupported pipeline fields', async () => {
    const validate = ajv.getSchema('pipeline.schema.json')
    const pipeline = await RenderPipeline.deserialize({
      vertexShader: 'scene.vertex.glsl',
      fragmentShader: 'scene.fragment.glsl',
      colorMask: [true, false, true, false]
    })
    const document = JSON.parse(JSON.stringify(pipeline.serialize()))

    assert.ok(validate(document), ajv.errorsText(validate.errors))
    assert.deepEqual((await RenderPipeline.deserialize(document)).serialize(), document)

    for (const property of [
      'clearColor',
      'clearDepth',
      'clearStencil',
      'polygonOffset',
      'polygonOffsetFactor',
      'polygonOffsetUnits',
      'program'
    ]) {
      assert.equal(validate({ ...document, [property]: 1 }), false)
    }

    assert.equal(validate({ ...document, clearStencil: 1.5 }), false)
  })
  it('requires explicit body motion types and positive dynamic mass', () => {
    for (const type of ['body', 'biped']) {
      const validate = ajv.getSchema(`${type}.schema.json`)
      const body = { type, volume: { type: 'sphere' } }

      assert.equal(validate(body), false)
      assert.equal(validate({ ...body, motionType: 'auto', mass: 1 }), false)
      assert.equal(validate({ ...body, motionType: 'dynamic', mass: 0 }), false)
      assert.equal(validate({ ...body, motionType: 'dynamic', mass: 1 }), true)
      assert.equal(validate({ ...body, motionType: 'dynamic' }), true)

      for (const motionType of ['static', 'kinematic']) {
        assert.equal(validate({ ...body, motionType, mass: 0 }), true)
        assert.equal(validate({ ...body, motionType, mass: 1 }), true)
      }
    }
  })
  it('validates inherited body settings and collision filters in complete scene round-trips', async () => {
    const scene = new Scene()

    scene.colliders.ground = new Plane()
    scene.colliders.ray = new Ray()
    scene.colliders.polygon = new Polygon({
      vertices: [new Vector3([0, 0, 0]), new Vector3([1, 0, 0]), new Vector3([0, 0, 1])]
    })

    for (const BodyClass of [Body, Biped]) {
      for (const VolumeClass of [Sphere, Cuboid, Ellipsoid, Cylinder]) {
        const body = new BodyClass()
        const entity = new Entity()

        body.volume = new VolumeClass()
        body.volume.collisionGroup = 2
        body.volume.collisionMask = 4
        body.friction = 0.7
        body.restitution = 0.4
        body.isContinuousCollisionEnabled = true
        entity.components.body = body
        scene.entities[`${BodyClass.name}${VolumeClass.name}`] = entity
      }
    }

    const document = JSON.parse(JSON.stringify(scene.serialize()))
    const validate = ajv.getSchema('scene.schema.json')

    assert.ok(validate(document), ajv.errorsText(validate.errors))

    const reloadedScene = await Scene.deserialize(document)

    assert.deepEqual(reloadedScene.serialize(), document)
  })
  it('validates volume discriminators and the dimensions used by their runtime decoders', () => {
    const validate = ajv.getSchema('volume.schema.json')

    for (const definition of [
      {},
      { type: 'unknown' },
      { type: 'sphere', radius: 0 },
      { type: 'sphere', radius: [1, 1, 1] },
      { type: 'cuboid', extents: [1, 1] },
      { type: 'ellipsoid', radius: [1, -1, 1] },
      { type: 'cylinder', axisIndex: 3 }
    ]) {
      assert.equal(validate(definition), false)
    }
  })
  it('keeps material node schema inputs and properties aligned with the shared contract', () => {
    const schema = schemas.find(({ file }) => path.basename(file) === 'material.schema.json').schema
    const variants = schema.definitions.node.oneOf

    assert.equal(variants.length, Object.keys(materialNodeLayouts).length)

    for (const [type, layout] of Object.entries(materialNodeLayouts)) {
      const variant = variants.find((variant) => variant.properties.type.const === type)

      assert.ok(variant)
      assert.deepEqual(Object.keys(variant.properties.inputs.properties), [...layout.inputs])
      assert.deepEqual(Object.keys(variant.properties.properties.properties), Object.keys(layout.properties))
      assert.equal(variant.properties.inputs.additionalProperties, false)
      assert.equal(variant.properties.properties.additionalProperties, false)

      for (const [name, rule] of Object.entries(layout.properties)) {
        assert.deepEqual(
          variant.properties.properties.properties[name],
          Array.isArray(rule) ? { type: 'string', enum: rule } : { type: rule }
        )
      }
    }
  })
  it('requires explicit light types and positive directional shadow dimensions', () => {
    const validate = ajv.getSchema('light.schema.json')
    const light = { type: 'light', range: 6, intensity: 1, color: [1, 1, 1] }

    assert.equal(validate(light), false)
    assert.equal(validate({ ...light, lightType: 'area' }), false)
    assert.equal(validate({ ...light, lightType: 'spot', coneAngle: 90, coneFalloff: 10 }), true)
    assert.equal(validate({ ...light, lightType: 'spot' }), false)
    assert.equal(validate({ ...light, lightType: 'spot', coneAngle: 90 }), false)
    assert.equal(validate({ ...light, lightType: 'spot', coneFalloff: 10 }), false)
    assert.equal(validate({ ...light, lightType: 'point' }), true)
    assert.equal(validate({ ...light, lightType: 'directional', shadowSize: [20, 12] }), true)
    assert.equal(validate({ ...light, lightType: 'directional', shadowSize: [0, 12] }), false)
    assert.equal(validate({ ...light, lightType: 'directional', shadowSize: [20] }), false)

    for (const lightType of ['point', 'directional']) {
      assert.equal(validate({ ...light, lightType, coneAngle: 90 }), false)
      assert.equal(validate({ ...light, lightType, coneFalloff: 10 }), false)
    }
  })
  it('validates every catalogued scene, model and render pipeline', () => {
    for (const file of assetDirectories.flatMap(findJsonFiles)) {
      const document = JSON.parse(fs.readFileSync(file, 'utf8'))

      if (typeof document.$schema !== 'string') {
        continue
      }

      const referencedFile = path.resolve(path.dirname(file), document.$schema)
      const schemaFile =
        path.dirname(referencedFile) === path.join(editorRoot, 'public', 'schemas')
          ? path.join(schemaDirectory, path.basename(referencedFile))
          : referencedFile

      assert.ok(fs.existsSync(schemaFile), `${path.relative(editorRoot, file)} references missing ${document.$schema}`)

      const validate = ajv.getSchema(path.basename(schemaFile))

      assert.ok(validate, `no validator found for ${path.basename(schemaFile)}`)
      assert.ok(
        validate(document),
        `${path.relative(editorRoot, file)}: ${ajv.errorsText(validate.errors, { separator: '\n' })}`
      )
    }
  })
})
