import { Serializable, Serialize } from '@luz/serialization'
import type { RenderStage } from './render-pipeline'
import { RenderPipeline } from './render-pipeline'

export class RenderFlow extends Serializable {
  @Serialize(RenderPipeline)
  readonly pipelines!: Partial<Record<RenderStage, RenderPipeline>>

  static async deserialize(data: unknown): Promise<RenderFlow> {
    return (await super.deserialize(data)) as RenderFlow
  }
}
