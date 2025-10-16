import { Program } from '../types/program'
import { RenderPipeline, PipelineDescriptor } from './pipeline'

export class PipelineCache {
  // Map per program to avoid mixing state across different programs
  private readonly byProgram: WeakMap<Program, Map<string, RenderPipeline>> = new WeakMap()

  getOrCreate(desc: PipelineDescriptor): RenderPipeline {
    let map = this.byProgram.get(desc.program)
    if (!map) {
      map = new Map<string, RenderPipeline>()
      this.byProgram.set(desc.program, map)
    }

    const key = this.keyFor(desc)
    const cached = map.get(key)
    if (cached) return cached

    const pipeline = new RenderPipeline(desc)
    map.set(key, pipeline)

    return pipeline
  }

  private keyFor(desc: PipelineDescriptor): string {
    const cm = (desc.colorMask || [true, true, true, true]).map((b) => (b ? '1' : '0')).join('')
    // Shorten common depth tests
    const dt = this.shortDepth(desc.depthTest)
    return `c:${desc.cullMode}|b:${desc.blendMode}|dt:${dt}|dm:${desc.depthMask ? 1 : 0}|cm:${cm}`
  }

  private shortDepth(d: PipelineDescriptor['depthTest']): string {
    switch (d) {
      case 'Never': return 'N'
      case 'Always': return 'A'
      case 'Equal': return 'E'
      case 'NotEqual': return 'NE'
      case 'Less': return 'L'
      case 'LessEqual': return 'LE'
      case 'Greater': return 'G'
      case 'GreaterEqual': return 'GE'
      default: return 'None'
    }
  }
}

