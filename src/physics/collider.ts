export abstract class Collider {

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
