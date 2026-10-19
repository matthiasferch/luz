import { Vector3 } from '@luz/math'
import type { Ray } from '../../colliders/ray'
import type { RayIntersection } from '../../ray-intersection'
import type { Ellipsoid } from '../../volumes/ellipsoid'

export const intersectRayWithEllipsoid = (ray: Ray, ellipsoid: Ellipsoid): RayIntersection | null => {
  ray.validate()

  const { origin, direction } = ray
  const { center } = ellipsoid
  const { x: radiusX, y: radiusY, z: radiusZ } = ellipsoid.radius

  const xAxis = ellipsoid.axes[0]
  const yAxis = ellipsoid.axes[1]
  const zAxis = ellipsoid.axes[2]

  const toScaledSpace = (point: Vector3, destination: Vector3 = new Vector3()) => {
    const relativePoint = Vector3.subtract(point, center, new Vector3())

    destination.x = Vector3.calculateDotProduct(relativePoint, xAxis) / radiusX
    destination.y = Vector3.calculateDotProduct(relativePoint, yAxis) / radiusY
    destination.z = Vector3.calculateDotProduct(relativePoint, zAxis) / radiusZ

    return destination
  }

  const scaledOrigin = toScaledSpace(origin)
  const scaledDirection = new Vector3([
    Vector3.calculateDotProduct(direction, xAxis) / radiusX,
    Vector3.calculateDotProduct(direction, yAxis) / radiusY,
    Vector3.calculateDotProduct(direction, zAxis) / radiusZ
  ])

  const quadraticA = Vector3.calculateDotProduct(scaledDirection, scaledDirection)
  const quadraticB = 2 * Vector3.calculateDotProduct(scaledOrigin, scaledDirection)
  const quadraticC = Vector3.calculateDotProduct(scaledOrigin, scaledOrigin) - 1

  const discriminant = quadraticB * quadraticB - 4 * quadraticA * quadraticC

  if (discriminant < 0) {
    return null
  }

  const discriminantRoot = Math.sqrt(discriminant)
  const inverseDoubleA = 1 / (2 * quadraticA)

  let nearTime = (-quadraticB - discriminantRoot) * inverseDoubleA
  let farTime = (-quadraticB + discriminantRoot) * inverseDoubleA

  if (nearTime > farTime) {
    const temporaryTime = nearTime

    nearTime = farTime
    farTime = temporaryTime
  }

  if (farTime < 0) {
    return null
  }

  const hitTime = nearTime >= 0 ? nearTime : farTime

  const scaledHit = Vector3.add(scaledOrigin, Vector3.scale(scaledDirection, hitTime, new Vector3()), new Vector3())

  const hit = Vector3.add(
    center,
    Vector3.add(
      Vector3.add(
        Vector3.scale(xAxis, radiusX * scaledHit.x, new Vector3()),
        Vector3.scale(yAxis, radiusY * scaledHit.y, new Vector3()),
        new Vector3()
      ),
      Vector3.scale(zAxis, radiusZ * scaledHit.z, new Vector3()),
      new Vector3()
    ),
    new Vector3()
  )

  let normal = Vector3.add(
    Vector3.add(
      Vector3.scale(xAxis, scaledHit.x / radiusX, new Vector3()),
      Vector3.scale(yAxis, scaledHit.y / radiusY, new Vector3()),
      new Vector3()
    ),
    Vector3.scale(zAxis, scaledHit.z / radiusZ, new Vector3()),
    new Vector3()
  )

  if (normal.magnitude > 0) {
    normal.normalize()
  } else {
    normal = direction.clone().normalize()
  }

  const distance = Vector3.subtract(hit, origin, new Vector3()).magnitude

  return { point: hit, normal, distance }
}
