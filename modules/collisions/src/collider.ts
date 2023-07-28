import { Collision } from './collision'
import { Transform } from './transform'

export abstract class Collider {

  abstract collide(collider: Collider, t1: Transform, t2: Transform): Collision | null

  abstract transform(transform: Transform): Collider

}
