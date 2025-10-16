import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { PipelineDescriptor } from './pipeline'
import { Material } from './material'
import { Mesh } from '../types/mesh'
import { RenderPassContext } from './contexts'
import { RenderItem } from './render-item'

export class RenderQueue {
  readonly items: RenderItem[] = []
  private materialIds = new WeakMap<Material, number>()
  private meshIds = new WeakMap<Mesh, number>()
  private nextMaterialId = 1
  private nextMeshId = 1

  // Default sorting: pipeline (per-queue) → material → mesh → depth (front-to-back)
  sort(compare?: (a: RenderItem, b: RenderItem) => number) {
    if (compare) {
      this.items.sort(compare)
      return
    }
    this.items.sort(this.compareOpaque)
  }

  sortOpaque() { this.items.sort(this.compareOpaque) }
  sortTransparent() { this.items.sort(this.compareTransparent) }

  private compareOpaque = (a: RenderItem, b: RenderItem) => {
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

  private compareTransparent = (a: RenderItem, b: RenderItem) => {
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

  private getPrimaryMaterial(item: RenderItem): Material | null {
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

  private getPrimaryMesh(item: RenderItem): Mesh | null {
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
    context: RenderPassContext,
    pipelineOverride?: Partial<Pick<PipelineDescriptor, 'cullMode' | 'blendMode' | 'depthTest' | 'depthMask' | 'colorMask'>>
  ) {
    // Bind target
    renderer.use(context.target)

    // Build/bind pipeline from pass fixed state
    const program = pass.program
    if (!program) return
    const desc: PipelineDescriptor = {
      program,
      cullMode: pass.cullMode,
      blendMode: pass.blendMode,
      depthTest: pass.depthTest,
      depthMask: pass.depthMask,
      colorMask: pass.colorMask
    }
    if (pipelineOverride) {
      if (pipelineOverride.cullMode !== undefined) desc.cullMode = pipelineOverride.cullMode
      if (pipelineOverride.blendMode !== undefined) desc.blendMode = pipelineOverride.blendMode
      if (pipelineOverride.depthTest !== undefined) desc.depthTest = pipelineOverride.depthTest
      if (pipelineOverride.depthMask !== undefined) desc.depthMask = pipelineOverride.depthMask
      if (pipelineOverride.colorMask !== undefined) desc.colorMask = pipelineOverride.colorMask
    }
    const pipeline = renderer.getOrCreatePipeline(desc)
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
    if (context.camera) renderer.bindFrameGroup(program, context.camera)
    if (context.light) renderer.bindLightGroup(program, context.light)
    if (context.uniforms) renderer.applyUniforms(program, context.uniforms)

    // Draw all items with only per-object/material uniforms changing
    for (const item of this.items) {
      renderer.renderModel(null, item.transform, item.model, null, program, undefined, item.partitions)
    }
    
    // Update submissions (draws are counted in renderer)
    renderer.stats.submissions += this.items.length

    if (context.scissor) {
      renderer.disableScissor()
    }
  }
}
