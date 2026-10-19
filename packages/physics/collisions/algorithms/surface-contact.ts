import { Vector3 } from '@luz/math'
import type { Collision, ContactType } from '../../collision'

export const surfaceContactSlop = 0.005

export const isWithinSurfaceContactRange = (distance: number, extent: number, slop: number = surfaceContactSlop) => {
  return Math.abs(distance) <= extent + slop
}

export const calculatePenetrationAgainstSurface = (distance: number, extent: number) => {
  return Math.max(0, extent - Math.abs(distance))
}

export const projectPointOntoPlane = (point: Vector3, normal: Vector3, signedDistance: number) => {
  return Vector3.subtract(point, Vector3.scale(normal, signedDistance, new Vector3()), new Vector3())
}

export const createSurfaceCollision = (
  contact: Vector3,
  normal: Vector3,
  distance: number,
  extent: number,
  featureId?: string,
  contactType: ContactType = 'point',
  isRestingContact: boolean = true
): Collision => {
  return {
    point: contact,
    normal: normal.clone(),
    penetrationDepth: calculatePenetrationAgainstSurface(distance, extent),
    featureId,
    isRestingContact,
    contactType
  }
}
