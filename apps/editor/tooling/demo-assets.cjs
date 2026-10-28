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

const createSphere = () => {
  const vertices = []
  const indices = []
  const longitudeCount = 32
  const latitudeCount = 16

  for (let latitude = 0; latitude <= latitudeCount; latitude++) {
    const v = latitude / latitudeCount
    const angle = v * Math.PI

    for (let longitude = 0; longitude <= longitudeCount; longitude++) {
      const u = longitude / longitudeCount
      const azimuth = u * Math.PI * 2
      const normal = [Math.sin(angle) * Math.cos(azimuth), Math.cos(angle), Math.sin(angle) * Math.sin(azimuth)]

      vertices.push(...normal, ...normal, u, v)
    }
  }

  for (let latitude = 0; latitude < latitudeCount; latitude++) {
    for (let longitude = 0; longitude < longitudeCount; longitude++) {
      const offset = latitude * (longitudeCount + 1) + longitude
      const nextRow = offset + longitudeCount + 1

      if (latitude > 0) {
        indices.push(offset, offset + 1, nextRow)
      }

      if (latitude < latitudeCount - 1) {
        indices.push(offset + 1, nextRow + 1, nextRow)
      }
    }
  }

  return {
    topology: 'triangles',
    vertices: vertices.map((value) => Number(value.toFixed(6))),
    indices,
    material: 'surface'
  }
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
    Key: {
      translation: [-4, 7, 5],
      rotation: createRotation(Math.PI / 4),
      components: {
        light: {
          type: 'light',
          lightType: 'directional',
          range: 30,
          intensity: 3,
          color: [1, 0.88, 0.72],
          shadowSize: [22, 22],
          clipPlanes: [0.1, 40]
        }
      }
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
  const sphere = createSphere()
  const documents = {
    'models/floor.model.json': createModel(box, createMaterial([0.15, 0.19, 0.24], 0.65)),
    'models/cube.model.json': createModel(box, createMetalMaterial()),
    'models/ball.model.json': createModel(sphere, createMaterial([0.95, 0.3, 0.08], 0.25))
  }
  const scene = createStage()

  for (let index = 0; index < 6; index++) {
    const translation = [((index % 3) - 1) * 1.8, 0.65 + Math.floor(index / 3) * 1.35, 0]

    scene.entities[index === 0 ? 'Cuboid' : `Cube ${index + 1}`] = {
      translation,
      scale: [0.6, 0.6, 0.6],
      components: {
        model: '../models/cube.model.json',
        body: {
          type: 'body',
          motionType: 'dynamic',
          mass: 1,
          friction: 0.5,
          restitution: 0.15,
          isContinuousCollisionEnabled: true,
          volume: { type: 'cuboid', extents: [0.6, 0.6, 0.6] }
        }
      }
    }
  }

  for (let index = 0; index < 3; index++) {
    scene.entities[index === 0 ? 'Sphere' : `Ball ${index + 1}`] = {
      translation: [(index - 1) * 1.65, 4.5 + index * 0.8, 0.3],
      scale: [0.7, 0.7, 0.7],
      components: {
        model: '../models/ball.model.json',
        body: {
          type: 'body',
          motionType: 'dynamic',
          mass: 2,
          friction: 0.4,
          restitution: 0.45,
          isContinuousCollisionEnabled: true,
          volume: { type: 'sphere', radius: 0.7 }
        }
      }
    }
  }

  documents['scenes/rigid-body-playground.scene.json'] = scene

  return documents
}

module.exports = { createDemoAssets }
