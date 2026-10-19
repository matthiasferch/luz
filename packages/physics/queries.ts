import type { RayIntersection } from './ray-intersection'
import { Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import type { Collider } from './collider'
import type { Ray } from './colliders/ray'
import type { Plane } from './colliders/plane'
import type { Polygon } from './colliders/polygon'
import type { Sphere } from './volumes/sphere'
import type { Cuboid } from './volumes/cuboid'
import type { Cylinder } from './volumes/cylinder'
import type { Ellipsoid } from './volumes/ellipsoid'
import { Volume } from './volume'
import { intersectRayWithSphere } from './collisions/pairs/ray-sphere'
import { intersectRayWithCuboid } from './collisions/pairs/ray-cuboid'
import { intersectRayWithEllipsoid } from './collisions/pairs/ray-ellipsoid'
import { intersectRayWithPlane } from './collisions/pairs/ray-plane'
import { findClosestPointOnPolygon } from './collisions/algorithms/polygon-geometry'
import type { ConvexShape } from './collisions/algorithms/convex-queries'
import { calculateConvexDistance } from './collisions/algorithms/convex-queries'

export interface RayHit extends RayIntersection {
  collider: Collider
}
export interface QueryFilter {
  collisionMask?: number
}
export interface RaycastOptions extends QueryFilter {
  // World units.
  maximumDistance?: number
}
export interface SweepHit {
  collider: Collider
  fraction: number
  normal: Vector3
}

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 8
})

export const raycastCollider = (ray: Ray, collider: Collider, maximumDistance = Infinity): RayHit | null => {
  ray.validate()

  if (Number.isNaN(maximumDistance) || maximumDistance < 0) {
    throw new Error('Invalid ray maximum distance')
  }

  let hit: RayIntersection | null = null

  switch (collider.type) {
    case 'sphere':
      hit = intersectRayWithSphere(ray, collider as Sphere)
      break
    case 'cuboid':
      hit = intersectRayWithCuboid(ray, collider as Cuboid)
      break
    case 'ellipsoid':
      hit = intersectRayWithEllipsoid(ray, collider as Ellipsoid)
      break
    case 'plane':
      hit = intersectRayWithPlane(ray, collider as Plane)
      break
    case 'polygon': {
      const polygon = collider as Polygon
      const denominator = Vector3.calculateDotProduct(ray.direction, polygon.normal)

      if (Math.abs(denominator) < 1e-8) {
        return null
      }

      const distance =
        Vector3.calculateDotProduct(Vector3.subtract(polygon.vertices[0], ray.origin), polygon.normal) / denominator
      const point = Vector3.add(ray.origin, Vector3.scale(ray.direction, distance))

      if (Vector3.subtract(point, findClosestPointOnPolygon(point, polygon)).magnitude > 1e-5) {
        return null
      }

      hit = { point, normal: polygon.normal.clone(), distance }
      break
    }
    case 'cylinder': {
      const cylinder = collider as Cylinder,
        axis = cylinder.axes[2]
      const offset = Vector3.subtract(ray.origin, cylinder.center)
      const originHeight = Vector3.calculateDotProduct(offset, axis),
        directionHeight = Vector3.calculateDotProduct(ray.direction, axis)
      const radialOrigin = offset.subtract(Vector3.scale(axis, originHeight))
      const radialDirection = Vector3.subtract(ray.direction, Vector3.scale(axis, directionHeight))
      const candidates: Array<{ distance: number; normal: Vector3 }> = []
      const quadraticCoefficient = radialDirection.squaredMagnitude,
        linearCoefficient = 2 * Vector3.calculateDotProduct(radialOrigin, radialDirection)
      const constantCoefficient = radialOrigin.squaredMagnitude - cylinder.radius * cylinder.radius
      const discriminant = linearCoefficient * linearCoefficient - 4 * quadraticCoefficient * constantCoefficient

      if (quadraticCoefficient > 1e-12 && discriminant >= 0) {
        for (const sign of [-1, 1]) {
          const distance = (-linearCoefficient + sign * Math.sqrt(discriminant)) / (2 * quadraticCoefficient)

          if (Math.abs(originHeight + distance * directionHeight) <= cylinder.height / 2 + 1e-6) {
            candidates.push({
              distance,
              normal: Vector3.add(radialOrigin, Vector3.scale(radialDirection, distance)).normalize()
            })
          }
        }
      }

      if (Math.abs(directionHeight) > 1e-8) {
        for (const sign of [-1, 1]) {
          const distance = ((sign * cylinder.height) / 2 - originHeight) / directionHeight

          if (
            Vector3.add(radialOrigin, Vector3.scale(radialDirection, distance)).squaredMagnitude <=
            cylinder.radius * cylinder.radius + 1e-6
          ) {
            candidates.push({ distance, normal: Vector3.scale(axis, sign) })
          }
        }
      }

      const candidate = candidates
        .filter((value) => value.distance >= 0)
        .sort((firstHit, secondHit) => firstHit.distance - secondHit.distance)[0]

      if (candidate) {
        hit = { ...candidate, point: Vector3.add(ray.origin, Vector3.scale(ray.direction, candidate.distance)) }
      }

      break
    }
    default:
      throw new Error('Raycast is unsupported for ' + collider.type)
  }

  if (!hit || hit.distance < 0 || hit.distance > maximumDistance) {
    return null
  }

  return { collider, ...hit }
}

