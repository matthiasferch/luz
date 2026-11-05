const createAimRotation = (position, target) => {
  const [x, y, z] = target.map((value, index) => value - position[index])
  const yaw = Math.atan2(-x, -z)
  const pitch = Math.PI / 2 + Math.atan2(y, Math.hypot(x, z))

  return [
    Math.cos(yaw / 2) * Math.sin(pitch / 2),
    Math.sin(yaw / 2) * Math.cos(pitch / 2),
    -Math.sin(yaw / 2) * Math.sin(pitch / 2),
    Math.cos(yaw / 2) * Math.cos(pitch / 2)
  ]
}

const createRing = () => {
  const vertices = []
  const indices = []
  const segmentCount = 64
  const sideCount = 12

  for (let segment = 0; segment <= segmentCount; segment++) {
    const angle = (segment / segmentCount) * Math.PI * 2

    for (let side = 0; side <= sideCount; side++) {
      const profileAngle = (side / sideCount) * Math.PI * 2
      const radius = 0.95 + 0.13 * Math.cos(profileAngle)

      vertices.push(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        0.13 * Math.sin(profileAngle),
        Math.cos(profileAngle) * Math.cos(angle),
        Math.cos(profileAngle) * Math.sin(angle),
        Math.sin(profileAngle),
        segment / segmentCount,
        side / sideCount
      )
    }
  }

  for (let segment = 0; segment < segmentCount; segment++) {
    for (let side = 0; side < sideCount; side++) {
      const index = segment * (sideCount + 1) + side
      const nextRow = index + sideCount + 1

      indices.push(index, nextRow, index + 1, index + 1, nextRow, nextRow + 1)
    }
  }

  return { topology: 'triangles', vertices, indices, material: 'surface' }
}

const createConcrete = (createMaterial) => {
  const material = createMaterial([0.2, 0.21, 0.22], 0.85)

  material.graph.nodes = {
    coordinates: { type: 'geometry' },
    mottling: {
      type: 'noiseTexture',
      inputs: { vector: { node: 'coordinates', output: 'Position' }, scale: { value: 1.4 }, detail: { value: 2 } }
    },
    pigment: {
      type: 'mix',
      inputs: {
        factor: { node: 'mottling', output: 'Fac' },
        a: { value: [0.12, 0.13, 0.14] },
        b: { value: [0.23, 0.24, 0.25] }
      },
      properties: { dataType: 'RGBA', blendType: 'MIX' }
    },
    grain: {
      type: 'noiseTexture',
      inputs: { vector: { node: 'coordinates', output: 'Position' }, scale: { value: 9 }, detail: { value: 2 } }
    },
    relief: {
      type: 'bump',
      inputs: { height: { node: 'grain', output: 'Fac' }, strength: { value: 0.18 }, distance: { value: 0.025 } }
    }
  }
  material.graph.outputs.baseColor = { node: 'pigment', output: 'Result' }
  material.graph.outputs.normal = { node: 'relief', output: 'Normal' }

  return material
}

