import { expect } from 'chai'
import { RenderFlow, RenderPipeline, RenderQueue, executeRenderPass } from '@luz/graphics'
import type { RenderBackend } from '@luz/graphics'
import { Vector4 } from '@luz/math'
import { createDouble } from '../fixtures/test-double'

describe('RenderPipeline', () => {
  it('reuses serialized pipeline state with independent targets and clear commands', async () => {
    const flow = await RenderFlow.deserialize({
      pipelines: {
        ambient: { vertexShader: 'vertex.glsl', fragmentShader: 'fragment.glsl' }
      }
    } as unknown as Partial<RenderFlow>)
    const pipeline = flow.pipelines.ambient!
    const definition = pipeline.serialize()
    const events: unknown[] = []
    const backend = createDouble<RenderBackend>({
      bindTarget: (target) => {
        events.push(target)
      },

      bindPipeline: (boundPipeline) => {
        expect(boundPipeline).to.equal(pipeline)
      },

      clear: (options) => {
        events.push(options)
      },
      statistics: { submittedPrimitiveCount: 0 }
    })
    const firstTarget = { width: 16, height: 8 }
    const secondTarget = { width: 32, height: 16 }
    const clear = { color: new Vector4([0.25, 0.5, 0.75, 0]), depth: 0, stencil: 0 }
    const queue = new RenderQueue()

    queue.render(backend, pipeline, { target: firstTarget, clear })
    queue.render(backend, pipeline, { target: secondTarget })
    expect(events).to.deep.equal([firstTarget, clear, secondTarget])
    expect(pipeline.serialize()).to.deep.equal(definition)
    expect(flow.serialize()).to.deep.equal({
      pipelines: { ambient: flow.pipelines.ambient!.serialize() }
    })
    expect(definition).not.to.have.property('clearColor')
  })
  it('keeps an omitted clear color unset', async () => {
    const pipeline = await RenderPipeline.deserialize({ vertexShader: 'vertex.glsl', fragmentShader: 'fragment.glsl' })

    expect(pipeline).not.to.have.property('clearColor')
    expect(pipeline.serialize()).not.to.have.property('clearColor')
  })
  it('sets the pass scissor before clearing and resets it when drawing fails', () => {
    const events: unknown[] = []
    const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })
    const target = { width: 32, height: 16 }
    const scissor = { x: 4, y: 2, width: 8, height: 8 }
    const clear = { depth: 1 }
    const backend = createDouble<RenderBackend>({
      bindTarget: () => {},

      bindPipeline: () => {},

      clear: (options) => {
        events.push(options)
      }
    })

    Object.defineProperty(backend, 'scissor', {
      set: (rectangle) => {
        events.push(rectangle)
      }
    })
    expect(() =>
      executeRenderPass(backend, { pipeline, target, scissor, clear }, () => {
        throw new Error('draw failed')
      })
    ).to.throw('draw failed')
    expect(events).to.deep.equal([scissor, clear, null])
  })
})
