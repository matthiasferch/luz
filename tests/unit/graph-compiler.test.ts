import type {
  Surface,
  ColorSpace,
  TextureCompiler,
  Texture,
  RenderBackend,
  Shader,
  Program,
  MaterialGraph,
  MaterialNode
} from '@luz/graphics'
import { createDouble } from '../fixtures/test-double'
import { expect } from 'chai'
import {
  createDefaultMaterialGraph,
  Material,
  MaterialCompiler,
  GraphCompiler,
  PipelineCompiler,
  RenderPipeline
} from '@luz/graphics'

interface TextureCall {
  surface: Surface
  colorSpace?: ColorSpace
}

const createTextureCompiler = (compiledTextures: TextureCall[] = []) =>
  createDouble<TextureCompiler>({
    compile: async (surface, colorSpace) => {
      compiledTextures.push({ surface, colorSpace })

      return createDouble<Texture>({})
    }
  })

const expectRejected = async (promise: Promise<unknown>, message: string) => {
  let failure

  try {
    await promise
  } catch (error) {
    failure = error
  }

  expect(String(failure)).to.contain(message)
}

describe('Material graph compiler', () => {
  it('validates versions, outputs, links, and cycles', async () => {
    const compiler = new GraphCompiler(createTextureCompiler())

    await expectRejected(
      compiler.compile({ version: 2 } as unknown as MaterialGraph),
      'Unsupported material graph version'
    )

    const missing = createDefaultMaterialGraph()

    Reflect.deleteProperty(missing.outputs, 'alpha')

    await expectRejected(compiler.compile(missing), "output 'alpha' is missing")

    const linked = createDefaultMaterialGraph()

    linked.outputs.baseColor = { node: 'missing', output: 'Color' }

    await expectRejected(compiler.compile(linked), "missing node 'missing'")

    const cyclic = createDefaultMaterialGraph()

    cyclic.nodes.a = { type: 'math', inputs: { value1: { node: 'a', output: 'Value' }, value2: { value: 1 } } }
    cyclic.outputs.roughness = { node: 'a', output: 'Value' }

    await expectRejected(compiler.compile(cyclic), 'cycle')
  })
  it('compiles constants, textures, channel conversion, normal maps, and bump maps', async () => {
    const compiledTextures: TextureCall[] = []
    const graph = createDefaultMaterialGraph()

    graph.nodes.uv = { type: 'textureCoordinate' }
    graph.nodes.image = {
      type: 'imageTexture',
      inputs: { vector: { node: 'uv', output: 'UV' } },
      surface: { path: 'material.png', colorSpace: 'sRGB' }
    }
    graph.nodes.normal = {
      type: 'normalMap',
      inputs: { color: { node: 'image', output: 'Color' }, strength: { value: 0.75 } }
    }
    graph.nodes.bump = {
      type: 'bump',
      inputs: { height: { node: 'image', output: 'Alpha' }, normal: { node: 'normal', output: 'Normal' } }
    }
    graph.outputs.baseColor = { node: 'image', output: 'Color' }
    graph.outputs.alpha = { node: 'image', output: 'Alpha' }
    graph.outputs.normal = { node: 'bump', output: 'Normal' }

    const result = await new GraphCompiler(createTextureCompiler(compiledTextures)).compile(graph)

    expect(result.textureCount).to.equal(1)
    expect(compiledTextures[0].surface.path).to.equal('material.png')
    expect(result.source).to.contain('MaterialSample evaluateMaterial')
    expect(result.source).to.contain('luzApplyNormalMap(context')
    expect(result.source).to.contain('luzCalculateBumpNormal(context')
    expect(result.source).to.contain('dFdx(context.worldPosition)')
    expect(result.source).to.not.contain('vec3(-1.0 * -dFdx')
    expect(result.source).to.contain('materialGraphTexture0')
    expect(result.source).to.contain('materialSample.subsurfaceWeight')
    expect(result.source).to.contain('isLogicalFrontFacing = isFrontFaceReversed ? !gl_FrontFacing')
  })
  it('compiles tangent, object, and world-space normal maps', async () => {
    for (const [space, index] of [
      ['TANGENT', 0],
      ['OBJECT', 1],
      ['WORLD', 2]
    ] as const) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.normal = {
        type: 'normalMap',
        inputs: { color: { value: [0.5, 0.5, 1, 1] }, strength: { value: 0.8 } },
        properties: { space }
      }
      graph.outputs.normal = { node: 'normal', output: 'Normal' }

      const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

      expect(result.source).to.contain(`, ${index})`)
    }
  })
  it('compiles subsurface controls and defaults graphs exported before the optional outputs', async () => {
    const weighted = createDefaultMaterialGraph()

    weighted.outputs.subsurfaceWeight = { value: 0.65 }
    weighted.outputs.subsurfaceScale = { value: 0.0075 }

    const weightedResult = await new GraphCompiler(createTextureCompiler()).compile(weighted)

    expect(weightedResult.source).to.contain('materialSample.subsurfaceWeight = clamp(materialGraphValue')
    expect(weightedResult.source).to.contain('materialSample.subsurfaceScale = max(materialGraphValue')

    const unweighted = createDefaultMaterialGraph()

    delete unweighted.outputs.subsurfaceWeight
    delete unweighted.outputs.subsurfaceScale

    const unweightedResult = await new GraphCompiler(createTextureCompiler()).compile(unweighted)

    expect(unweightedResult.source).to.contain('materialSample.subsurfaceWeight = clamp(materialGraphValue')
    expect(unweightedResult.source).to.contain('materialSample.subsurfaceScale = max(materialGraphValue')
  })
  it('compiles weighted Principled and Glossy shader closures', async () => {
    const graph = createDefaultMaterialGraph()

    graph.nodes.factor = { type: 'layerWeight', inputs: { blend: { value: 0.35 } } }
    graph.nodes.gloss = { type: 'rgb', inputs: { value: { value: [0.8, 0.9, 1.0, 1.0] } } }
    graph.surface = {
      type: 'mix',
      factor: { node: 'factor', output: 'Fresnel' },
      firstClosure: { type: 'principled' },
      secondClosure: {
        type: 'glossy',
        color: { node: 'gloss', output: 'Color' },
        roughness: { value: 0.08 },

        // Older exports could contain an explicit zero for an unlinked normal.
        normal: { value: [0, 0, 0] }
      }
    }

    const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

    expect(result.source).to.contain('materialSample.glossyCount = 1')
    expect(result.source).to.contain('materialSample.principledWeight = clamp(')
    expect(result.source).to.contain('materialSample.glossy[0].weight = clamp(')
    expect(result.source).to.contain('materialSample.glossy[0].tangentNormal = luzCalculateSafeTangentNormal(')
    expect(result.source).to.contain('materialSample.tangentNormal = luzCalculateSafeTangentNormal(')
    expect(result.source).to.contain('luzCalculateMaterialWorldNormal(context')
    expect(result.source).to.contain('transpose(mat3(camera.viewMatrix))')
  })
  it('compiles Transparent and Emission closure coverage without a Principled leaf', async () => {
    const graph = createDefaultMaterialGraph()

    graph.surface = {
      type: 'mix',
      factor: { value: 0.6 },
      firstClosure: { type: 'transparent', color: { value: [1, 1, 1, 1] } },
      secondClosure: { type: 'emission', color: { value: [1, 0, 0.02, 1] }, strength: { value: 3 } }
    }

    const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

    expect(result.source).to.contain('materialSample.principledWeight = clamp(0.0')
    expect(result.source).to.contain('materialSample.alpha = clamp(')
    expect(result.source).to.contain('1.0 * clamp(')
    expect(result.source).to.contain('materialSample.emission = (0.0)')
    expect(result.source).to.contain('* materialGraphValue')
  })
  it('adds shader closures at full weight', async () => {
    const graph = createDefaultMaterialGraph()

    graph.surface = {
      type: 'add',
      firstClosure: { type: 'emission', color: { value: [0.1, 1, 0.2, 1] }, strength: { value: 4 } },
      secondClosure: { type: 'glossy', color: { value: [1, 1, 1, 1] }, roughness: { value: 0.15 } }
    }

    const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

    expect(result.source).to.contain('materialSample.glossyCount = 1')
    expect(result.source).to.contain('materialSample.glossy[0].weight = clamp(1.0')
    expect(result.source).to.contain('(1.0 * materialGraphValue')
    expect(result.topology).to.contain('"type":"add"')
  })
  it('adds emission over a transparent mixture without making it opaque', async () => {
    const graph = createDefaultMaterialGraph()

    graph.surface = {
      type: 'add',
      firstClosure: { type: 'emission', color: { value: [0, 1, 0, 1] }, strength: { value: 2 } },
      secondClosure: {
        type: 'mix',
        factor: { value: 0.7 },
        firstClosure: { type: 'emission', color: { value: [0, 0.2, 0, 1] }, strength: { value: 1 } },
        secondClosure: { type: 'transparent', color: { value: [1, 1, 1, 1] } }
      }
    }

    const result = await new GraphCompiler(createTextureCompiler()).compile(graph)
    const alphaAssignment = result.source.split('\n').find((line) => line.includes('materialSample.alpha ='))

    expect(alphaAssignment).to.contain('1.0 - clamp(')
    expect(alphaAssignment).to.not.contain('((1.0) +')
    expect(result.source).to.contain('materialSample.emission = (0.0)')
  })
  it('compiles the supported procedural operations', async () => {
    const cases: Array<[string, Record<string, unknown>, string, string]> = [
      ['value', { value: { value: 0.5 } }, 'Value', 'materialGraphValue'],
      ['rgb', { value: { value: [1, 0, 0, 1] } }, 'Color', 'materialGraphValue'],
      ['textureCoordinate', {}, 'Generated', 'generatedCoordinateMinimum'],
      ['geometry', {}, 'Incoming', 'luzCalculateMaterialWorldViewDirection'],
      ['mapping', { vector: { value: [1, 2, 3] } }, 'Vector', 'luzApplyMapping'],
      ['math', { value1: { value: 1 }, value2: { value: 2 } }, 'Value', '+'],
      ['vectorMath', { vector1: { value: [1, 2, 3] }, vector2: { value: [2, 3, 4] } }, 'Vector', '+'],
      ['mix', { factor: { value: 0.5 }, a: { value: [1, 0, 0, 1] }, b: { value: [0, 1, 0, 1] } }, 'Color', 'mix('],
      ['hueSaturation', { color: { value: [1, 0, 0, 1] } }, 'Color', 'luzApplyHueSaturation'],
      ['brightContrast', { color: { value: [1, 0, 0, 1] } }, 'Color', '/ 100.0'],
      ['gamma', { color: { value: [0.5, 0.25, 1, 1] }, gamma: { value: 2.2 } }, 'Color', 'pow(max('],
      ['invert', { color: { value: [0.5, 0.25, 1, 1] }, factor: { value: 0.5 } }, 'Color', 'vec3(1.0) -'],
      ['rgbToBW', { color: { value: [0.5, 0.25, 1, 1] } }, 'Val', '0.2126'],
      ['separateColor', { color: { value: [0.5, 0.25, 1, 1] } }, 'Red', '.r'],
      ['clamp', { value: { value: 2 }, minimum: { value: 0 }, maximum: { value: 1 } }, 'Result', 'clamp('],
      [
        'mapRange',
        {
          value: { value: 0.5 },
          fromMinimum: { value: 0 },
          fromMaximum: { value: 1 },
          toMinimum: { value: 1 },
          toMaximum: { value: 2 }
        },
        'Result',
        'mix('
      ],
      [
        'colorRamp',
        {
          factor: { value: 0.5 },
          position0: { value: 0.2 },
          color0: { value: [1, 0, 0, 1] },
          position1: { value: 0.7 },
          color1: { value: [0, 0, 1, 0.5] }
        },
        'Color',
        'mix('
      ],
      [
        'rgbCurves',
        {
          factor: { value: 1 },
          color: { value: [0.2, 0.4, 0.6, 1] },
          position0: { value: 0 },
          value0: { value: 0 },
          position1: { value: 0.5 },
          value1: { value: 0.33 },
          position2: { value: 1 },
          value2: { value: 1 }
        },
        'Color',
        'smoothstep('
      ],
      ['separateXYZ', { vector: { value: [1, 2, 3] } }, 'X', '.x'],
      ['combineXYZ', { x: { value: 1 }, y: { value: 2 }, z: { value: 3 } }, 'Vector', 'vec3('],
      ['noiseTexture', { vector: { value: [1, 2, 3] } }, 'Factor', 'luzGenerateFractalNoise'],
      ['noiseTexture', { vector: { value: [1, 2, 3] } }, 'Fac', 'luzGenerateFractalNoise'],
      ['noiseTexture', { vector: { value: [1, 2, 3] }, w: { value: 0.25 } }, 'Factor', 'vec4('],
      ['waveTexture', { vector: { value: [1, 2, 3] }, distortion: { value: 4 } }, 'Factor', 'sin('],
      ['gradientTexture', { vector: { value: [0.25, 0.5, 0.75] } }, 'Factor', '.x'],
      ['ambientOcclusion', { color: { value: [0.2, 0.4, 0.6, 1] } }, 'AO', '1.0'],
      ['checkerTexture', { vector: { value: [1, 2, 3] } }, 'Color', 'floor('],
      ['checkerTexture', { vector: { value: [1, 2, 3] } }, 'Factor', 'floor('],
      [
        'voronoiTexture',
        { vector: { value: [1, 2, 3] }, scale: { value: 5 }, randomness: { value: 1 } },
        'Color',
        'luzCalculateVoronoiColor3D'
      ],
      ['fresnel', { indexOfRefraction: { value: 1.45 } }, 'Factor', 'luzCalculateFresnelDielectric'],
      ['layerWeight', { blend: { value: 0.93 } }, 'Facing', 'context.position'],
      ['vectorRotate', { vector: { value: [1, 2, 3] } }, 'Vector', 'luzRotateAxisAngle']
    ]

    for (const [type, inputs, output, fragment] of cases) {
      const graph = createDefaultMaterialGraph()
      const properties =
        type === 'colorRamp'
          ? { interpolation: 'LINEAR', elementCount: 2 }
          : type === 'rgbCurves'
            ? { pointCount: 3, extensionMode: 'EXTRAPOLATED' }
            : type === 'separateColor'
              ? { mode: 'RGB' }
              : type === 'clamp'
                ? { clampType: 'MINMAX' }
                : type === 'mapRange'
                  ? { dataType: 'FLOAT', interpolation: 'LINEAR', isClampingEnabled: true }
                  : type === 'voronoiTexture'
                    ? { dimensions: '3D', feature: 'F1', distance: 'EUCLIDEAN', isNormalizationEnabled: false }
                    : type === 'waveTexture'
                      ? { waveType: 'RINGS', ringsDirection: 'SPHERICAL', bandsDirection: 'X', waveProfile: 'SIN' }
                      : type === 'gradientTexture'
                        ? { gradientType: 'LINEAR' }
                        : type === 'noiseTexture' && 'w' in inputs
                          ? { dimensions: '4D' }
                          : undefined

      graph.nodes.test = { type, inputs, properties } as MaterialNode
      graph.outputs.baseColor = { node: 'test', output }

      const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

      expect(result.source, type).to.contain(fragment)
    }
  })
  it('compiles ColorRamp interpolation and validates its layout', async () => {
    for (const interpolation of ['CONSTANT', 'LINEAR', 'EASE', 'B_SPLINE'] as const) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.ramp = {
        type: 'colorRamp',
        properties: { interpolation, elementCount: 2 },
        inputs: {
          factor: { value: 0.4 },
          position0: { value: 0.2 },
          color0: { value: [1, 0, 0, 1] },
          position1: { value: 0.7 },
          color1: { value: [0, 0, 1, 0.5] }
        }
      }
      graph.outputs.baseColor = { node: 'ramp', output: 'Color' }
      graph.outputs.alpha = { node: 'ramp', output: 'Alpha' }

      const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

      expect(result.source).to.contain('materialGraphTemporary')
      expect(result.source).to.contain(interpolation === 'CONSTANT' ? '?' : 'mix(')
    }

    const unsupported = createDefaultMaterialGraph()

    Object.assign(unsupported.nodes, {
      ramp: { type: 'colorRamp', properties: { interpolation: 'CARDINAL', elementCount: 2 } }
    })

    unsupported.outputs.baseColor = { node: 'ramp', output: 'Color' }

    await expectRejected(new GraphCompiler(createTextureCompiler()).compile(unsupported), "property 'interpolation'")

    const malformed = createDefaultMaterialGraph()

    malformed.nodes.ramp = { type: 'colorRamp', properties: { interpolation: 'LINEAR', elementCount: 1 } }
    malformed.outputs.baseColor = { node: 'ramp', output: 'Color' }

    await expectRejected(new GraphCompiler(createTextureCompiler()).compile(malformed), 'between 2 and 32 elements')
  })
  it('compiles all Blender 3D F1 Voronoi distance metrics', async () => {
    for (const [distance, metric] of [
      ['EUCLIDEAN', 0],
      ['MANHATTAN', 1],
      ['CHEBYCHEV', 2],
      ['MINKOWSKI', 3]
    ] as const) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.voronoi = {
        type: 'voronoiTexture',
        inputs: {
          vector: { value: [1, 2, 3] },
          scale: { value: 5 },
          randomness: { value: 1 },
          exponent: { value: 3.5 }
        },
        properties: { dimensions: '3D', feature: 'F1', distance, isNormalizationEnabled: true }
      }
      graph.outputs.roughness = { node: 'voronoi', output: 'Distance' }

      const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

      expect(result.source).to.contain(`, ${metric},`)

      if (distance === 'MINKOWSKI') {
        expect(result.source).to.contain('pow(3.0, 1.0 / max(')
      }
    }
  })
  it('compiles Blender 3D Voronoi distance-to-edge output', async () => {
    const graph = createDefaultMaterialGraph()

    graph.nodes.voronoi = {
      type: 'voronoiTexture',
      inputs: {
        vector: { value: [1, 2, 3] },
        scale: { value: 5 },
        randomness: { value: 1 }
      },
      properties: {
        dimensions: '3D',
        feature: 'DISTANCE_TO_EDGE',
        distance: 'EUCLIDEAN',
        isNormalizationEnabled: false
      }
    }
    graph.outputs.roughness = { node: 'voronoi', output: 'Distance' }

    const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

    expect(result.source).to.contain('luzCalculateVoronoiEdgeDistance3D')
  })
  it('compiles 4D F1 Voronoi distance and color outputs', async () => {
    for (const [output, fragment] of [
      ['Distance', 'luzCalculateVoronoiDistance4D'],
      ['Color', 'luzCalculateVoronoiColor4D']
    ] as const) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.voronoi = {
        type: 'voronoiTexture',
        inputs: {
          vector: { value: [1, 2, 3] },
          w: { value: 0.4 },
          scale: { value: 5 },
          randomness: { value: 1 }
        },
        properties: { dimensions: '4D', feature: 'F1', distance: 'EUCLIDEAN', isNormalizationEnabled: true }
      }
      graph.outputs.roughness = { node: 'voronoi', output }

      const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

      expect(result.source).to.contain(fragment)
    }
  })
  it('compiles specular level and volume absorption with topology-safe constants', async () => {
    const graph = createDefaultMaterialGraph()

    graph.outputs.specularLevel = { value: 0.8 }
    graph.nodes.absorptionColor = {
      type: 'rgb',
      inputs: { value: { value: [0.2, 0.6, 0.8, 1] } }
    }
    graph.volume = {
      type: 'absorption',
      color: { node: 'absorptionColor', output: 'Color' },
      density: { value: 0.4 }
    }

    const compiler = new GraphCompiler(createTextureCompiler())
    const result = await compiler.compile(graph)

    expect(result.source).to.contain('materialSample.specularLevel = max(')
    expect(result.source).to.contain('materialSample.absorptionColor = clamp(')
    expect(result.source).to.contain('materialSample.absorptionDensity = max(')

    const sameTopology = structuredClone(graph)

    sameTopology.outputs.specularLevel = { value: 0.2 }
    sameTopology.volume!.density = { value: 2 }

    expect((await compiler.compile(sameTopology)).topology).to.equal(result.topology)

    const unsupported = structuredClone(graph)

    Object.assign(unsupported.volume!, { type: 'Scatter' })

    await expectRejected(compiler.compile(unsupported), "unsupported closure type 'Scatter'")
  })
  it('compiles smooth-step float Map Range nodes', async () => {
    const graph = createDefaultMaterialGraph()

    graph.nodes.range = {
      type: 'mapRange',
      properties: { dataType: 'FLOAT', interpolation: 'SMOOTHSTEP', isClampingEnabled: true },
      inputs: {
        value: { value: 0.5 },
        fromMinimum: { value: 0 },
        fromMaximum: { value: 1 },
        toMinimum: { value: 0 },
        toMaximum: { value: 1 }
      }
    }
    graph.outputs.roughness = { node: 'range', output: 'Result' }

    const result = await new GraphCompiler(createTextureCompiler()).compile(graph)

    expect(result.source).to.contain('smoothstep(0.0, 1.0')
  })
  it('compiles every supported Math, Vector Math, and Mix mode', async () => {
    const operations = [
      'ADD',
      'SUBTRACT',
      'MULTIPLY',
      'DIVIDE',
      'MODULO',
      'ROUND',
      'POWER',
      'SNAP',
      'GREATER_THAN',
      'LESS_THAN',
      'SINE',
      'COSINE',
      'RADIANS'
    ] as const

    for (const operation of operations) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.test = {
        type: 'math',
        properties: { operation },
        inputs: { value1: { value: 1 }, value2: { value: 2 } }
      }
      graph.outputs.roughness = { node: 'test', output: 'Value' }

      expect((await new GraphCompiler(createTextureCompiler()).compile(graph)).source).to.contain(
        'materialGraphTemporary'
      )
    }

    const scale = createDefaultMaterialGraph()

    scale.nodes.test = {
      type: 'vectorMath',
      properties: { operation: 'SCALE' },
      inputs: { vector1: { value: [1, 2, 3] }, scale: { value: 0.005 } }
    }
    scale.outputs.baseColor = { node: 'test', output: 'Vector' }

    expect((await new GraphCompiler(createTextureCompiler()).compile(scale)).source).to.contain(' * materialGraphValue')

    for (const operation of ['ADD', 'MULTIPLY'] as const) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.test = {
        type: 'vectorMath',
        properties: { operation },
        inputs: { vector1: { value: [1, 2, 3] }, vector2: { value: [2, 3, 4] } }
      }
      graph.outputs.baseColor = { node: 'test', output: 'Vector' }

      expect((await new GraphCompiler(createTextureCompiler()).compile(graph)).source).to.contain(
        'materialGraphTemporary'
      )
    }

    for (const blendType of [
      'MIX',
      'MULTIPLY',
      'LIGHTEN',
      'DARKEN',
      'DIFFERENCE',
      'SUBTRACT',
      'SOFT_LIGHT',
      'BURN',
      'HUE',
      'COLOR'
    ] as const) {
      const graph = createDefaultMaterialGraph()

      graph.nodes.test = {
        type: 'mix',
        properties: { blendType },
        inputs: { a: { value: [1, 0, 0, 1] }, b: { value: [0, 1, 0, 1] } }
      }
      graph.outputs.baseColor = { node: 'test', output: 'Color' }

      expect((await new GraphCompiler(createTextureCompiler()).compile(graph)).source).to.contain('mix(')
    }
  })
  it('normalizes topology independently from constants and texture paths', async () => {
    const firstGraph = createDefaultMaterialGraph()

    firstGraph.nodes.image = { type: 'imageTexture', surface: { path: 'a.png' } }
    firstGraph.outputs.baseColor = { node: 'image', output: 'Color' }

    const secondGraph = structuredClone(firstGraph)

    secondGraph.nodes.image.surface!.path = 'b.png'
    secondGraph.outputs.roughness = { value: 0.8 }
    firstGraph.surface = {
      type: 'mix',
      factor: { value: 0.25 },
      firstClosure: { type: 'principled' },
      secondClosure: { type: 'glossy', color: { value: [1, 1, 1, 1] }, roughness: { value: 0.1 } }
    }
    secondGraph.surface = {
      type: 'mix',
      factor: { value: 0.75 },
      firstClosure: { type: 'principled' },
      secondClosure: { type: 'glossy', color: { value: [0.5, 0.5, 0.5, 1] }, roughness: { value: 0.4 } }
    }

    const compiler = new GraphCompiler(createTextureCompiler())

    expect((await compiler.compile(firstGraph)).topology).to.equal((await compiler.compile(secondGraph)).topology)
  })
  it('rejects material texture counts over the configured limit', async () => {
    const graph = createDefaultMaterialGraph()

    graph.nodes.a = { type: 'imageTexture', surface: { path: 'a.png' } }
    graph.nodes.b = { type: 'imageTexture', surface: { path: 'b.png' } }
    graph.nodes.mix = { type: 'mix', inputs: { a: { node: 'a', output: 'Color' }, b: { node: 'b', output: 'Color' } } }
    graph.outputs.baseColor = { node: 'mix', output: 'Color' }

    await expectRejected(new GraphCompiler(createTextureCompiler(), 1).compile(graph), 'exceeding')
  })
  it('shares one pipeline program for materials with the same topology', async () => {
    let programs = 0

    const backend = createDouble<RenderBackend>({
      maximumTextureUnits: 16,
      shaders: {
        create: (stage, source, headers) => Object.assign(createDouble<Shader>({}), { stage, source, headers }),

        destroy: () => {}
      },
      programs: { create: () => Object.assign(createDouble<Program>({}), { id: ++programs }) }
    })
    const pipeline = new RenderPipeline({ vertexShader: 'v', fragmentShader: 'f' })

    new PipelineCompiler(backend, [], []).compile(
      pipeline,
      'void main() {}',
      'void main() { evaluateMaterial(MaterialContext()); }'
    )

    const compiler = new MaterialCompiler(createTextureCompiler())
    const firstMaterial = await compiler.compile(new Material())
    const secondMaterial = await compiler.compile(new Material())

    expect(pipeline.resolveProgram!(firstMaterial)).to.equal(pipeline.resolveProgram!(secondMaterial))
    expect(programs).to.equal(2)
  })
  it('lets the linker determine sampler usage for shared headers and material variants', async () => {
    const linkedSources: string[] = []
    const backend = createDouble<RenderBackend>({
      maximumTextureUnits: 16,
      shaders: {
        create: (stage, source, headers) =>
          Object.assign(createDouble<Shader>({}), { stage, source: [...(headers ?? []), source].join('\n') }),

        destroy: () => {}
      },
      programs: {
        create: (_vertex, fragment) => {
          linkedSources.push((fragment as Shader & { source: string }).source)

          return Object.assign(createDouble<Program>({}), { id: linkedSources.length })
        }
      }
    })
    const sharedHeaders = Array.from({ length: 17 }, (_, index) => `uniform sampler2D unused${index};`)
    const pipeline = new RenderPipeline({ vertexShader: 'v', fragmentShader: 'ambient' })
    const pipelineCompiler = new PipelineCompiler(backend, [], sharedHeaders)

    pipelineCompiler.compile(pipeline, 'void main() {}', 'void main() { evaluateMaterial(MaterialContext()); }')

    const graph = createDefaultMaterialGraph()

    graph.nodes.image = { type: 'imageTexture', surface: { path: 'base.png' } }
    graph.outputs.baseColor = { node: 'image', output: 'Color' }

    const material = await new MaterialCompiler(createTextureCompiler()).compile(new Material({ graph }))
    const variant = pipeline.resolveProgram!(material)

    expect((variant as Program & { id: number }).id).to.equal(2)
    expect(linkedSources[1]).to.contain('uniform sampler2D unused16;')
    expect(linkedSources[1]).to.contain(material.graphSource)
    expect(pipeline.resolveProgram!(material)).to.equal(variant)
    expect(linkedSources).to.have.length(2)

    const fullscreen = new RenderPipeline({ vertexShader: 'v', fragmentShader: 'composite' })

    pipelineCompiler.compile(fullscreen, 'void main() {}', 'void main() {}')
    expect((fullscreen.program as Program & { id: number }).id).to.equal(3)
  })
  it('reports failed links without caching an invalid material variant', async () => {
    let canLink = true

    const backend = createDouble<RenderBackend>({
      maximumTextureUnits: 16,
      shaders: {
        create: () => createDouble<Shader>({}),

        destroy: () => {}
      },
      programs: { create: () => (canLink ? createDouble<Program>({}) : null) }
    })
    const pipeline = new RenderPipeline({ vertexShader: 'v', fragmentShader: 'ambient' })
    const compiler = new PipelineCompiler(backend, [], [])

    compiler.compile(pipeline, 'void main() {}', 'void main() { evaluateMaterial(MaterialContext()); }')

    const material = await new MaterialCompiler(createTextureCompiler()).compile(new Material())

    canLink = false

    expect(() => pipeline.resolveProgram!(material)).to.throw("Failed to link pipeline 'ambient'")

    canLink = true

    expect(pipeline.resolveProgram!(material)).to.be.an('object')

    canLink = false

    expect(() => compiler.compile(pipeline, 'void main() {}', 'void main() {}')).to.throw(
      "Failed to link pipeline 'ambient'"
    )
  })
})
