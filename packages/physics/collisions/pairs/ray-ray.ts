import { Vector3 } from '@luz/math'
import type { Ray } from '../../colliders/ray'
import type { RayIntersection } from '../../ray-intersection'

export const intersectRayWithRay = (firstRay: Ray, secondRay: Ray): RayIntersection | null => {
  firstRay.validate()
  secondRay.validate()

  const { direction: firstDirection, origin: firstOrigin } = firstRay
  const { direction: secondDirection, origin: secondOrigin } = secondRay

  const crossDirection = Vector3.calculateCrossProduct(firstDirection, secondDirection)
  const determinant = Vector3.calculateDotProduct(crossDirection, crossDirection)

  if (determinant === 0) {
    return null
  }

  const originOffset = Vector3.subtract(secondOrigin, firstOrigin)

  const secondDistance =
    Vector3.calculateDotProduct(Vector3.calculateCrossProduct(originOffset, firstDirection), crossDirection) /
    determinant
  const firstDistance =
    Vector3.calculateDotProduct(Vector3.calculateCrossProduct(originOffset, secondDirection), crossDirection) /
    determinant

  if (firstDistance < 0 || secondDistance < 0) {
    return null
  }

  const contact1 = Vector3.add(firstOrigin, Vector3.scale(firstDirection, firstDistance, new Vector3()), new Vector3())
  const contact2 = Vector3.add(
    secondOrigin,
    Vector3.scale(secondDirection, secondDistance, new Vector3()),
    new Vector3()
  )

  if (Vector3.subtract(contact1, contact2).magnitude > 1e-5) {
    return null
  }

  const normal = crossDirection.normalize()
  const distance = Vector3.calculateDotProduct(Vector3.subtract(contact1, firstOrigin), firstDirection)

  return { point: contact1, normal, distance }
}
