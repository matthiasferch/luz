import { vec4 } from '@luz/vectors'
import { Program } from '../types/program'
import { Serializable, Serialize } from '@luz/utilities'
import { CullMode, BlendMode, DepthTest } from './renderer'

export class RenderPipeline extends Serializable {
  @Serialize()
  readonly clearColor: vec4 | undefined

  @Serialize()
  readonly clearDepth: number | undefined

  @Serialize()
  readonly clearStencil: number | undefined

  @Serialize()
  readonly cullMode: CullMode = 'Back'

  @Serialize()
  readonly blendMode: BlendMode = 'None'

  @Serialize()
  readonly depthTest: DepthTest = 'LessEqual'

  @Serialize()
  readonly depthMask: boolean = true

  @Serialize()
  readonly colorMask: boolean[] = [true, true, true, true]

  @Serialize()
  readonly vertexShader: string

  @Serialize()
  readonly fragmentShader: string

  program: Program | null = null

  constructor(data: Partial<RenderPipeline>) {
    super()

    Object.assign(this, data)
  }

  static async deserialize(data: Partial<RenderPipeline>) {
    return (await super.deserialize(data)) as RenderPipeline
  }
}

export type RenderStage = 'Depth' | 'Ambient' | 'ShadowMapping' | 'Lighting' | 'Transparent' | 'Overlay' | 'Composite'