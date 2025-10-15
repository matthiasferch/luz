import { Renderer, RenderPass } from '@luz/graphics'
import { PassContext } from './contexts'
import { Renderable } from './renderable'

export class RenderQueue {
  private items: Renderable[] = []

  add(renderable: Renderable) {
    this.items.push(renderable)
  }

  addMany(renderables: Renderable[]) {
    for (const r of renderables) this.items.push(r)
  }

  clear() {
    this.items.length = 0
  }

  size() {
    return this.items.length
  }

  // Default sorting: by explicit sortKey, then by depth (front-to-back)
  sort(compare?: (a: Renderable, b: Renderable) => number) {
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
  execute(renderer: Renderer, pass: RenderPass, ctx: PassContext) {
    // Bind target
    renderer.use(ctx.target)

    // Apply pass fixed state
    renderer.state.cullMode = pass.cullMode
    renderer.state.blendMode = pass.blendMode
    renderer.state.depthTest = pass.depthTest
    renderer.mask({ color: pass.colorMask, depth: pass.depthMask })
    renderer.clear({ color: pass.clearColor, depth: pass.clearDepth, stencil: pass.clearStencil })

    const program = pass.program
    if (!program) return

    // Optional scissor
    if (ctx.scissor) {
      renderer.enableScissor(ctx.scissor.x, ctx.scissor.y, ctx.scissor.width, ctx.scissor.height)
    }

    // Draw all items
    for (const item of this.items) {
      renderer.renderModel(ctx.camera as any, item.transform, item.model, ctx.light as any, program, ctx.uniforms)
    }

    if (ctx.scissor) {
      renderer.disableScissor()
    }
  }
}

