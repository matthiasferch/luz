import { Serialized, Serializable } from '../utilities'

export abstract class Collider extends Serializable {
  @Serialized
  abstract readonly type: Collider.Type
}

export namespace Collider {
  export type Type = 'ray' | 'plane' | 'polygon' | 'sphere' | 'cuboid'
}
