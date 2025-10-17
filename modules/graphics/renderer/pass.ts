import { vec4 } from '@luz/vectors'
import { Program } from '../types/program'
import { State } from './state'
import { Serializable, Serialize } from '@luz/utilities'
import type { PipelineDescriptor } from './pipeline'

export class RenderPass extends Serializable {
  @Serialize()
  readonly clearColor: vec4 | undefined

  @Serialize()
  readonly clearDepth: number | undefined

  @Serialize()
  readonly clearStencil: number | undefined

  @Serialize()
  readonly cullMode: State.CullMode = 'Back'

  @Serialize()
  readonly blendMode: State.BlendMode = 'None'

  @Serialize()
  readonly depthTest: State.DepthTest = 'LessEqual'

  @Serialize()
  readonly depthMask: boolean = true

  @Serialize()
  readonly colorMask: boolean[] = [true, true, true, true]

  @Serialize()
  readonly vertexShader: string

  @Serialize()
  readonly fragmentShader: string

  program: Program | null = null

  constructor(data: Partial<RenderPass>) {
    super()

    Object.assign(this, data)
  }

  static async deserialize(data: Partial<RenderPass>) {
    return (await super.deserialize(data)) as RenderPass
  }

  // Convenience to derive the fixed-state pipeline descriptor used by caches.
  toPipelineDescriptor(): PipelineDescriptor | null {
    if (!this.program) return null
    return {
      program: this.program,
      cullMode: this.cullMode,
      blendMode: this.blendMode,
      depthTest: this.depthTest,
      depthMask: this.depthMask,
      colorMask: this.colorMask
    }
  }
}
