import { Vector3 } from '@luz/math'
import type { Collision } from '../../collision'
import type { Sphere } from '../../volumes/sphere'

export const collideSphereWithSphere = (firstSphere: Sphere, secondSphere: Sphere): Collision[] | null => {
  const { center: firstCenter, radius: firstRadius } = firstSphere
  const { center: secondCenter, radius: secondRadius } = secondSphere

  const delta = Vector3.subtract(secondCenter, firstCenter, new Vector3())
  const distanceSquared = delta.squaredMagnitude
  const radiiSum = firstRadius + secondRadius

  if (distanceSquared > radiiSum * radiiSum) {
    return null
  }

  const distance = Math.sqrt(distanceSquared)

  const normal = distance > 0 ? Vector3.scale(delta, 1 / distance, new Vector3()) : Vector3.createRight()
  const contact = Vector3.add(firstCenter, Vector3.scale(normal, firstRadius, new Vector3()), new Vector3())
  const penetration = Math.max(0, radiiSum - distance)

  return [{ point: contact, normal, penetrationDepth: penetration }]
}
