import { Serialize, Serializable } from '../utilities'

export abstract class Collider extends Serializable {
  @Serialize
  abstract readonly type: Collider.Type
}

export namespace Collider {
  export type Type = 'ray' | 'plane' | 'polygon' | 'sphere' | 'cuboid'
}
