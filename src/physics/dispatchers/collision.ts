import { Dispatcher } from '../../utilities'
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

const { Type } = Collider

export class CollisionDispatcher extends Dispatcher<Collider, Collision> {

  constructor() {
    super()

    // ray
    this.register(Type.Ray, Type.Ray, collideRayWithRay)
    this.register(Type.Ray, Type.Plane, collideRayWithPlane)
    this.register(Type.Ray, Type.Sphere, collideRayWithSphere)
    this.register(Type.Ray, Type.Cuboid, collideRayWithCuboid)

    // plane
    this.register(Type.Plane, Type.Sphere, collidePlaneWithSphere)
    this.register(Type.Plane, Type.Cuboid, collidePlaneWithCuboid)

    // sphere
    this.register(Type.Sphere, Type.Sphere, collideSphereWithSphere)
    this.register(Type.Sphere, Type.Cuboid, collideSphereWithCuboid)

    // cuboid
    this.register(Type.Cuboid, Type.Cuboid, collideCuboidWithCuboid)
  }

}