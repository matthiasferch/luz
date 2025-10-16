import { State } from './state'

export type WebGPUPipelineDescriptor = {
  label?: string
  cullMode: State.CullMode
  blendMode: State.BlendMode
  depthTest: State.DepthTest
  depthMask: boolean
  colorMask: boolean[]
  // placeholders for future WebGPU specifics (shader modules, layouts)
  vertexEntry?: string
  fragmentEntry?: string
}

export class WebGPURenderPipeline {
  readonly desc: WebGPUPipelineDescriptor
  constructor(desc: WebGPUPipelineDescriptor) {
    this.desc = desc
  }
}

export class WebGPUPipelineCache {
  private readonly map = new Map<string, WebGPURenderPipeline>()
  getOrCreate(desc: WebGPUPipelineDescriptor): WebGPURenderPipeline {
    const key = this.keyFor(desc)
    const cached = this.map.get(key)
    if (cached) return cached
    const pipeline = new WebGPURenderPipeline(desc)
    this.map.set(key, pipeline)
    return pipeline
  }

  private keyFor(desc: WebGPUPipelineDescriptor): string {
    const cm = (desc.colorMask || [true, true, true, true]).map((b) => (b ? '1' : '0')).join('')
    const dt = this.shortDepth(desc.depthTest)
    return `c:${desc.cullMode}|b:${desc.blendMode}|dt:${dt}|dm:${desc.depthMask ? 1 : 0}|cm:${cm}`
  }

  private shortDepth(d: WebGPUPipelineDescriptor['depthTest']): string {
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

