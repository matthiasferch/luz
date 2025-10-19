import { Serializable, Serialize } from '@luz/utilities'
import { RenderPipeline, RenderStage } from "./render-pipeline"

export class RenderFlow extends Serializable {
  @Serialize(RenderPipeline)
  readonly pipelines: Partial<Record<RenderStage, RenderPipeline>>

  static async deserialize(data: Partial<RenderFlow>) {
    return (await super.deserialize(data)) as RenderFlow
  }
}
