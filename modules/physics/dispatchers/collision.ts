import { Dispatcher } from '@luz/utilities'
import { Collider } from '../collider'
import { Collision } from '../collision'
import { collideCuboidWithCuboid } from '../collisions/cuboid/cuboid'
import { collidePlaneWithCuboid } from '../collisions/plane/cuboid'
import { collidePlaneWithSphere } from '../collisions/plane/sphere'
import { collideRayWithCuboid } from '../collisions/ray/cuboid'
import { collideRayWithPlane } from '../collisions/ray/plane'
import { collideRayWithRay } from '../collisions/ray/ray'
import { collideRayWithSphere } from '../collisions/ray/sphere'
import { collideSphereWithCuboid } from '../collisions/sphere/cuboid'
import { collideSphereWithSphere } from '../collisions/sphere/sphere'
import { collidePolygonWithSphere } from '../collisions/polygon/sphere'
import { collidePolygonWithCuboid } from '../collisions/polygon/cuboid'

export class CollisionDispatcher extends Dispatcher<Collider, Collision[]> {
  constructor() {
    super()

    // ray
    //this.register('ray', 'ray', collideRayWithRay)
    //this.register('ray', 'plane', collideRayWithPlane)
    //this.register('ray', 'sphere', collideRayWithSphere)
    //this.register('ray', 'cuboid', collideRayWithCuboid)

    // plane
    this.register('plane', 'sphere', collidePlaneWithSphere)
    this.register('plane', 'cuboid', collidePlaneWithCuboid)

    // polygon
    this.register('polygon', 'sphere', collidePolygonWithSphere)
    this.register('polygon', 'cuboid', collidePolygonWithCuboid)

    // sphere
    //this.register('sphere', 'sphere', collideSphereWithSphere)
    this.register('sphere', 'cuboid', collideSphereWithCuboid)

    // cuboid
    //this.register('cuboid', 'cuboid', collideCuboidWithCuboid)
  }
}
