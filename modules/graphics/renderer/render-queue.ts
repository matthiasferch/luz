import type { Renderer } from './renderer'
import { RenderPipeline } from './render-pipeline'
import { Material } from './material'
import { Mesh } from '../types/mesh'
import { RenderBatch } from './render-batch'
import { QueueContext, RenderState } from './render-graph'
import { Partition } from './partition'

export class RenderQueue {
  readonly batches: RenderBatch[] = []

  private meshIds = new WeakMap<Mesh, number>()
  private materialIds = new WeakMap<Material, number>()

  private nextMaterialId = 1
  private nextMeshId = 1

  sortFrontToBack() {
    this.batches.sort(this.compareFrontToBack)
  }

  sortBackToFront() {
    this.batches.sort(this.compareBackToFront)
  }

  private compareFrontToBack = (b1: RenderBatch, b2: RenderBatch) => {
    const m1 = this.getMaterialId(this.getPrimaryMaterial(b1))
    const m2 = this.getMaterialId(this.getPrimaryMaterial(b2))

    if (m1 !== m2) {
      return m1 - m2
    }

    const n1 = this.getMeshId(this.getPrimaryMesh(b1))
    const n2 = this.getMeshId(this.getPrimaryMesh(b2))

    if (n1 !== n2) {
      return n1 - n2
    }

    const da = b1.depth ?? 0
    const db = b2.depth ?? 0

    return da - db
  }

  private compareBackToFront = (b1: RenderBatch, b2: RenderBatch) => {
    const m1 = this.getMaterialId(this.getPrimaryMaterial(b1))
    const m2 = this.getMaterialId(this.getPrimaryMaterial(b2))

    if (m1 !== m2) {
      return m1 - m2
    }

    const n1 = this.getMeshId(this.getPrimaryMesh(b1))
    const n2 = this.getMeshId(this.getPrimaryMesh(b2))

    if (n1 !== n2) {
      return n1 - n2
    }

    const da = b1.depth ?? 0
    const db = b2.depth ?? 0

    return db - da
  }

  private getPrimaryMaterial(item: RenderBatch): Material | null {
    const { model } = item
    const partitions: Record<string, Partition> = model?.partitions ?? {}

    let partition: Partition | undefined

    if (item.partitions && item.partitions.length > 0) {
      partition = partitions[item.partitions[0]]
    } else {
      const firstPartition = Object.keys(partitions)[0]
      partition = firstPartition ? partitions[firstPartition] : undefined
    }

    return partition?.mesh?.material ?? null
  }

  private getPrimaryMesh(item: RenderBatch): Mesh | null {
    const { model } = item
    const partitions: Record<string, Partition> = model?.partitions ?? {}

    let partition: Partition | undefined

    if (item.partitions && item.partitions.length > 0) {
      partition = partitions[item.partitions[0]]
    } else {
      const firstPartition = Object.keys(partitions)[0]
      partition = firstPartition ? partitions[firstPartition] : undefined
    }

    return partition?.mesh ?? null
  }

  private getMaterialId(material: Material | null): number {
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

  private getMeshId(mesh: Mesh | null): number {
    if (!mesh) {
      return 0
    }

    let id = this.meshIds.get(mesh)

    if (!id) {
      id = this.nextMeshId++
      this.meshIds.set(mesh, id)
    }

    return id
  }

  render(
    renderer: Renderer,
    pipeline: RenderPipeline,
    queueContext: QueueContext,
    overrideStates?: Partial<RenderState>
  ) {
    renderer.bindTarget(queueContext.target)
    renderer.bindPipeline(pipeline, overrideStates)

    renderer.resetMaterialBinding(pipeline.program!)

    const { clearColor, clearDepth, clearStencil } = pipeline

    renderer.clear({ color: clearColor, depth: clearDepth, stencil: clearStencil })

    if (queueContext.scissor) {
      renderer.scissor = queueContext.scissor
    }

    if (queueContext.light) {
      renderer.bindLightUniforms(pipeline.program!, queueContext.light)
    }

    if (queueContext.camera) {
      renderer.bindCameraUniforms(pipeline.program!, queueContext.camera)
    }

    if (queueContext.uniforms) {
      renderer.bindUniforms(pipeline.program!, queueContext.uniforms)
    }

    for (const { transform, model, partitions } of this.batches) {
      renderer.render(model, pipeline.program!, transform, undefined, partitions)
    }

    let submittedMeshes = 0

    for (const batch of this.batches) {
      submittedMeshes += (batch.partitions && batch.partitions.length > 0) ? batch.partitions.length : 1
    }

    renderer.statistics.submittedMeshes += submittedMeshes

    if (queueContext.scissor) {
      renderer.scissor = null
    }
  }
}