const createLightChamberAssets = ({ box, createMaterial, createMetalMaterial }) => {
  const documents = {}
  const cameraPosition = [3.9, 2.3, 4.5]
  const sunlightPosition = [-6, 10, -4]
  const spotlightPosition = [3.3, 4.4, -3.8]
  const scene = {
    environment: {
      sky: '../environments/studio/sky.ktx',
      radiance: '../environments/studio/radiance.ktx',
      irradiance: '../environments/studio/sky.ktx',
      rotation: 0
    },
    entities: {
      Camera: {
        translation: cameraPosition,
        rotation: createAimRotation(cameraPosition, [0.7, 2, -1.9]),
        components: { camera: { type: 'camera', fieldOfView: 64, clipPlanes: [0.1, 50] } }
      },
      Skylight: {
        translation: sunlightPosition,
        rotation: createAimRotation(sunlightPosition, [0, 0, 0]),
        components: {
          light: {
            type: 'light',
            lightType: 'spot',
            range: 20,
            intensity: 6,
            coneAngle: 55,
            coneFalloff: 6,
            color: [1, 0.8, 0.52],
            clipPlanes: [0.2, 22],
            softness: 0.8,
            volumetricIntensity: 0.7,
            volumetricDensity: 0.045,
            volumetricAnisotropy: 0.15,
            volumetricNoiseScale: 0.65,
            volumetricNoiseSpeed: 0.08,
            volumetricNoiseStrength: 0.3
          }
        }
      },
      'Sweeping spotlight': {
        translation: spotlightPosition,
        rotation: createAimRotation(spotlightPosition, [0.3, 1.3, -1.3]),
        components: {
          light: {
            type: 'light',
            lightType: 'spot',
            range: 12,
            intensity: 5,
            coneAngle: 28,
            coneFalloff: 8,
            clipPlanes: [0.15, 18],
            color: [0.46, 0.68, 1],
            softness: 0.5,
            volumetricIntensity: 0.22,
            volumetricDensity: 0.025,
            volumetricAnisotropy: 0.2,
            volumetricNoiseScale: 0.9,
            volumetricNoiseSpeed: 0.08,
            volumetricNoiseStrength: 0.25
          },
          'Spotlight sweep': {
            type: 'animation',
            schemaVersion: 2,
            playback: 'loop',
            isAutoplayEnabled: true,
            duration: 16,
            tracks: {
              rotation: Array.from({ length: 65 }, (_value, index) => {
                const angle = Math.sin((index / 32) * Math.PI) * 0.3

                return { time: index / 4, value: [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)] }
              })
            }
          }
        }
      },
      'Entrance bounce': {
        translation: [1, 3.7, 6],
        rotation: createAimRotation([1, 3.7, 6], [0, 1, -2]),
        components: {
          light: {
            type: 'light',
            lightType: 'spot',
            range: 22,
            intensity: 0.65,
            coneAngle: 105,
            coneFalloff: 25,
            clipPlanes: [0.1, 25],
            color: [0.55, 0.66, 0.85],
            softness: 2
          }
        }
      }
    }
  }
  const concrete = createConcrete(createMaterial)
  const charcoal = createMaterial([0.025, 0.032, 0.04], 0.65)
  const createBlocks = (name, filename, blocks, material = concrete) => {
    const vertices = []
    const indices = []

    for (const [position, scale] of blocks) {
      const offset = vertices.length / 8

      for (let index = 0; index < box.vertices.length; index += 8) {
        vertices.push(
          ...position.map((value, axis) => value + box.vertices[index + axis] * scale[axis]),
          ...box.vertices.slice(index + 3, index + 8)
        )
      }

      indices.push(...box.indices.map((index) => index + offset))
    }

    documents[`models/chamber-${filename}.model.json`] = {
      type: 'model',
      materials: { surface: material },
      meshes: { shape: { topology: 'triangles', vertices, indices, material: 'surface' } }
    }
    scene.entities[name] = { components: { model: `../models/chamber-${filename}.model.json` } }
  }

  createBlocks('Floor slabs', 'floor', [
    [
      [0, -0.3, 1],
      [5.2, 0.18, 6.2]
    ],
    ...Array.from({ length: 30 }, (_value, index) => [
      [-4 + (index % 5) * 2, -0.12, -4 + Math.floor(index / 5) * 2],
      [0.991, 0.12, 0.991]
    ])
  ])
  createBlocks('Gallery walls', 'walls', [
    [
      [0, 2.5, -5.15],
      [5.2, 2.5, 0.15]
    ],
    [
      [-5.15, 2.5, 0],
      [0.15, 2.5, 5]
    ],
    [
      [5.15, 2.5, -1],
      [0.15, 2.5, 4]
    ]
  ])
  createBlocks('Roof frame', 'roof', [
    [
      [-4.85, 5.1, 0],
      [0.35, 0.15, 5.2]
    ],
    [
      [2, 5.1, 0],
      [3.2, 0.15, 5.2]
    ],
    [
      [-2.85, 5.1, -4.65],
      [1.65, 0.15, 0.55]
    ],
    [
      [-2.85, 5.1, 3.65],
      [1.65, 0.15, 1.55]
    ]
  ])
  createBlocks(
    'Skylight slats',
    'slats',
    Array.from({ length: 5 }, (_value, index) => [
      [-2.85, 5.15, -3.9 + index * 1.45],
      [1.65, 0.22, 0.28]
    ]),
    charcoal
  )
  createBlocks(
    'Wall joints',
    'joints',
    Array.from({ length: 6 }, (_value, index) => [
      [-4 + index * 1.6, 2.5, -4.985],
      [0.008, 2.5, 0.008]
    ]),
    charcoal
  )
  createBlocks('Display steps', 'steps', [
    [
      [1, 0.1, -1.6],
      [1.8, 0.1, 1.7]
    ],
    [
      [1, 0.27, -1.9],
      [1.5, 0.07, 1.4]
    ]
  ])
  createBlocks(
    'Sculpture plinth',
    'plinth',
    [
      [
        [1, 0.55, -1.9],
        [0.75, 0.21, 0.75]
      ]
    ],
    charcoal
  )
  createBlocks(
    'Gallery bench',
    'bench',
    [
      [
        [-2.8, 0.6, 2.6],
        [1.25, 0.09, 0.4]
      ],
      [
        [-3.65, 0.25, 2.6],
        [0.12, 0.25, 0.32]
      ],
      [
        [-1.95, 0.25, 2.6],
        [0.12, 0.25, 0.32]
      ]
    ],
    charcoal
  )

  documents['models/chamber-ring.model.json'] = {
    type: 'model',
    materials: { surface: createMetalMaterial() },
    meshes: { shape: createRing() }
  }
  scene.entities['Orbit sculpture'] = {
    translation: [1, 1.84, -1.9],
    children: {
      'Outer ring': { components: { model: '../models/chamber-ring.model.json' } },
      'Crossing ring': {
        rotation: [0, Math.sin(Math.PI / 3), 0, Math.cos(Math.PI / 3)],
        components: { model: '../models/chamber-ring.model.json' }
      }
    }
  }
  documents['scenes/light-chamber.scene.json'] = scene

  return documents
}

module.exports = { createLightChamberAssets }
