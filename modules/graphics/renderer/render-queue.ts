import { Renderer } from './renderer'
import { RenderPass } from './pass'
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
  render(renderer: Renderer, pass: RenderPass, context: RenderPassContext) {
    // Bind target
    renderer.use(context.target)

    // Apply pass fixed state
    renderer.state.cullMode = pass.cullMode
    renderer.state.blendMode = pass.blendMode
    renderer.state.depthTest = pass.depthTest

    renderer.mask({ color: pass.colorMask, depth: pass.depthMask })
    renderer.clear({ color: pass.clearColor, depth: pass.clearDepth, stencil: pass.clearStencil })

    const program = pass.program
    if (!program) return

    // Optional scissor
    if (context.scissor) {
      renderer.enableScissor(context.scissor)
    }

    // Per-pass uniform grouping (camera + light + extra uniforms)
    const passUniforms: Record<string, unknown> = Object.create(null)

    if (context.uniforms) {
      for (const [key, value] of Object.entries(context.uniforms)) {
        passUniforms[key] = value
      }
    }

    if (context.camera) {
      passUniforms['camera'] = context.camera
    }

    if (context.light) {
      passUniforms['light'] = context.light
    }

    // Draw all items
    for (const item of this.items) {
      renderer.renderModel(null, item.transform, item.model, null, program, passUniforms)
    }

    if (context.scissor) {
      renderer.disableScissor()
    }
  }
}
