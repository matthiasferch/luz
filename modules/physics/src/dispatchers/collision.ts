import { Dispatcher } from '@luz/utilities'
import { Collider } from '../collider'
import { Collision } from '../collision'
import { collideCuboidWithCuboid } from '../collisions/cuboid'
import { collidePlaneWithCuboid, collidePlaneWithSphere } from '../collisions/plane'
import { collideRayWithCuboid, collideRayWithPlane, collideRayWithRay, collideRayWithSphere } from '../collisions/ray'
import { collideSphereWithCuboid, collideSphereWithSphere } from '../collisions/sphere'

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