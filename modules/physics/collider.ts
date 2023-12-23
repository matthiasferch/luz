import { Serialized, Serializable } from "../utilities"

export abstract class Collider extends Serializable {

  @Serialized
  abstract readonly type: Collider.Type

}

export module Collider {

  export enum Type {
    Ray = 'ray',
    Plane = 'plane',
    Sphere = 'sphere',
    Cuboid = 'cuboid'
  }

}
