import { Vector3 } from '@luz/math'
import type { Plane } from '../../colliders/plane'
import type { Collision, ContactType } from '../../collision'
import type { Cylinder } from '../../volumes/cylinder'
import { surfaceContactSlop, projectPointOntoPlane } from '../algorithms/surface-contact'

const flatSupportThreshold = 0.85
const lineSupportThreshold = 0.35
const supportPointEpsilon = 1e-6

export interface SupportPoint {
  point: Vector3
  featureId: string
  contactType: ContactType
}

export const calculateCylinderSurfaceSupportPoints = (cylinder: Cylinder, normal: Vector3): SupportPoint[] => {
  const axis = cylinder.axes[2]
  const axisAlignment = Math.abs(Vector3.calculateDotProduct(axis, normal))

  if (axisAlignment >= flatSupportThreshold) {
    const halfHeight = cylinder.height / 2
    const axialSign = Vector3.calculateDotProduct(axis, normal) >= 0 ? -1 : 1
    const capCenter = Vector3.add(
      cylinder.center,
      Vector3.scale(axis, axialSign * halfHeight, new Vector3()),
      new Vector3()
    )

    return [
      {
        point: Vector3.add(capCenter, Vector3.scale(cylinder.axes[0], cylinder.radius, new Vector3()), new Vector3()),
        featureId: `cylinder:cap:${axialSign > 0 ? '+' : '-'}axis:radial:+x`,
        contactType: 'patch'
      },
      {
        point: Vector3.add(capCenter, Vector3.scale(cylinder.axes[0], -cylinder.radius, new Vector3()), new Vector3()),
        featureId: `cylinder:cap:${axialSign > 0 ? '+' : '-'}axis:radial:-x`,
        contactType: 'patch'
      },
      {
        point: Vector3.add(capCenter, Vector3.scale(cylinder.axes[1], cylinder.radius, new Vector3()), new Vector3()),
        featureId: `cylinder:cap:${axialSign > 0 ? '+' : '-'}axis:radial:+y`,
        contactType: 'patch'
      },
      {
        point: Vector3.add(capCenter, Vector3.scale(cylinder.axes[1], -cylinder.radius, new Vector3()), new Vector3()),
        featureId: `cylinder:cap:${axialSign > 0 ? '+' : '-'}axis:radial:-y`,
        contactType: 'patch'
      }
    ]
  }

  if (axisAlignment <= lineSupportThreshold) {
    const radialDirection = Vector3.subtract(
      Vector3.scale(normal, -1, new Vector3()),
      Vector3.scale(axis, Vector3.calculateDotProduct(Vector3.scale(normal, -1, new Vector3()), axis), new Vector3()),
      new Vector3()
    )

    if (radialDirection.magnitude > supportPointEpsilon) {
      radialDirection.normalize().scale(cylinder.radius)

      const lineCenter = Vector3.add(cylinder.center, radialDirection, new Vector3())
      const halfHeightVector = Vector3.scale(axis, cylinder.height / 2, new Vector3())

      return [
        {
          point: Vector3.add(lineCenter, halfHeightVector, new Vector3()),
          featureId: 'cylinder:side-line:+axis',
          contactType: 'line'
        },
        {
          point: Vector3.subtract(lineCenter, halfHeightVector, new Vector3()),
          featureId: 'cylinder:side-line:-axis',
          contactType: 'line'
        }
      ]
    }
  }

  return [
    {
      point: cylinder.calculateSupportPoint(Vector3.scale(normal, -1, new Vector3())),
      featureId: 'cylinder:support-point',
      contactType: 'point'
    }
  ]
}

export function collidePlaneWithCylinder(plane: Plane, cylinder: Cylinder): Collision[] | null {
  const { normal, distance: planeDistance } = plane
  const collisions: Collision[] = []

  const exactSupport = cylinder.calculateSupportPoint(Vector3.scale(normal, -1))

  if (plane.calculateSignedDistance(exactSupport) > surfaceContactSlop) {
    return null
  }

  const supports = calculateCylinderSurfaceSupportPoints(cylinder, normal)

  if (
    plane.calculateSignedDistance(exactSupport) <
    Math.min(...supports.map(({ point }) => plane.calculateSignedDistance(point))) - supportPointEpsilon
  ) {
    supports.push({ point: exactSupport, featureId: 'cylinder:exact-support', contactType: 'point' })
  }

  supports.forEach(({ point, featureId, contactType }) => {
    const signedDistance = Vector3.calculateDotProduct(point, normal) - planeDistance

    if (signedDistance <= surfaceContactSlop) {
      collisions.push({
        point: projectPointOntoPlane(point, normal, signedDistance),
        normal: normal.clone(),
        penetrationDepth: Math.max(0, -signedDistance),
        featureId,
        isRestingContact: true,
        contactType
      })
    }
  })

  if (collisions.length === 0) {
    const support = cylinder.calculateSupportPoint(Vector3.scale(normal, -1))
    const signedDistance = plane.calculateSignedDistance(support)

    if (signedDistance <= surfaceContactSlop) {
      collisions.push({
        point: projectPointOntoPlane(support, normal, signedDistance),
        normal: normal.clone(),
        penetrationDepth: Math.max(0, -signedDistance),
        featureId: 'cylinder:support-point',
        isRestingContact: true,
        contactType: 'point'
      })
    }
  }

  if (collisions.length > 0) {
    return collisions
  }

  return null
}
