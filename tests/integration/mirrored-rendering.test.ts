import { expect } from 'chai'
import { Entity, Transform } from '@luz/core'
import { Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { Model } from '@luz/graphics'
import { Cuboid } from '@luz/physics'
import { RenderQueue, RenderPipeline, WebGL2RenderBackend } from '@luz/graphics'
import { RenderStatistics } from '@luz/graphics'
import { Quaternion, Vector3 } from '@luz/math'

function createRenderer() {
  const calls: number[] = [],
    draws: { frontFace: number; cullMode: number | undefined; isCullingEnabled: boolean }[] = []

  let frontFace = 0,
    cullMode: number | undefined,
    isCulling = false

  const context = {
    CW: 0x0900,
    CCW: 0x0901,
    FRONT: 0x0404,
    BACK: 0x0405,
    CULL_FACE: 0x0b44,
    frontFace(value: number) {
      frontFace = value

      calls.push(value)
    },

    cullFace(value: number) {
      cullMode = value
    },

    enable(capability: number) {
      if (capability === 0x0b44) {
        isCulling = true
      }
    },

    disable(capability: number) {
      if (capability === 0x0b44) {
        isCulling = false
      }
    }
  }
  const backend = Object.create(WebGL2RenderBackend.prototype) as WebGL2RenderBackend

  Object.assign(backend, {
    context,
    uniformProperties: { transform: [], model: [] },
    uniformCache: {},
    lastMaterialByProgram: new WeakMap(),
    programs: { update() {} },
    primitives: {
      render() {
        draws.push({ frontFace, cullMode, isCullingEnabled: isCulling })
      }
    },
    statistics: new RenderStatistics(),
    bindTarget() {},

    clear() {},

    bindPipeline(pipeline: RenderPipeline, overrides?: { cullMode?: string }) {
      backend.cullMode = (overrides?.cullMode ?? pipeline.cullMode) as any
    }
  })

  const material = { uniforms: {}, isDoubleSided: false }
  const model = { source: new Model(), primitives: { mesh: { material } } } as any
  const pipeline = new RenderPipeline({ vertexShader: '', fragmentShader: '' })

  pipeline.program = {} as any

  const queue = new RenderQueue()
  const draw = (transform: Transform, override?: 'front' | 'back') => {
    queue.batches.length = 0

    queue.batches.push({ model, transform })
    queue.render(backend, pipeline, {} as any, override ? { cullMode: override } : undefined)
  }

  return { backend, context, calls, draws, material, draw }
}

describe('Mirrored rendering', () => {
  it('corrects single- and triple-negative scale and resets winding for ordinary and fullscreen draws', () => {
    const render = createRenderer(),
      transform = new Transform()

    for (const scale of [
      [1, 1, 1],
      [-1, 1, 1],
      [-1, -1, -1],
      [-1, -1, 1],
      [1, 1, 1]
    ]) {
      transform.scale.set(scale)
      transform.updateTransform()
      render.draw(transform)
    }

    expect(render.draws.map((draw) => draw.frontFace)).to.deep.equal([
      render.context.CCW,
      render.context.CW,
      render.context.CW,
      render.context.CCW,
      render.context.CCW
    ])
    expect(render.draws.every((draw) => draw.cullMode === render.context.BACK && draw.isCullingEnabled)).to.equal(true)
    expect(render.calls).to.have.length(3)
    expect(render.backend.statistics.stateChanges.frontFaceChangeCount).to.equal(3)
    render.backend.statistics.reset()
    expect(render.backend.statistics.stateChanges.frontFaceChangeCount).to.equal(0)
  })
  it('uses composed hierarchy handedness, including inherited shear and two reflections that cancel', () => {
    const render = createRenderer(),
      scene = new Scene(),
      parent = new Entity(),
      child = new Entity()

    scene.entities.root = parent
    parent.children.mesh = child

    parent.scale.set([-2, 3, 4])
    child.rotation.set(Quaternion.setFromAxisAngle(Vector3.createUp(), 0.6))
    scene.update(0, false)
    render.draw(child)

    child.scale.x = -1

    scene.update(0, false)
    render.draw(child)
    expect(render.draws.map((draw) => draw.frontFace)).to.deep.equal([render.context.CW, render.context.CCW])
  })
  it('preserves reflection-pass culling and supplies correct facing even when culling is disabled', () => {
    const render = createRenderer(),
      transform = new Transform({ scale: new Vector3([-1, -1, -1]) })

    transform.updateTransform()
    render.draw(transform, 'front')
    expect(render.draws[0]).to.deep.equal({
      frontFace: render.context.CW,
      cullMode: render.context.FRONT,
      isCullingEnabled: true
    })

    render.material.isDoubleSided = true

    render.draw(transform)
    expect(render.draws[1].frontFace).to.equal(render.context.CW)
    expect(render.draws[1].isCullingEnabled).to.equal(false)
    render.draw(Transform.createOrigin())
    expect(render.draws[2].frontFace).to.equal(render.context.CCW)
  })
  it('keeps a Sala-style negatively scaled body outward-facing before and during simulation', () => {
    const render = createRenderer(),
      scene = new Scene(),
      cube = new Entity(),
      body = new Body()

    cube.scale.set([-0.094158, -0.094158, -0.094158])

    cube.translation.y = 1
    body.volume = new Cuboid({ extents: new Vector3([0.094158, 0.094158, 0.094158]) })

    body.angularVelocity.set([1, 2, 3])

    cube.components.body = body
    scene.entities.cube = cube

    scene.update(0, false)

    for (let frame = 0; frame < 20; frame++) {
      render.draw(cube)

      const facePosition = cube.modelMatrix.transformVector3(Vector3.createRight()).subtract(cube.worldTranslation)
      const normal = cube.normalMatrix.transform(Vector3.createRight()).normalize()

      expect(Vector3.calculateDotProduct(normal, facePosition)).to.be.greaterThan(0)
      expect(render.draws[frame].frontFace).to.equal(render.context.CW)
      scene.update(1 / 60)
    }

    expect(cube.translation.y).to.be.lessThan(1)
    expect(Math.abs(cube.rotation.w)).to.be.lessThan(1)
  })
})
