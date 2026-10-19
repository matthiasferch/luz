import { BoundingBox } from '@luz/core'
import { Vector3 } from '@luz/math'
import type { Collider } from '../collider'
import type { Sphere } from '../volumes/sphere'
import type { Cuboid } from '../volumes/cuboid'
import type { Ellipsoid } from '../volumes/ellipsoid'
import type { Cylinder } from '../volumes/cylinder'
import type { Polygon } from '../colliders/polygon'

const unitAxes = Vector3.createAxes()

const calculateCenteredBoundingBox = (center: Vector3, halfExtents: Vector3, destination: BoundingBox): BoundingBox => {
  Vector3.subtract(center, halfExtents, destination.minimum)
  Vector3.add(center, halfExtents, destination.maximum)

  return destination
}

export const calculateColliderBoundingBox = (collider: Collider, destination = new BoundingBox()): BoundingBox => {
  switch (collider.type) {
    case 'sphere': {
      const { center, radius } = collider as Sphere

      destination.minimum.x = center.x - radius
      destination.minimum.y = center.y - radius
      destination.minimum.z = center.z - radius
      destination.maximum.x = center.x + radius
      destination.maximum.y = center.y + radius
      destination.maximum.z = center.z + radius

      return destination
    }
    case 'cuboid': {
      const { extents, center, axes } = collider as Cuboid
      const halfExtents = destination.maximum

      halfExtents.x =
        Math.abs(axes[0].x) * extents.x + Math.abs(axes[1].x) * extents.y + Math.abs(axes[2].x) * extents.z
      halfExtents.y =
        Math.abs(axes[0].y) * extents.x + Math.abs(axes[1].y) * extents.y + Math.abs(axes[2].y) * extents.z
      halfExtents.z =
        Math.abs(axes[0].z) * extents.x + Math.abs(axes[1].z) * extents.y + Math.abs(axes[2].z) * extents.z

      return calculateCenteredBoundingBox(center, halfExtents, destination)
    }
    case 'ellipsoid':
    case 'cylinder': {
      const volume = collider as Ellipsoid | Cylinder
      const halfExtents = destination.maximum

      halfExtents.x = volume.calculateEffectiveRadius(unitAxes[0])
      halfExtents.y = volume.calculateEffectiveRadius(unitAxes[1])
      halfExtents.z = volume.calculateEffectiveRadius(unitAxes[2])

      return calculateCenteredBoundingBox(volume.center, halfExtents, destination)
    }
    case 'polygon': {
      const { vertices } = collider as Polygon

      return BoundingBox.calculateFromPoints(vertices, destination)
    }
    default: {
      throw new Error(`Not implemented for collider type: ${collider.type}`)
    }
  }
}
