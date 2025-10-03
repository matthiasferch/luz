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

export class CollisionDispatcher extends Dispatcher<Collider, Collider.Type, Collision[]> {
  constructor() {
    super()

    // ray
    //this.register('Ray', 'Ray', collideRayWithRay)
    //this.register('Ray', 'Plane', collideRayWithPlane)
    //this.register('Ray', 'Sphere', collideRayWithSphere)
    //this.register('Ray', 'Cuboid', collideRayWithCuboid)

    // plane
    this.register('Plane', 'Sphere', collidePlaneWithSphere)
    this.register('Plane', 'Cuboid', collidePlaneWithCuboid)

    // polygon
    this.register('Polygon', 'Sphere', collidePolygonWithSphere)
    this.register('Polygon', 'Cuboid', collidePolygonWithCuboid)

    // sphere
    //this.register('Sphere', 'Sphere', collideSphereWithSphere)
    this.register('Sphere', 'Cuboid', collideSphereWithCuboid)

    // cuboid
    this.register('Cuboid', 'Cuboid', collideCuboidWithCuboid)
  }
}
