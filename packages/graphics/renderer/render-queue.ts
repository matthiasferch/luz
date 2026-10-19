import { executeRenderPass } from './render-pass'
import type { RenderBackend, RenderState } from './render-backend'
import type { RenderPipeline } from './render-pipeline'
import type { RenderMaterial } from './render-material'
import type { Primitive } from '../types/primitive'
import type { RenderBatch } from './render-batch'
import type { QueueContext } from './frame-renderer'
import type { Program } from '../types/program'

export class RenderQueue {
  readonly batches: RenderBatch[] = []

  private materialIds = new WeakMap<RenderMaterial, number>()
  private primitiveIds = new WeakMap<Primitive, number>()
  private nextMaterialId = 1
  private nextPrimitiveId = 1

  sortByMaterialThenDepth() {
    this.batches.sort(this.compareByMaterialThenDepth)
  }

  sortBackToFront() {
    this.batches.sort(this.compareBackToFront)
  }

  private compareByMaterialThenDepth = (firstBatch: RenderBatch, secondBatch: RenderBatch) => {
    const firstMaterialId = this.resolveMaterialId(this.selectPrimaryMaterial(firstBatch))
    const secondMaterialId = this.resolveMaterialId(this.selectPrimaryMaterial(secondBatch))

    if (firstMaterialId !== secondMaterialId) {
      return firstMaterialId - secondMaterialId
    }

    const firstPrimitiveId = this.resolvePrimitiveId(this.selectPrimaryPrimitive(firstBatch))
    const secondPrimitiveId = this.resolvePrimitiveId(this.selectPrimaryPrimitive(secondBatch))

    if (firstPrimitiveId !== secondPrimitiveId) {
      return firstPrimitiveId - secondPrimitiveId
    }

    const firstDepth = firstBatch.depth ?? 0
    const secondDepth = secondBatch.depth ?? 0

    return firstDepth - secondDepth
  }
  private compareBackToFront = (firstBatch: RenderBatch, secondBatch: RenderBatch) => {
    const firstDepth = firstBatch.depth ?? 0
    const secondDepth = secondBatch.depth ?? 0

    if (firstDepth !== secondDepth) {
      return secondDepth - firstDepth
    }

    const firstMaterialId = this.resolveMaterialId(this.selectPrimaryMaterial(firstBatch))
    const secondMaterialId = this.resolveMaterialId(this.selectPrimaryMaterial(secondBatch))

    if (firstMaterialId !== secondMaterialId) {
      return firstMaterialId - secondMaterialId
    }

    const firstPrimitiveId = this.resolvePrimitiveId(this.selectPrimaryPrimitive(firstBatch))
    const secondPrimitiveId = this.resolvePrimitiveId(this.selectPrimaryPrimitive(secondBatch))

    if (firstPrimitiveId !== secondPrimitiveId) {
      return firstPrimitiveId - secondPrimitiveId
    }

    return 0
  }

  private selectPrimaryMaterial(item: RenderBatch): RenderMaterial | null {
    return this.selectPrimaryPrimitive(item)?.material ?? null
  }

  private selectPrimaryPrimitive(item: RenderBatch): Primitive | null {
    const { model } = item
    const primitives = model.primitives
    const name = item.meshes?.[0] ?? Object.keys(primitives)[0]

    return name ? (primitives[name] ?? null) : null
  }

  private resolveMaterialId(material: RenderMaterial | null): number {
    if (!material) {
      return 0
    }

    let id = this.materialIds.get(material)

    if (!id) {
      id = this.nextMaterialId++

      this.materialIds.set(material, id)
    }

    return id
  }

  private resolvePrimitiveId(primitive: Primitive | null): number {
    if (!primitive) {
      return 0
    }

    let id = this.primitiveIds.get(primitive)

    if (!id) {
      id = this.nextPrimitiveId++

      this.primitiveIds.set(primitive, id)
    }

    return id
  }

  render(
    backend: RenderBackend,
    pipeline: RenderPipeline,
    queueContext: QueueContext,
    overrideStates?: Partial<RenderState>
  ) {
    if (queueContext.light && !queueContext.light.isVisible) {
      return
    }

    executeRenderPass(backend, { ...queueContext, pipeline, overrideStates }, () => {
      let submittedPrimitiveCount = 0
      let activeProgram: Program | null = null

      const bindContext = (program: Program): void => {
        if (activeProgram === program) {
          return
        }

        backend.bindPipeline(pipeline, overrideStates, program)
        backend.resetMaterialBinding(program)

        if (queueContext.light) {
          backend.bindLightUniforms(program, queueContext.light)
        }

        if (queueContext.camera) {
          backend.bindCameraUniforms(program, queueContext.camera)
        }

        if (queueContext.uniforms) {
          backend.bindUniforms(program, queueContext.uniforms)
        }

        activeProgram = program
      }

      for (const { transform, model, uniforms, meshes } of this.batches) {
        if (!model.source.isVisible) {
          continue
        }

        const names = meshes && meshes.length > 0 ? meshes : Object.keys(model.primitives)

        for (const name of names) {
          const primitive = model.primitives[name]

          if (!primitive) {
            continue
          }

          const material = primitive.material ?? backend.defaultMaterial
          const program = pipeline.resolveProgram?.(material) ?? pipeline.program!

          bindContext(program)

          backend.cullMode = material.isDoubleSided ? 'none' : (overrideStates?.cullMode ?? pipeline.cullMode)

          backend.render(model, program, transform, uniforms, [name])

          submittedPrimitiveCount += 1
        }
      }

      backend.statistics.submittedPrimitiveCount += submittedPrimitiveCount
    })
  }
}
