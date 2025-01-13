import { Serializable, Serialize } from '@luz/utilities'

export class Weight extends Serializable<Weight> {
  @Serialize()
  readonly index: number

  @Serialize()
  readonly weight: number
}
