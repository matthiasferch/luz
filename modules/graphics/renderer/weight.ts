import { Serializable, Serialize } from '@luz/utilities'

export class Weight extends Serializable<Weight> {
  @Serialize()
  readonly vertex: number

  @Serialize()
  readonly indices: number[]

  @Serialize()
  readonly weights: number[]
}
