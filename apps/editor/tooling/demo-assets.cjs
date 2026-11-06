const { readCharacterDocuments, readCharacterGeometry } = require('./demo-character.cjs')
const { readPlaygroundDocuments, readPlaygroundGeometry } = require('./demo-playground.cjs')
const { createLightChamberAssets } = require('./light-chamber.cjs')

const createMaterial = (color, roughness, metallic = 0) => ({
  graph: {
    version: 1,
    nodes: {},
    outputs: Object.fromEntries(
      Object.entries({
        baseColor: color,
        alpha: 1,
        normal: [0, 0, 1],
        metallic,
        roughness,
        occlusion: 1,
        emissionColor: [0, 0, 0],
        emissionStrength: 0,
        transmission: 0,
        indexOfRefraction: 1.5
      }).map(([name, value]) => [name, { value }])
    )
  }
})

const createMetalMaterial = () => {
  const material = createMaterial([1, 1, 1], 0.3, 1)
  const createTexture = (name, colorSpace = 'linear') => ({
    type: 'imageTexture',
    surface: {
      path: `textures/galvanizedMetal/${name}.jpg`,
      format: 'color',
      colorSpace,
      tiling: 'repeat',
      filtering: 'trilinear',
      areMipmapsEnabled: true
    }
  })

  material.graph.nodes = {
    baseColor: createTexture('baseColor', 'sRGB'),
    metallic: createTexture('metallic'),
    roughness: createTexture('roughness'),
    normalTexture: createTexture('normal'),
    normal: {
      type: 'normalMap',
      inputs: { color: { node: 'normalTexture', output: 'Color' }, strength: { value: 1 } },
      properties: { space: 'TANGENT' }
    }
  }
  material.graph.outputs.baseColor = { node: 'baseColor', output: 'Color' }
  material.graph.outputs.metallic = { node: 'metallic', output: 'Color' }
  material.graph.outputs.roughness = { node: 'roughness', output: 'Color' }
  material.graph.outputs.normal = { node: 'normal', output: 'Normal' }

  return material
}

const createBox = () => {
  const vertices = []
  const indices = []
  const faces = [
    [
      [1, 0, 0],
      [0, 0, -1],
      [0, 1, 0]
    ],
    [
      [-1, 0, 0],
      [0, 0, 1],
      [0, 1, 0]
    ],
    [
      [0, 1, 0],
      [1, 0, 0],
      [0, 0, -1]
    ],
    [
      [0, -1, 0],
      [1, 0, 0],
      [0, 0, 1]
    ],
    [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0]
    ],
    [
      [0, 0, -1],
      [-1, 0, 0],
      [0, 1, 0]
    ]
  ]

  for (const [normal, horizontal, vertical] of faces) {
    const offset = vertices.length / 8

    for (const [u, v] of [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1]
    ]) {
      const position = normal.map(
        (value, index) => value + (u * 2 - 1) * horizontal[index] + (v * 2 - 1) * vertical[index]
      )

      vertices.push(...position, ...normal, u, v)
    }

    indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3)
  }

  return { topology: 'triangles', vertices, indices, material: 'surface' }
}

const createModel = (mesh, material) => ({ type: 'model', materials: { surface: material }, meshes: { shape: mesh } })

const createRotation = (angle) => [Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)]

const createStage = () => ({
  gravity: [0, -9.81, 0],
  environment: {
    sky: '../environments/studio/sky.ktx',
    radiance: '../environments/studio/radiance.ktx',
    irradiance: '../environments/studio/irradiance.ktx',
    rotation: 0
  },
  entities: {
    Camera: {
      translation: [0, 7, 15],
      rotation: createRotation(Math.PI / 2 - Math.atan2(5.5, 15)),
      components: { camera: { type: 'camera', fieldOfView: 48, clipPlanes: [0.1, 80] } }
    },
    Fill: {
      translation: [4, 4, 3],
      components: { light: { type: 'light', lightType: 'point', range: 20, intensity: 22, color: [0.35, 0.65, 1] } }
    },
    Rim: {
      translation: [-3, 3, -4],
      components: { light: { type: 'light', lightType: 'point', range: 16, intensity: 18, color: [1, 0.4, 0.2] } }
    },
    Floor: {
      translation: [0, -0.25, 0],
      scale: [7, 0.25, 5],
      components: {
        model: '../models/floor.model.json',
        body: { type: 'body', motionType: 'static', friction: 0.65, volume: { type: 'cuboid', extents: [7, 0.25, 5] } }
      }
    }
  }
})

const createDemoAssets = () => {
  const box = createBox()
  const documents = {
    ...readPlaygroundDocuments(),
    ...readCharacterDocuments(),
    'models/floor.model.json': createModel(box, createMaterial([0.15, 0.19, 0.24], 0.65))
  }

  documents['scenes/sala-character.scene.json'] = createCharacterScene()

  Object.assign(documents, createLightChamberAssets({ box, createMaterial, createMetalMaterial }))

  return documents
}

const createCharacterScene = () => {
  const scene = createStage()

  scene.entities.Camera.translation = [0, 1.65, 4.5]
  scene.entities.Camera.rotation = createRotation(Math.PI / 2 - Math.atan2(0.7, 4.5))
  scene.entities.Floor.translation = [0, -0.1, 0]
  scene.entities.Floor.scale = [2.5, 0.1, 2.5]

  delete scene.entities.Floor.components.body

  scene.entities.Fill.components.light.intensity = 3
  scene.entities.Rim.components.light.intensity = 2
  scene.entities.Character = {
    rotation: [Math.SQRT1_2, 0, 0, Math.SQRT1_2],
    scale: [0.01, 0.01, 0.01],
    children: {
      Joints: { components: { model: '../models/character-joints.model.json' } },
      Surface: { components: { model: '../models/character-surface.model.json' } }
    }
  }

  return scene
}

const readDemoGeometry = () => ({ ...readCharacterGeometry(), ...readPlaygroundGeometry() })

module.exports = { createDemoAssets, readDemoGeometry }
