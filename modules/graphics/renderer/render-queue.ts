import { Renderer } from './renderer'
import { RenderPipeline } from './render-pass'
import { Material } from './material'
import { Mesh } from '../types/mesh'
import { RenderBatch } from './render-batch'
import { QueueContext, RenderState } from './render-graph'

export class RenderQueue {
  readonly batches: RenderBatch[] = []

  private materialIds = new WeakMap<Material, number>()
  private meshIds = new WeakMap<Mesh, number>()
  private nextMaterialId = 1
  private nextMeshId = 1

  sortFrontToBack() {
    this.batches.sort(this.compareOpaque)
  }

  sortBackToFront() {
    this.batches.sort(this.compareTransparent)
  }

  private compareOpaque = (b1: RenderBatch, b2: RenderBatch) => {
    const amid = this.getMaterialIdSafe(this.getPrimaryMaterial(b1))
    const bmid = this.getMaterialIdSafe(this.getPrimaryMaterial(b2))
    if (amid !== bmid) return amid - bmid
    const ameid = this.getMeshIdSafe(this.getPrimaryMesh(b1))
    const bmeid = this.getMeshIdSafe(this.getPrimaryMesh(b2))
    if (ameid !== bmeid) return ameid - bmeid
    const da = b1.depth ?? 0
    const db = b2.depth ?? 0
    return da - db
  }

  private compareTransparent = (a: RenderBatch, b: RenderBatch) => {
    const amid = this.getMaterialIdSafe(this.getPrimaryMaterial(a))
    const bmid = this.getMaterialIdSafe(this.getPrimaryMaterial(b))
    if (amid !== bmid) return amid - bmid
    const ameid = this.getMeshIdSafe(this.getPrimaryMesh(a))
    const bmeid = this.getMeshIdSafe(this.getPrimaryMesh(b))
    if (ameid !== bmeid) return ameid - bmeid
    const da = a.depth ?? 0
    const db = b.depth ?? 0
    return db - da
  }

  private getPrimaryMaterial(item: RenderBatch): Material | null {
    const model: any = item.model as any
    const parts: Record<string, any> = model?.partitions ?? {}
    let part: any | undefined
    if (item.partitions && item.partitions.length > 0) {
      part = parts[item.partitions[0]]
    } else {
      const first = Object.keys(parts)[0]
      part = first ? parts[first] : undefined
    }
    return part?.mesh?.material ?? null
  }

  private getPrimaryMesh(item: RenderBatch): Mesh | null {
    const model: any = item.model as any
    const parts: Record<string, any> = model?.partitions ?? {}
    let part: any | undefined
    if (item.partitions && item.partitions.length > 0) {
      part = parts[item.partitions[0]]
    } else {
      const first = Object.keys(parts)[0]
      part = first ? parts[first] : undefined
    }
    return (part?.mesh ?? null) as Mesh | null
  }

  private getMaterialIdSafe(m: Material | null): number {
    if (!m) return 0
    let id = this.materialIds.get(m)
    if (!id) {
      id = this.nextMaterialId++
      this.materialIds.set(m, id)
    }
    return id
  }

  private getMeshIdSafe(mesh: Mesh | null): number {
    if (!mesh) return 0
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
      renderer.scissor(queueContext.scissor)
    }

    if (queueContext.light) {
      renderer.bindLightUniforms(pipeline.program!, queueContext.light)
    }

    if (queueContext.camera) {
      renderer.bindCameraUniforms(pipeline.program!, queueContext.camera)
    }

    if (queueContext.uniforms) {
      renderer.setNestedUniforms(pipeline.program!, queueContext.uniforms)
    }

    for (const { transform, model, partitions } of this.batches) {
      renderer.render(model, pipeline.program!, transform, undefined, partitions)
    }

    let submittedMeshes = 0

    for (const batch of this.batches) {
      submittedMeshes += (batch.partitions && batch.partitions.length > 0) ? batch.partitions.length : 1
    }

    renderer.stats.submittedMeshes += submittedMeshes

    if (queueContext.scissor) {
      renderer.scissor(null)
    }
  }
}

