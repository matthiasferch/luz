import type { RenderBackend, RenderModel, Program, QueueContext, RenderBatch, CullMode } from '@luz/graphics'
import { createDouble } from '../fixtures/test-double'
import { expect } from 'chai'
import { Light, Camera, Transform } from '@luz/core'
import { Model } from '@luz/graphics'
import { FrameRenderer, RenderPipeline, RenderQueue } from '@luz/graphics'

describe('RenderQueue', () => {
  it('refreshes shared shadows for each light before transparent lighting', () => {
    const renderer = new FrameRenderer(createDouble<RenderBackend>({}), () => {
      throw new Error('Unexpected model')
    })
    const lights = ['point', 'spot', 'directional'].map((lightType) => Object.assign(new Light(), { lightType }))
    const shadow = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const lighting = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const transparent = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const draws: string[] = []
    const batch = {
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: { glass: { material: { alphaMode: 'blend' } } }
      }),
      transform: new Transform(),
      meshes: ['glass']
    }

    renderer.renderQueue = (_queue, pipeline, context) => {
      const light =
        context.light ?? lights.find((light) => light.shadowCameras.some((camera) => camera === context.camera))
      const stage = pipeline === shadow ? 'shadow' : pipeline === lighting ? 'lighting' : 'transparent'

      draws.push(`${light!.lightType} ${stage}`)
    }

    renderer.renderFrame(
      { shadowMapping: shadow, lighting, transparent },
      { camera: new Camera(), target: { width: 300, height: 200 }, time: 0 },
      lights.map((light) => ({ light, entities: [] })),
      [],
      [batch]
    )
    expect(draws).to.deep.equal(
      ['lighting', 'transparent'].flatMap((stage) =>
        lights.flatMap((light) => [
          ...Array.from({ length: light.isPoint ? 6 : 1 }, () => `${light!.lightType} shadow`),
          `${light!.lightType} ${stage}`
        ])
      )
    )
  })
  it('renders six point shadow faces into isolated atlas viewports before lighting', () => {
    const renderer = new FrameRenderer(createDouble<RenderBackend>({}), () => {
      throw new Error('Unexpected model')
    })
    const light = new Light()
    const shadow = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const lighting = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const target = { width: 302, height: 203 }
    const draws: Array<{ pipeline: RenderPipeline; context: QueueContext }> = []

    light.lightType = 'point'
    renderer.renderQueue = (_queue, pipeline, context) => draws.push({ pipeline, context })

    renderer.renderFrame(
      { shadowMapping: shadow, lighting },
      { camera: new Camera(), target, time: 0 },
      [{ light, entities: [] }],
      [],
      []
    )
    expect(draws).to.have.length(7)

    for (let face = 0; face < 6; face++) {
      const viewport = { x: (face % 3) * 100, y: Math.floor(face / 3) * 100, width: 100, height: 100 }

      expect(draws[face].pipeline).to.equal(shadow)
      expect(draws[face].context.camera).to.equal(light.shadowCameras[face])
      expect(draws[face].context.target.viewport).to.deep.equal(viewport)
      expect(draws[face].context.scissor).to.deep.equal(viewport)
    }

    expect(draws[6].pipeline).to.equal(lighting)
    expect(draws[6].context.target).to.equal(target)
    expect(draws[6].context.scissor).to.equal(undefined)
  })
  it('draws volume only for opted-in lights immediately after their shadow maps', () => {
    const renderer = new FrameRenderer(createDouble<RenderBackend>({}), () => {
      throw new Error('Unexpected resolution')
    })
    const shadow = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const volume = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const enabledLight = { isVisible: true, volumetricIntensity: 1, volumetricDensity: 0.1, intensity: 1, range: 5 }
    const lights = [
      { ...enabledLight, volumetricIntensity: 0 },
      enabledLight,
      { ...enabledLight, volumetricDensity: 0 },
      { ...enabledLight, intensity: 0 },
      { ...enabledLight, range: 0 },
      { ...enabledLight, range: 0, lightType: 'directional' }
    ].map((definition) => Object.assign(new Light(), definition))
    const draws: string[] = []

    renderer.renderQueue = (_queue, pipeline, context) =>
      draws.push(
        pipeline === shadow
          ? `shadow ${lights.findIndex((light) => light.shadowCamera === context.camera)}`
          : `volume ${lights.indexOf(context.light!)}`
      )

    renderer.renderFrame(
      { shadowMapping: shadow, volumetricLighting: volume },
      { camera: new Camera(), target: { width: 1, height: 1 }, time: 0 },
      lights.map((light) => ({ light, entities: [] })),
      [],
      [],
      {
        volumetricBatches: [{ model: createDouble<RenderModel>({ source: new Model() }), transform: new Transform() }]
      }
    )
    expect(draws).to.deep.equal([
      'shadow 0',
      'shadow 1',
      'volume 1',
      'shadow 2',
      'shadow 3',
      'shadow 4',
      'shadow 5',
      'volume 5'
    ])
  })
  it('brackets stage rendering even when a draw throws', () => {
    const renderer = new FrameRenderer(createDouble<RenderBackend>({}), () => {
      throw new Error('Unexpected resolution')
    })
    const stages: string[] = []

    renderer.renderQueue = () => {
      throw new Error('draw failed')
    }

    expect(() =>
      renderer.renderFrame(
        { ambient: new RenderPipeline({ vertexShader: '', fragmentShader: '' }) },
        { camera: new Camera(), target: { width: 1, height: 1 }, time: 0 },
        [],
        [],
        [],
        {
          onStageRendering: (stage) => stages.push(`begin ${stage}`),

          onStageRendered: (stage) => stages.push(`end ${stage}`)
        }
      )
    ).to.throw('draw failed')
    expect(stages).to.deep.equal(['begin ambient', 'end ambient'])
  })
  it('sorts transparent layers globally from back to front', () => {
    const queue = new RenderQueue()
    const makeBatch = (depth: number, name: string) => ({
      depth,
      transform: new Transform(),
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: {
          [name]: {
            material: {}
          }
        }
      }),
      meshes: [name]
    })

    const nearBatch = makeBatch(2, 'near')
    const farBatch = makeBatch(9, 'far')
    const middle = makeBatch(5, 'middle')

    queue.batches.push(nearBatch, farBatch, middle)
    queue.sortBackToFront()
    expect(queue.batches).to.deep.equal([farBatch, middle, nearBatch])
  })
  it('prepares a fresh transmission snapshot for each sorted layer', () => {
    const renderedDepths: number[] = []
    const preparedDepths: number[] = []
    const scissors: unknown[] = []
    const backend = createDouble<RenderBackend>({
      set scissor(value: RenderBackend['scissor']) {
        scissors.push(value)
      },

      bindTarget() {},

      bindPipeline() {},

      resetMaterialBinding() {},

      clear() {},

      bindCameraUniforms() {},

      bindUniforms() {},

      render(_model, _program, transform) {
        renderedDepths.push((transform as Transform & { depth: number }).depth)
      },
      statistics: { submittedPrimitiveCount: 0 }
    })
    const renderer = new FrameRenderer(backend, () => {
      throw new Error('Unexpected model resolution')
    })
    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })

    pipeline.program = createDouble<Program>({})

    const makeBatch = (depth: number) => ({
      depth,
      transform: Object.assign(new Transform(), { depth }),
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: {
          glass: { material: { blendMode: 'transmissive' } }
        }
      }),
      meshes: ['glass']
    })

    renderer.renderFrame(
      { transmission: pipeline },
      { camera: new Camera(), target: { width: 1, height: 1 }, time: 0 },
      [],
      [],
      [makeBatch(2), makeBatch(9), makeBatch(5)],
      {
        onTransmissionLayerPreparing: ({ batch, layerIndex, layerCount }) => {
          expect(layerIndex).to.equal(preparedDepths.length)
          expect(layerCount).to.equal(3)
          preparedDepths.push(batch.depth!)
        }
      }
    )
    expect(preparedDepths).to.deep.equal([9, 5, 2])
    expect(renderedDepths).to.deep.equal([9, 5, 2])
    expect(scissors).to.deep.equal([null, null, null])
  })
  it('accumulates ambient and shadow-current direct lighting per transmission layer', () => {
    const renderer = new FrameRenderer(createDouble<RenderBackend>({}), () => {
      throw new Error('Unexpected model resolution')
    })
    const ambient = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const lighting = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const mainTarget = { width: 8, height: 8 }
    const nearTarget = { width: 8, height: 8 }
    const farTarget = { width: 8, height: 8 }
    const light = new Light()
    const draws: string[] = []
    const createGlassBatch = (depth: number) => ({
      depth,
      transform: Object.assign(new Transform(), { depth }),
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: { glass: { material: { blendMode: 'transmissive' } } }
      }),
      meshes: ['glass']
    })
    const nearBatch = createGlassBatch(2)
    const farBatch = createGlassBatch(9)
    const targets = new Map<RenderBatch, { width: number; height: number }>([
      [nearBatch, nearTarget],
      [farBatch, farTarget]
    ])

    renderer.renderQueue = (queue, pipeline, context) => {
      const stage = pipeline === ambient ? 'ambient' : 'lighting'
      const target = context.target === mainTarget ? 'main' : context.target === nearTarget ? 'near' : 'far'
      const depth = queue.batches[0]?.depth

      if (stage === 'lighting') {
        expect(context.light).to.equal(light)
      }

      draws.push(`${stage} ${target}${depth === undefined ? '' : ` ${depth}`}`)
    }

    renderer.renderFrame(
      { ambient: ambient, lighting: lighting },
      { camera: new Camera(), target: mainTarget, time: 0 },
      [{ light, entities: [] }],
      [],
      [nearBatch, farBatch],
      { resolveTransmissionLightingTarget: (batch) => targets.get(batch) }
    )
    expect(draws).to.deep.equal([
      'ambient main',
      'ambient near 2',
      'ambient far 9',
      'lighting main',
      'lighting near 2',
      'lighting far 9'
    ])
  })
  it('binds transient uniforms for each render batch', () => {
    const renderedUniforms: unknown[] = []
    const backend = createDouble<RenderBackend>({
      set scissor(_value: RenderBackend['scissor']) {},

      bindTarget() {},

      bindPipeline() {},

      resetMaterialBinding() {},

      clear() {},

      bindCameraUniforms() {},

      bindUniforms() {},

      render(_model, _program, _transform, uniforms) {
        renderedUniforms.push(uniforms)
      },
      statistics: { submittedPrimitiveCount: 0 }
    })
    const queue = new RenderQueue()
    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })

    pipeline.program = createDouble<Program>({})

    const uniforms = { isPlanarReflectionEnabled: true }

    queue.batches.push({
      transform: new Transform(),
      model: createDouble<RenderModel>({ source: new Model(), primitives: { mirror: { material: {} } } }),
      meshes: ['mirror'],
      uniforms
    })
    queue.render(backend, pipeline, { target: { width: 1, height: 1 } })
    expect(renderedUniforms).to.deep.equal([uniforms])
  })
  it('selects programs per primitive and rebinds pass context after each program change', () => {
    const events: string[] = []
    const backend = createDouble<RenderBackend>({
      set scissor(_value: RenderBackend['scissor']) {},

      bindTarget() {},

      bindPipeline(_pipeline, _states, program) {
        if (program) {
          events.push(`program ${(program as Program & { name: string }).name}`)
        }
      },

      resetMaterialBinding(program) {
        events.push(`reset ${(program as Program & { name: string }).name}`)
      },

      clear() {},

      bindCameraUniforms(program) {
        events.push(`camera ${(program as Program & { name: string }).name}`)
      },

      bindLightUniforms(program) {
        events.push(`light ${(program as Program & { name: string }).name}`)
      },

      bindUniforms(program) {
        events.push(`pass ${(program as Program & { name: string }).name}`)
      },

      render(_model, program, _transform, _uniforms, meshes) {
        events.push(`draw ${meshes![0]} ${(program as Program & { name: string }).name}`)
      },
      defaultMaterial: {},
      statistics: { submittedPrimitiveCount: 0 }
    })
    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })

    pipeline.program = Object.assign(createDouble<Program>({}), { name: 'base' })

    const programs: Record<string, Program> = {
      stone: Object.assign(createDouble<Program>({}), { name: 'stone' }),
      wood: Object.assign(createDouble<Program>({}), { name: 'wood' })
    }

    pipeline.resolveProgram = (material) => programs[material.graphTopology]

    const queue = new RenderQueue()

    queue.batches.push({
      transform: new Transform(),
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: {
          floor: { material: { graphTopology: 'stone' } },
          crate: { material: { graphTopology: 'wood' } },
          wall: { material: { graphTopology: 'stone' } }
        }
      })
    })
    queue.render(backend, pipeline, {
      camera: new Camera(),
      light: new Light(),
      uniforms: {},
      target: { width: 1, height: 1 }
    })
    expect(events.filter((value) => value.startsWith('reset '))).to.deep.equal([
      'reset stone',
      'reset wood',
      'reset stone'
    ])
    expect(events.filter((value) => value.startsWith('camera '))).to.deep.equal([
      'camera stone',
      'camera wood',
      'camera stone'
    ])
    expect(events.filter((value) => value.startsWith('light '))).to.deep.equal([
      'light stone',
      'light wood',
      'light stone'
    ])
    expect(events.filter((value) => value.startsWith('pass '))).to.deep.equal(['pass stone', 'pass wood', 'pass stone'])
    expect(events.filter((value) => value.startsWith('draw '))).to.deep.equal([
      'draw floor stone',
      'draw crate wood',
      'draw wall stone'
    ])
  })
  it('disables culling only while rendering double-sided materials', () => {
    const cullModes: string[] = []
    const backend = createDouble<RenderBackend>({
      set scissor(_value: RenderBackend['scissor']) {},

      set cullMode(value: CullMode) {
        cullModes.push(value)
      },

      bindTarget() {},

      bindPipeline() {},

      resetMaterialBinding() {},

      clear() {},

      render() {},
      statistics: { submittedPrimitiveCount: 0 }
    })
    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '', cullMode: 'back' })

    pipeline.program = createDouble<Program>({})

    const queue = new RenderQueue()

    queue.batches.push({
      transform: new Transform(),
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: {
          leaf: { material: { isDoubleSided: true } },
          stem: { material: { isDoubleSided: false } }
        }
      })
    })
    queue.render(backend, pipeline, { target: { width: 1, height: 1 } })
    expect(cullModes).to.deep.equal(['none', 'back'])
  })
  it('finishes volume draws before taking one depth snapshot and per-layer color snapshots', () => {
    const renderer = new FrameRenderer(createDouble<RenderBackend>({}), () => {
      throw new Error('Unexpected model resolution')
    })
    const volume = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const transmission = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const order: string[] = []
    const volumeTarget = { width: 4, height: 4 }
    const mainTarget = { width: 8, height: 8 }
    const depthSnapshot = {}

    renderer.renderQueue = (_queue, pipeline, context) => {
      expect(context.target).to.equal(pipeline === volume ? volumeTarget : mainTarget)

      if (pipeline === transmission) {
        expect((context.uniforms as { depthTexture: unknown }).depthTexture).to.equal(depthSnapshot)
      }

      order.push(pipeline === volume ? 'volume' : 'glass')
    }

    const createGlassBatch = (depth: number) => ({
      depth,
      transform: new Transform(),
      model: createDouble<RenderModel>({
        source: new Model(),
        primitives: { glass: { material: { blendMode: 'transmissive' } } }
      }),
      meshes: ['glass']
    })

    renderer.renderFrame(
      { volumetricLighting: volume, transmission: transmission },
      { camera: new Camera(), target: mainTarget, time: 0 },
      [
        {
          light: Object.assign(new Light(), {
            isVisible: true,
            volumetricIntensity: 1,
            volumetricDensity: 0.1,
            intensity: 1,
            range: 5
          }),
          entities: []
        }
      ],
      [],
      [createGlassBatch(1), createGlassBatch(2)],
      {
        volumetricBatches: [{ model: createDouble<RenderModel>({ source: new Model() }), transform: new Transform() }],
        overrideTargets: { volumetricLighting: volumeTarget },
        additionalUniforms: { transmission: { depthTexture: depthSnapshot } },
        onTransmissionStagePreparing: () => order.push('depth snapshot'),

        onTransmissionLayerPreparing: () => order.push('color snapshot')
      }
    )
    expect(order).to.deep.equal(['volume', 'depth snapshot', 'color snapshot', 'glass', 'color snapshot', 'glass'])
  })
})
