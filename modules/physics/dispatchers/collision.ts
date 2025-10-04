import { Dispatcher } from '@luz/utilities'
import { Collider } from '../collider'
import { Collision } from '../collision'
import { collideCuboidWithCuboid } from '../collisions/cuboid/cuboid'
import { collidePlaneWithCuboid } from '../collisions/plane/cuboid'
import { collidePlaneWithEllipsoid } from '../collisions/plane/ellipsoid'
import { collidePlaneWithSpheroid } from '../collisions/plane/spheroid'
import { collidePlaneWithSphere } from '../collisions/plane/sphere'
import { collideRayWithCuboid } from '../collisions/ray/cuboid'
import { collideRayWithPlane } from '../collisions/ray/plane'
import { collideRayWithRay } from '../collisions/ray/ray'
import { collideRayWithSphere } from '../collisions/ray/sphere'
import { collideSphereWithCuboid } from '../collisions/sphere/cuboid'
import { collideSphereWithEllipsoid } from '../collisions/sphere/ellipsoid'
import { collideSphereWithSphere } from '../collisions/sphere/sphere'
import { collidePolygonWithSphere } from '../collisions/polygon/sphere'
import { collidePolygonWithCuboid } from '../collisions/polygon/cuboid'
import { collidePolygonWithEllipsoid } from '../collisions/polygon/ellipsoid'
import { collidePolygonWithSpheroid } from '../collisions/polygon/spheroid'
import { collideEllipsoidWithCuboid } from '../collisions/ellipsoid/cuboid'

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
    this.register('Plane', 'Ellipsoid', collidePlaneWithEllipsoid)
    this.register('Plane', 'Spheroid', collidePlaneWithSpheroid)

    // polygon
    this.register('Polygon', 'Sphere', collidePolygonWithSphere)
    this.register('Polygon', 'Cuboid', collidePolygonWithCuboid)
    this.register('Polygon', 'Ellipsoid', collidePolygonWithEllipsoid)
    this.register('Polygon', 'Spheroid', collidePolygonWithSpheroid)

    // sphere
    //this.register('Sphere', 'Sphere', collideSphereWithSphere)
    this.register('Sphere', 'Cuboid', collideSphereWithCuboid)
    this.register('Sphere', 'Ellipsoid', collideSphereWithEllipsoid)

    // cuboid
    this.register('Cuboid', 'Cuboid', collideCuboidWithCuboid)
    this.register('Ellipsoid', 'Cuboid', collideEllipsoidWithCuboid)
  }
}
