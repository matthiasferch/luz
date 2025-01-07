import { Serializable, Serialized } from './serializable'

export class Asset extends Serializable {

  @Serialized
  path: string

}