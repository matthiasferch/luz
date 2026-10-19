import type { Rectangle } from '@luz/core'
import type { ClearOptions, RenderBackend, RenderState } from './render-backend'
import type { RenderPipeline } from './render-pipeline'
import type { RenderTarget } from './render-target'

export interface RenderContext {
  target: RenderTarget
  scissor?: Rectangle
  clear?: Partial<ClearOptions>
}

export interface RenderPass extends RenderContext {
  pipeline: RenderPipeline
  overrideStates?: Partial<RenderState>
}

export function executeRenderPass(backend: RenderBackend, pass: RenderPass, render: () => void): void {
  backend.bindTarget(pass.target)
  backend.bindPipeline(pass.pipeline, pass.overrideStates)

  backend.scissor = pass.scissor ?? null

  try {
    if (pass.clear) {
      backend.clear(pass.clear)
    }

    render()
  } finally {
    if (pass.scissor) {
      backend.scissor = null
    }
  }
}
