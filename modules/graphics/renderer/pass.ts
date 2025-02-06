import { vec4 } from '@luz/vectors'
import { Program } from '../types/program'
import { State } from './state'
import { Serializable, Serialize } from '@luz/utilities'

export class RenderPass extends Serializable {
  @Serialize()
  readonly clearColor: vec4 = vec4.zero.copy()

  @Serialize()
  readonly clearDepth: number = 1.0

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

    this.clearColor.set(this.clearColor)
  }

  static async deserialize(data: Partial<RenderPass>) {
    return (await super.deserialize(data)) as RenderPass
  }
}
