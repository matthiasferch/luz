import { findClosestSegmentPoints } from '../algorithms/closest-segment-points'
import { collideConvexShapes } from '../algorithms/convex-queries'
import { Epsilon, Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import type { Collision } from '../../collision'
import type { Cuboid } from '../../volumes/cuboid'
import type { Cylinder } from '../../volumes/cylinder'
import type { SupportPoint } from './plane-cylinder'
import { calculateCylinderSurfaceSupportPoints } from './plane-cylinder'
import { projectPointOntoPlane, surfaceContactSlop } from '../algorithms/surface-contact'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 64
})

interface AxisCandidate {
  axis: Vector3
  boxFaceIndex?: number
}

const calculateCylinderProjectionExtent = (cylinder: Cylinder, axis: Vector3) => {
  const axialAlignment = Math.min(1, Math.abs(Vector3.calculateDotProduct(cylinder.axes[2], axis)))
  const radialAlignment = Math.sqrt(Math.max(0, 1 - axialAlignment * axialAlignment))

  return cylinder.height * 0.5 * axialAlignment + cylinder.radius * radialAlignment
}

const calculateCuboidProjectionExtent = (cuboid: Cuboid, axis: Vector3) => {
  return (
    Math.abs(Vector3.calculateDotProduct(cuboid.axes[0], axis)) * cuboid.extents.x +
    Math.abs(Vector3.calculateDotProduct(cuboid.axes[1], axis)) * cuboid.extents.y +
    Math.abs(Vector3.calculateDotProduct(cuboid.axes[2], axis)) * cuboid.extents.z
  )
}

const addCandidateAxis = (candidates: AxisCandidate[], axis: Vector3, boxFaceIndex?: number) => {
  const length = axis.magnitude

  if (length <= Epsilon) {
    return
  }

  const normalizedAxis = Vector3.scale(axis, 1 / length, vectors.acquire())

  if (
    candidates.some(
      ({ axis: existingAxis }) => Math.abs(Vector3.calculateDotProduct(existingAxis, normalizedAxis)) >= 1 - 1e-6
    )
  ) {
    return
  }

  candidates.push({ axis: normalizedAxis, boxFaceIndex })
}

const createCandidateAxes = (cylinder: Cylinder, cuboid: Cuboid) => {
  const candidates: AxisCandidate[] = []
  const cylinderAxis = cylinder.axes[2].copyTo(vectors.acquire()).normalize()
  const offset = vectors.acquire()

  cuboid.axes.forEach((axis, index) => addCandidateAxis(candidates, axis, index))
  addCandidateAxis(candidates, cylinderAxis)
  cuboid.axes.forEach((axis) => {
    addCandidateAxis(candidates, Vector3.calculateCrossProduct(cylinderAxis, axis, offset))
  })

  const halfHeight = cylinder.height * 0.5
  const cylinderStart = Vector3.add(
    cylinder.center,
    Vector3.scale(cylinderAxis, -halfHeight, offset),
    vectors.acquire()
  )
  const cylinderEnd = Vector3.add(cylinder.center, Vector3.scale(cylinderAxis, halfHeight, offset), vectors.acquire())
  const cuboidVertices = cuboid.calculateVertices(Array.from({ length: 8 }, () => vectors.acquire()))
  const axisPoint = vectors.acquire()

  cuboidVertices.forEach((vertex) => {
    const fromCylinder = Vector3.subtract(vertex, cylinder.center, offset)
    const axialDistance = Math.max(
      -halfHeight,
      Math.min(halfHeight, Vector3.calculateDotProduct(fromCylinder, cylinderAxis))
    )

    Vector3.add(cylinder.center, Vector3.scale(cylinderAxis, axialDistance, axisPoint), axisPoint)
    addCandidateAxis(candidates, Vector3.subtract(vertex, axisPoint, offset))
  })

  const firstSegmentPoint = vectors.acquire()
  const secondSegmentPoint = vectors.acquire()

  cuboid.listEdges().forEach(([startIndex, endIndex]) => {
    findClosestSegmentPoints(
      cylinderStart,
      cylinderEnd,
      cuboidVertices[startIndex],
      cuboidVertices[endIndex],
      firstSegmentPoint,
      secondSegmentPoint
    )
    addCandidateAxis(candidates, Vector3.subtract(secondSegmentPoint, firstSegmentPoint, offset))
  })

  return candidates
}

