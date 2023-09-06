import { Transform } from '@luz/core'
import { Collision } from './collision'

export abstract class Collider {

  abstract readonly type: Collider.Type

  abstract collide(collider: Collider): Collision | null

  abstract transform(transform: Transform): Collider

}

export module Collider {

  export enum Type {
    Ray = 'ray',
    Plane = 'plane',
    Sphere = 'sphere',
    Cuboid = 'cuboid'
  }

}
