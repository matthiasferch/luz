import { Transform } from '@luz/core'
import { Collision } from './collision'

export abstract class Collider {

  abstract collide(collider: Collider): Collision | null

  abstract transform(transform: Transform): Collider

}
