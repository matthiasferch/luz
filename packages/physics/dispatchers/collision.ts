import { Dispatcher } from '@luz/serialization'
import type { Collider } from '../collider'
import type { Collision } from '../collision'
import { collideCuboidWithCuboid } from '../collisions/pairs/cuboid-cuboid'
import { collidePlaneWithCuboid } from '../collisions/pairs/plane-cuboid'
import { collidePlaneWithEllipsoid } from '../collisions/pairs/plane-ellipsoid'
import { collidePlaneWithCylinder } from '../collisions/pairs/plane-cylinder'
import { collidePlaneWithSphere } from '../collisions/pairs/plane-sphere'
import { collideSphereWithCuboid } from '../collisions/pairs/sphere-cuboid'
import { collideSphereWithEllipsoid } from '../collisions/pairs/sphere-ellipsoid'
import { collideSphereWithCylinder } from '../collisions/pairs/sphere-cylinder'
import { collideSphereWithSphere } from '../collisions/pairs/sphere-sphere'
import { collidePolygonWithSphere } from '../collisions/pairs/polygon-sphere'
import { collidePolygonWithCuboid } from '../collisions/pairs/polygon-cuboid'
import { collidePolygonWithEllipsoid } from '../collisions/pairs/polygon-ellipsoid'
import { collidePolygonWithCylinder } from '../collisions/pairs/polygon-cylinder'
import { collideEllipsoidWithCuboid } from '../collisions/pairs/ellipsoid-cuboid'
import { collideEllipsoidWithCylinder } from '../collisions/pairs/ellipsoid-cylinder'
import { collideCylinderWithCylinder } from '../collisions/pairs/cylinder-cylinder'
import { collideCylinderWithCuboid } from '../collisions/pairs/cylinder-cuboid'
import { collideEllipsoidWithEllipsoid } from '../collisions/pairs/ellipsoid-ellipsoid'

export class CollisionDispatcher extends Dispatcher<Collider, string, Collision[]> {
  private registeredPairs = new Set<string>()

  register<First extends Collider, Second extends Collider>(
    firstType: First['type'],
    secondType: Second['type'],
    onCollide: (firstCollider: First, secondCollider: Second) => Collision[] | null
  ): void {
    this.registeredPairs.add(`${firstType}-${secondType}`)
    super.register(firstType, secondType, onCollide)
  }

  detectCollisions(firstCollider: Collider, secondCollider: Collider): Collision[] | null {
    const forwardPairKey = `${firstCollider.type}-${secondCollider.type}`
    const isPairReversed = !this.registeredPairs.has(forwardPairKey)
    const normalSign = isPairReversed ? -1 : 1

    return (
      this.dispatch(firstCollider, secondCollider)?.map((contact) => ({
        ...contact,
        normal: contact.normal.clone().scale(normalSign)
      })) ?? null
    )
  }

  isPairSupported(firstType: string, secondType: string): boolean {
    return (
      this.registeredPairs.has(firstType + '-' + secondType) || this.registeredPairs.has(secondType + '-' + firstType)
    )
  }

  get supportedPairs(): readonly string[] {
    return [...this.registeredPairs]
  }

  constructor() {
    super()
    this.register('plane', 'sphere', collidePlaneWithSphere)
    this.register('plane', 'cuboid', collidePlaneWithCuboid)
    this.register('plane', 'ellipsoid', collidePlaneWithEllipsoid)
    this.register('plane', 'cylinder', collidePlaneWithCylinder)
    this.register('polygon', 'sphere', collidePolygonWithSphere)
    this.register('polygon', 'cuboid', collidePolygonWithCuboid)
    this.register('polygon', 'ellipsoid', collidePolygonWithEllipsoid)
    this.register('polygon', 'cylinder', collidePolygonWithCylinder)
    this.register('sphere', 'sphere', collideSphereWithSphere)
    this.register('sphere', 'cuboid', collideSphereWithCuboid)
    this.register('sphere', 'ellipsoid', collideSphereWithEllipsoid)
    this.register('sphere', 'cylinder', collideSphereWithCylinder)
    this.register('cuboid', 'cuboid', collideCuboidWithCuboid)
    this.register('cylinder', 'cuboid', collideCylinderWithCuboid)
    this.register('ellipsoid', 'cuboid', collideEllipsoidWithCuboid)
    this.register('ellipsoid', 'cylinder', collideEllipsoidWithCylinder)
    this.register('ellipsoid', 'ellipsoid', collideEllipsoidWithEllipsoid)
    this.register('cylinder', 'cylinder', collideCylinderWithCylinder)
  }
}
