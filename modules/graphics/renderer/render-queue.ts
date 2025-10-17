import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { PipelineDescriptor, RenderState } from './pipeline'
import { Material } from './material'
import { Mesh } from '../types/mesh'
import { RenderBatch } from './render-item'
import { QueueContext } from './render-graph'

export class RenderQueue {
  readonly batches: RenderBatch[] = []

  private materialIds = new WeakMap<Material, number>()
  private meshIds = new WeakMap<Mesh, number>()
  private nextMaterialId = 1
  private nextMeshId = 1

  // Default sorting: pipeline (per-queue) → material → mesh → depth (front-to-back)
  sort(compare?: (a: RenderBatch, b: RenderBatch) => number) {
    if (compare) {
      this.batches.sort(compare)
      return
    }
    this.batches.sort(this.compareOpaque)
  }

  sortOpaque() { this.batches.sort(this.compareOpaque) }
  sortTransparent() { this.batches.sort(this.compareTransparent) }

  private compareOpaque = (a: RenderBatch, b: RenderBatch) => {
    const amid = this.getMaterialIdSafe(this.getPrimaryMaterial(a))
    const bmid = this.getMaterialIdSafe(this.getPrimaryMaterial(b))
    if (amid !== bmid) return amid - bmid
    const ameid = this.getMeshIdSafe(this.getPrimaryMesh(a))
    const bmeid = this.getMeshIdSafe(this.getPrimaryMesh(b))
    if (ameid !== bmeid) return ameid - bmeid
    const da = a.depth ?? 0
    const db = b.depth ?? 0
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

  // Execute the queue using the provided renderer and pass context.
  // For Step 1 scaffolding this mirrors Renderer.renderPass state setup
  // and emits per-item draws via renderer.renderModel.
  render(
    renderer: Renderer,
    pass: RenderPass,
    context: QueueContext,
    pipelineOverride?: Partial<RenderState>
  ) {
    // Bind target
    renderer.use(context.target)

    // Build/bind pipeline from pass fixed state
    const base = pass.toPipelineDescriptor()
    if (!base) return
    const program = base.program
    const desc: PipelineDescriptor = { ...base }
    if (pipelineOverride) {
      if (pipelineOverride.cullMode !== undefined) desc.cullMode = pipelineOverride.cullMode
      if (pipelineOverride.blendMode !== undefined) desc.blendMode = pipelineOverride.blendMode
      if (pipelineOverride.depthTest !== undefined) desc.depthTest = pipelineOverride.depthTest
      if (pipelineOverride.depthMask !== undefined) desc.depthMask = pipelineOverride.depthMask
      if (pipelineOverride.colorMask !== undefined) desc.colorMask = pipelineOverride.colorMask
    }
    const pipeline = renderer.pipelines.getOrCreate(desc)
    renderer.bindPipeline(pipeline)
    // Reset material binding cache for this program at the start of the stage
    renderer.resetMaterialBinding(program)

    // Clear after binding masks
    renderer.clear({ color: pass.clearColor, depth: pass.clearDepth, stencil: pass.clearStencil })

    // Optional scissor
    if (context.scissor) {
      renderer.enableScissor(context.scissor)
    }

    // Bind frame/light groups once per stage and apply extra uniforms
    if (context.light) {
      renderer.setLightUniforms(program, context.light)
    }

    if (context.camera) {
      renderer.setCameraUniforms(program, context.camera)
    }

    if (context.uniforms) {
      renderer.setNestedUniforms(program, context.uniforms)
    }

    // Draw all items with only per-object/material uniforms changing
    for (const { transform, model, partitions } of this.batches) {
      renderer.render(transform, model, program, undefined, partitions)
    }

    // Update submissions (draws are counted in renderer)
    renderer.stats.submissions += this.batches.length

    if (context.scissor) {
      renderer.disableScissor()
    }
  }
}

