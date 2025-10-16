import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { PipelineDescriptor } from './pipeline'
import { RenderPassContext } from './contexts'
import { RenderItem } from './render-item'

export class RenderQueue {
  readonly items: RenderItem[] = []

  // Default sorting: by explicit sortKey, then by depth (front-to-back)
  sort(compare?: (a: RenderItem, b: RenderItem) => number) {
    if (compare) {
      this.items.sort(compare)
      return
    }

    this.items.sort((a, b) => {
      if (a.sortKey !== undefined && b.sortKey !== undefined) {
        if (a.sortKey === b.sortKey) {
          const da = a.depth ?? 0
          const db = b.depth ?? 0
          return da - db
        }
        return String(a.sortKey) < String(b.sortKey) ? -1 : 1
      }
      if (a.sortKey !== undefined) return -1
      if (b.sortKey !== undefined) return 1
      const da = a.depth ?? 0
      const db = b.depth ?? 0
      return da - db
    })
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
    if (context.camera) renderer.bindFrameGroup(program, context.camera)
    if (context.light) renderer.bindLightGroup(program, context.light)
    if (context.uniforms) renderer.applyUniforms(program, context.uniforms)

    // Draw all items with only per-object/material uniforms changing
    for (const item of this.items) {
      renderer.renderModel(null, item.transform, item.model, null, program, undefined, item.partitions)
    }

    if (context.scissor) {
      renderer.disableScissor()
    }
  }
}
