import { Renderer } from './renderer'
import { RenderPass } from './pass'
import { RenderStage } from './render-stage'
import { FrameContext, PassContext, VisibilitySet } from './contexts'
import { LightingTask } from './lighting-task'
import { RenderQueue } from './render-queue'

// High-level orchestration of render stages. For Step 1, this is a thin
// container around stage queues; integration and behavior changes come later.
export class RenderGraph {
  private queues: Map<RenderStage, RenderQueue>

  constructor() {
    this.queues = new Map()
  }

  getQueue(stage: RenderStage): RenderQueue {
    let q = this.queues.get(stage)
    if (!q) {
      q = new RenderQueue()
      this.queues.set(stage, q)
    }
    return q
  }

  clear() {
    for (const q of this.queues.values()) q.clear()
  }

  // Execute the graph. For Step 1 scaffolding this method is intentionally
  // conservative and does not alter current behavior by itself; callers can
  // delegate to existing Renderer.renderPass or use queues explicitly.
  execute(
    _renderer: Renderer,
    _passes: Partial<Record<RenderStage, RenderPass>>,
    _frame: FrameContext,
    _visibility: VisibilitySet,
    _lighting: LightingTask[]
  ) {
    // No-op placeholder; wiring happens in subsequent steps.
    return
  }

  // Utility to run a single stage queue with explicit context.
  runStage(renderer: Renderer, stage: RenderStage, pass: RenderPass, ctx: PassContext) {
    const q = this.getQueue(stage)
    q.sort()
    q.execute(renderer, pass, ctx)
  }
}
