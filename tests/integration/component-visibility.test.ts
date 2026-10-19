import { expect } from 'chai'
import { Entity, Light, Transform } from '@luz/core'
import { Scene } from '@luz/scene'
import { Model } from '@luz/graphics'
import type { RenderModel } from '@luz/graphics'
import { FrameRenderer, RenderPipeline, RenderQueue } from '@luz/graphics'

describe('Component visibility', () => {
  it('defaults to visible and round-trips independently for each instance', async () => {
    const entity = new Entity()

    entity.components.model = new Model()
    entity.components.light = new Light()

    for (const component of Object.values(entity.components) as Array<Model | Light>) {
      expect(component.isVisible).to.equal(true)

      component.isVisible = false
    }

    const firstEntity = await Entity.deserialize(entity.serialize())
    const secondEntity = await Entity.deserialize(entity.serialize())

    for (const name of ['model', 'light']) {
      const component = firstEntity.components[name] as Model | Light

      expect(component.isVisible).to.equal(false)

      component.isVisible = true

      expect((secondEntity.components[name] as Model | Light).isVisible).to.equal(false)
    }

    expect((await Model.deserialize({ type: 'model' })).isVisible).to.equal(true)
    expect(
      ((await Light.deserialize({ type: 'light', lightType: 'spot', coneAngle: 90, coneFalloff: 10 })) as Light)
        .isVisible
    ).to.equal(true)
  })
  it('keeps hidden components updating and does not hide descendants', () => {
    const scene = new Scene(),
      root = new Entity(),
      child = new Entity()
    const model = new Model(),
      light = new Light(),
      childModel = new Model()

    let updates = 0

    model.update = () => {
      updates++
    }
    model.isVisible = light.isVisible = false
    root.components.model = model
    root.components.light = light
    child.components.model = childModel
    root.children.child = child
    scene.entities.root = root

    root.translation.set([3, 4, 5])
    scene.update(0, false)
    expect(updates).to.equal(1)
    expect(light.translation.xyz).to.deep.equal([3, 4, 5])
    expect(child.worldTranslation.xyz).to.deep.equal([3, 4, 5])
    expect(childModel.isVisible).to.equal(true)
  })
  it('checks visibility at draw time even for cached batches sharing graphics resources', () => {
    const source = new Model(),
      otherModel = new Model(),
      light = new Light()
    const primitives = { mesh: { material: {} } } as any
    const models = [
      { source: source, materials: {}, primitives: primitives },
      { source: otherModel, materials: {}, primitives: primitives }
    ]
    const draws: RenderModel[] = []
    const backend = {
      bindTarget() {},

      bindPipeline() {},

      clear() {},

      resetMaterialBinding() {},

      bindLightUniforms() {},

      render(model: RenderModel) {
        draws.push(model)
      },
      statistics: { submittedPrimitiveCount: 0 }
    } as any
    const queue = new RenderQueue()

    queue.batches.push(...models.map((model) => ({ model, transform: new Transform() })))

    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })

    pipeline.program = {} as any

    const context = { target: {} as any, light }

    source.isVisible = false

    queue.render(backend, pipeline, context)
    expect(draws).to.deep.equal([models[1]])

    source.isVisible = true

    queue.render(backend, pipeline, context)
    expect(draws).to.deep.equal([models[1], models[0], models[1]])

    light.isVisible = false

    queue.render(backend, pipeline, context)
    expect(draws.length).to.equal(3)
  })
  it('excludes hidden lights from every light pass and hidden models from shadows and transmission', () => {
    const model = new Model(),
      light = new Light(),
      hiddenLight = new Light()

    model.isVisible = hiddenLight.isVisible = false

    const entity = new Entity()

    entity.components.model = model

    const renderer = new FrameRenderer({} as any, () => {
      throw new Error('Hidden shadow caster resolved')
    })
    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const renderedBatchCounts: number[] = []

    renderer.renderQueue = (queue) => {
      renderedBatchCounts.push(queue.batches.length)
    }

    const batch = {
      transform: entity,
      model: {
        source: model,
        materials: {},
        primitives: {
          glass: { material: { blendMode: 'transmissive' } }
        } as any
      },
      meshes: ['glass']
    }

    renderer.renderFrame(
      {
        shadowMapping: pipeline,
        lighting: pipeline,
        transparent: pipeline,
        transmission: pipeline,
        volumetricLighting: pipeline
      },
      { camera: {} as any, target: {} as any, time: 0 },
      [
        { light: hiddenLight, entities: [entity] },
        { light, entities: [entity] }
      ],
      [batch],
      [batch],
      {
        onTransmissionLayerPreparing: () => {
          throw new Error('Hidden transmission layer prepared')
        }
      }
    )
    expect(renderedBatchCounts).to.deep.equal([0, 0, 0])
  })
})