export const sweepVolume = (volume: Volume, displacement: Vector3, collider: Collider): SweepHit | null =>
  vectors.runInScope(() => {
    if (collider.type === 'plane') {
      const plane = collider as Plane
      const distance = plane.calculateSignedDistance(
        volume.calculateSupportPoint(Vector3.scale(plane.normal, -1, vectors.acquire()))
      )
      const speed = Vector3.calculateDotProduct(displacement, plane.normal)

      if (distance <= 0) {
        return { collider, fraction: 0, normal: plane.normal.clone() }
      }

      if (speed >= 0 || distance + speed > 0) {
        return null
      }

      return { collider, fraction: -distance / speed, normal: plane.normal.clone() }
    }

    const targets: ConvexShape[] =
      collider.type === 'polygon'
        ? (collider as Polygon).triangles.map((vertices) => ({
            center: vertices.reduce((sum, point) => sum.add(point), new Vector3()).scale(1 / 3),
            calculateSupportPoint: (direction: Vector3) =>
              vertices
                .reduce((supportPoint, point) =>
                  Vector3.calculateDotProduct(point, direction) > Vector3.calculateDotProduct(supportPoint, direction)
                    ? point
                    : supportPoint
                )
                .clone()
          }))
        : collider instanceof Volume
          ? [collider]
          : []

    if (!targets.length) {
      throw new Error('Sweep is unsupported for ' + collider.type)
    }

    const offset = vectors.acquire()
    const normal = vectors.acquire()
    const movingShape = {
      center: vectors.acquire(),
      calculateSupportPoint: (direction: Vector3) => volume.calculateSupportPoint(direction).add(offset)
    }

    let earliestHit: SweepHit | null = null

    for (const target of targets) {
      Vector3.scale(displacement, -1, normal).normalize()

      let fraction = 0

      for (let iteration = 0; iteration < 32; iteration++) {
        Vector3.scale(displacement, fraction, offset)
        Vector3.add(volume.center, offset, movingShape.center)

        const query = calculateConvexDistance(movingShape, target)

        if (query.distance <= 2e-5) {
          if (!earliestHit || fraction < earliestHit.fraction) {
            earliestHit = { collider, fraction, normal: normal.clone() }
          }

          break
        }

        query.normal.copyTo(normal).scale(-1)

        const closingSpeed = -Vector3.calculateDotProduct(displacement, normal)

        if (closingSpeed <= 1e-8) {
          break
        }

        fraction += query.distance / closingSpeed

        if (fraction > 1 || (earliestHit && fraction >= earliestHit.fraction)) {
          break
        }
      }
    }

    return earliestHit
  })
