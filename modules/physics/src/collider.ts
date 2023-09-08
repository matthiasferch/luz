import { Transform } from '@luz/core'

export abstract class Collider {

  abstract readonly type: Collider.Type

  abstract transform(transform: Transform): void

}

export module Collider {

  export enum Type {
    Ray = 'ray',
    Plane = 'plane',
    Sphere = 'sphere',
    Cuboid = 'cuboid'
  }

}
