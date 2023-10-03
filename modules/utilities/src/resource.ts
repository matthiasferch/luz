import { Serializable, Serialized } from './serializable'

export class Resource extends Serializable {

  @Serialized
  filepath: string

}