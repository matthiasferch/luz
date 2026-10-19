import { Vector3 } from '@luz/math'
import type { Collision } from '../../collision'
import type { Sphere } from '../../volumes/sphere'
import type { Cylinder } from '../../volumes/cylinder'

const epsilon = 1e-6

export function collideSphereWithCylinder(sphere: Sphere, cylinder: Cylinder): Collision[] | null {
  const sphereCenter = sphere.center
  const cylinderCenter = cylinder.center
  const axis = cylinder.axes[2]
  const radius = cylinder.radius
  const halfHeight = cylinder.height / 2

  const centerOffset = Vector3.subtract(sphereCenter, cylinderCenter, new Vector3())
  const axialProjection = Vector3.calculateDotProduct(centerOffset, axis)
  const clampedAxialProjection = Math.max(-halfHeight, Math.min(halfHeight, axialProjection))

  const axial = Vector3.scale(axis, clampedAxialProjection, new Vector3())
  const radial = Vector3.subtract(centerOffset, Vector3.scale(axis, axialProjection), new Vector3())
  const radialLength = radial.magnitude

  const closestPoint = Vector3.add(cylinderCenter, axial, new Vector3())

  if (radialLength > epsilon) {
    const scale = Math.min(1, radius / radialLength)

    Vector3.add(closestPoint, Vector3.scale(radial, scale, new Vector3()), closestPoint)
  }

  const toClosest = Vector3.subtract(closestPoint, sphereCenter, new Vector3())
  const distance = toClosest.magnitude

  if (distance > sphere.radius) {
    return null
  }

  if (distance < epsilon) {
    const capClearance = halfHeight - Math.abs(axialProjection)
    const sideClearance = radius - radialLength
    const normal =
      capClearance < sideClearance
        ? Vector3.scale(axis, axialProjection >= 0 ? 1 : -1)
        : radialLength > epsilon
          ? radial.clone().normalize()
          : cylinder.axes[0].clone()
    const clearance = Math.min(capClearance, sideClearance)

    return [
      {
        point: Vector3.add(sphereCenter, Vector3.scale(normal, clearance)),
        normal: normal.clone().scale(-1),
        penetrationDepth: sphere.radius + clearance
      }
    ]
  }

  return [
    {
      point: closestPoint,
      normal: toClosest.normalize(),
      penetrationDepth: sphere.radius - distance
    }
  ]
}