const findContactsAgainstCuboidFace = (cylinder: Cylinder, cuboid: Cuboid, faceIndex: number, faceNormal: Vector3) => {
  const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z]
  const offset = vectors.acquire()
  const faceCenter = Vector3.add(
    cuboid.center,
    Vector3.scale(faceNormal, extents[faceIndex], offset),
    vectors.acquire()
  )
  const tangentIndices = [0, 1, 2].filter((index) => index !== faceIndex)
  const contacts: Collision[] = []
  const cylinderAxis = cylinder.axes[2]
  const faceAlignment = Math.abs(Vector3.calculateDotProduct(cylinderAxis, faceNormal))

  let supportPoints: SupportPoint[]

  if (faceAlignment >= 1 - 1e-6) {
    const capSign = Vector3.calculateDotProduct(cylinderAxis, faceNormal) >= 0 ? -1 : 1

    supportPoints = [
      {
        point: Vector3.add(
          cylinder.center,
          Vector3.scale(cylinderAxis, capSign * cylinder.height * 0.5, offset),
          vectors.acquire()
        ),
        featureId: `cylinder:cap:${capSign > 0 ? '+' : '-'}axis:center`,
        contactType: 'patch'
      }
    ]
  } else {
    supportPoints = calculateCylinderSurfaceSupportPoints(cylinder, faceNormal)
  }

  supportPoints.forEach(({ point, featureId, contactType }) => {
    const signedDistance = Vector3.calculateDotProduct(Vector3.subtract(point, faceCenter, offset), faceNormal)

    if (signedDistance > surfaceContactSlop) {
      return
    }

    const contact = projectPointOntoPlane(point, faceNormal, signedDistance)
    const faceOffset = Vector3.subtract(contact, faceCenter, offset)
    const isWithinFace = tangentIndices.every((index) => {
      return (
        Math.abs(Vector3.calculateDotProduct(faceOffset, cuboid.axes[index])) <= extents[index] + surfaceContactSlop
      )
    })

    if (!isWithinFace) {
      return
    }

    contacts.push({
      point: contact,
      normal: faceNormal.clone().scale(-1),
      penetrationDepth: Math.max(0, -signedDistance),
      featureId,
      isRestingContact: true,
      contactType
    })
  })

  return contacts
}

const calculateCylinderCuboidCollisions = (cylinder: Cylinder, cuboid: Cuboid): Collision[] | null => {
  const centerOffset = Vector3.subtract(cylinder.center, cuboid.center, vectors.acquire())

  let minimumOverlap = Infinity
  let minimumAxis: Vector3 | null = null
  let boxFaceIndex: number | undefined

  for (const candidate of createCandidateAxes(cylinder, cuboid)) {
    const cylinderExtent = calculateCylinderProjectionExtent(cylinder, candidate.axis)
    const cuboidExtent = calculateCuboidProjectionExtent(cuboid, candidate.axis)
    const centerDistance = Math.abs(Vector3.calculateDotProduct(centerOffset, candidate.axis))
    const overlap = cylinderExtent + cuboidExtent - centerDistance

    if (overlap < -Epsilon) {
      return null
    }

    if (overlap < minimumOverlap) {
      minimumOverlap = overlap
      minimumAxis = candidate.axis.copyTo(minimumAxis ?? vectors.acquire())
      boxFaceIndex = candidate.boxFaceIndex
    }
  }

  if (!minimumAxis || !Number.isFinite(minimumOverlap)) {
    return null
  }

  if (Vector3.calculateDotProduct(minimumAxis, centerOffset) < 0) {
    minimumAxis.scale(-1)
  }

  if (boxFaceIndex !== undefined) {
    const faceContacts = findContactsAgainstCuboidFace(cylinder, cuboid, boxFaceIndex, minimumAxis)

    if (faceContacts.length > 0) {
      return faceContacts
    }
  }

  return (
    collideConvexShapes(cylinder, cuboid)?.map((contact) => {
      const normal = contact.normal

      if (
        Vector3.calculateDotProduct(normal, minimumAxis!) < -0.999 &&
        Math.abs(contact.penetrationDepth - minimumOverlap) < 1e-4
      ) {
        return { ...contact, normal: minimumAxis!.clone().scale(-1), penetrationDepth: Math.max(0, minimumOverlap) }
      }

      return { ...contact, normal }
    }) ?? null
  )
}

export const collideCylinderWithCuboid = (cylinder: Cylinder, cuboid: Cuboid): Collision[] | null =>
  vectors.runInScope(() => calculateCylinderCuboidCollisions(cylinder, cuboid))
