import type { Tuple2 } from '@luz/formats'
import { findClosestSegmentPoints } from '../algorithms/closest-segment-points'
import { Epsilon, Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import type { Collision } from '../../collision'
import type { Cuboid } from '../../volumes/cuboid'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 64
})

const projectExtent = (axis: Vector3, axes: Vector3[], extents: Vector3): number => {
  return (
    Math.abs(Vector3.calculateDotProduct(axis, axes[0])) * extents.x +
    Math.abs(Vector3.calculateDotProduct(axis, axes[1])) * extents.y +
    Math.abs(Vector3.calculateDotProduct(axis, axes[2])) * extents.z
  )
}

const chooseFaceTangentIndices = (mainAxisIndex: number): Tuple2 => {
  switch (mainAxisIndex) {
    case 0:
      return [1, 2]
    case 1:
      return [0, 2]
    default:
      return [0, 1]
  }
}

const calculateFaceCenterAndBasis = (
  center: Vector3,
  axes: Vector3[],
  extents: Vector3,
  faceAxisIndex: number,
  faceSign: number
) => {
  const normal = Vector3.scale(axes[faceAxisIndex], faceSign, vectors.acquire())
  const faceCenter = Vector3.add(
    center,
    Vector3.scale(axes[faceAxisIndex], extents[faceAxisIndex] * faceSign, vectors.acquire()),
    vectors.acquire()
  )
  const [firstTangentIndex, secondTangentIndex] = chooseFaceTangentIndices(faceAxisIndex)
  const firstTangent = axes[firstTangentIndex]
  const secondTangent = axes[secondTangentIndex]
  const firstExtent = extents[firstTangentIndex]
  const secondExtent = extents[secondTangentIndex]

  return {
    faceCenter,
    normal,
    firstTangent,
    secondTangent,
    firstExtent,
    secondExtent,
    firstTangentIndex,
    secondTangentIndex
  }
}

const calculateFaceVertices = (
  faceCenter: Vector3,
  firstTangent: Vector3,
  secondTangent: Vector3,
  firstExtent: number,
  secondExtent: number
): Vector3[] => {
  const firstCorner = Vector3.add(
    faceCenter,
    Vector3.add(
      Vector3.scale(firstTangent, -firstExtent, vectors.acquire()),
      Vector3.scale(secondTangent, -secondExtent, vectors.acquire()),
      vectors.acquire()
    ),
    vectors.acquire()
  )
  const secondCorner = Vector3.add(
    faceCenter,
    Vector3.add(
      Vector3.scale(firstTangent, +firstExtent, vectors.acquire()),
      Vector3.scale(secondTangent, -secondExtent, vectors.acquire()),
      vectors.acquire()
    ),
    vectors.acquire()
  )
  const thirdCorner = Vector3.add(
    faceCenter,
    Vector3.add(
      Vector3.scale(firstTangent, +firstExtent, vectors.acquire()),
      Vector3.scale(secondTangent, +secondExtent, vectors.acquire()),
      vectors.acquire()
    ),
    vectors.acquire()
  )
  const fourthCorner = Vector3.add(
    faceCenter,
    Vector3.add(
      Vector3.scale(firstTangent, -firstExtent, vectors.acquire()),
      Vector3.scale(secondTangent, +secondExtent, vectors.acquire()),
      vectors.acquire()
    ),
    vectors.acquire()
  )

  return [firstCorner, secondCorner, thirdCorner, fourthCorner]
}

const reduceFaceContacts = (collisions: Collision[], tangent1: Vector3, tangent2: Vector3): Collision[] => {
  if (collisions.length <= 4) {
    return collisions.slice()
  }

  const centroid = collisions
    .reduce((accumulator, collision) => Vector3.add(accumulator, collision.point, accumulator), vectors.acquire())
    .scale(1 / collisions.length)
  const projections = collisions.map((collision) => {
    const offset = Vector3.subtract(collision.point, centroid, vectors.acquire())

    return {
      collision,
      alongFirstTangent: Vector3.calculateDotProduct(offset, tangent1),
      alongSecondTangent: Vector3.calculateDotProduct(offset, tangent2)
    }
  })

  const minimumFirstTangent = Math.min(...projections.map(({ alongFirstTangent }) => alongFirstTangent))
  const maximumFirstTangent = Math.max(...projections.map(({ alongFirstTangent }) => alongFirstTangent))
  const minimumSecondTangent = Math.min(...projections.map(({ alongSecondTangent }) => alongSecondTangent))
  const maximumSecondTangent = Math.max(...projections.map(({ alongSecondTangent }) => alongSecondTangent))

  const cornerTargets: Array<Tuple2> = [
    [minimumFirstTangent, minimumSecondTangent],
    [maximumFirstTangent, minimumSecondTangent],
    [maximumFirstTangent, maximumSecondTangent],
    [minimumFirstTangent, maximumSecondTangent]
  ]

  const selectedContacts: Collision[] = []

  for (const [firstTangentTarget, secondTangentTarget] of cornerTargets) {
    let bestProjection = projections[0]
    let bestDistance = Infinity

    for (const projection of projections) {
      const distance =
        (projection.alongFirstTangent - firstTangentTarget) ** 2 +
        (projection.alongSecondTangent - secondTangentTarget) ** 2

      if (distance < bestDistance) {
        bestDistance = distance
        bestProjection = projection
      }
    }

    if (
      !selectedContacts.some(
        ({ point: contact }) =>
          Vector3.subtract(contact, bestProjection.collision.point, vectors.acquire()).magnitude <= Epsilon
      )
    ) {
      selectedContacts.push(bestProjection.collision)
    }
  }

  if (selectedContacts.length >= 3) {
    return selectedContacts
  }

  const isFirstAxisDominant = maximumFirstTangent - minimumFirstTangent >= maximumSecondTangent - minimumSecondTangent
  const minimumProjection = projections.reduce((minimumCandidate, projection) => {
    return projection[isFirstAxisDominant ? 'alongFirstTangent' : 'alongSecondTangent'] <
      minimumCandidate[isFirstAxisDominant ? 'alongFirstTangent' : 'alongSecondTangent']
      ? projection
      : minimumCandidate
  })
  const maximumProjection = projections.reduce((maximumCandidate, projection) => {
    return projection[isFirstAxisDominant ? 'alongFirstTangent' : 'alongSecondTangent'] >
      maximumCandidate[isFirstAxisDominant ? 'alongFirstTangent' : 'alongSecondTangent']
      ? projection
      : maximumCandidate
  })

  return [minimumProjection.collision, maximumProjection.collision]
}

type AxisType = 'faceA' | 'faceB' | 'edgeEdge'
interface FaceVertex {
  point: Vector3
  u: number
  v: number
}

const formatAxisLabel = (index: number) => ['x', 'y', 'z'][index] ?? 'axis'

const formatSignedAxisLabel = (index: number, sign: number) => `${sign >= 0 ? '+' : '-'}${formatAxisLabel(index)}`

const createFacePatchFeatureId = (
  type: AxisType,
  faceAxisIndex: number,
  faceSign: number,
  tangentAxis1: number,
  tangentAxis2: number,
  u: number,
  v: number
) => {
  const owner = type === 'faceA' ? 'a' : 'b'

  return `cuboid:${owner}:face:${formatSignedAxisLabel(faceAxisIndex, faceSign)}:patch:${formatSignedAxisLabel(tangentAxis1, u)}:${formatSignedAxisLabel(tangentAxis2, v)}`
}

const clipFacePolygonAgainstBound = (
  polygon: FaceVertex[],
  axis: 'u' | 'v',
  limit: number,
  isUpperBound: boolean
): FaceVertex[] => {
  const result: FaceVertex[] = []

  if (polygon.length === 0) {
    return result
  }

  const selectComponent = (vertex: FaceVertex) => (axis === 'u' ? vertex.u : vertex.v)

  const calculateSignedDistance = (vertex: FaceVertex) => {
    const value = selectComponent(vertex)

    return isUpperBound ? value - limit : limit - value
  }

  for (let index = 0; index < polygon.length; index++) {
    const firstPoint = polygon[index]
    const secondPoint = polygon[(index + 1) % polygon.length]
    const firstDistance = calculateSignedDistance(firstPoint)
    const secondDistance = calculateSignedDistance(secondPoint)
    const isFirstInside = firstDistance <= Epsilon
    const isSecondInside = secondDistance <= Epsilon

    const interpolateVertex = () => {
      const interpolationWeight = firstDistance / (firstDistance - secondDistance)

      return {
        point: Vector3.add(
          firstPoint.point,
          Vector3.scale(
            Vector3.subtract(secondPoint.point, firstPoint.point, vectors.acquire()),
            interpolationWeight,
            vectors.acquire()
          ),
          vectors.acquire()
        ),
        u: firstPoint.u + (secondPoint.u - firstPoint.u) * interpolationWeight,
        v: firstPoint.v + (secondPoint.v - firstPoint.v) * interpolationWeight
      }
    }

    if (isFirstInside && isSecondInside) {
      result.push({
        point: secondPoint.point.copyTo(vectors.acquire()),
        u: secondPoint.u,
        v: secondPoint.v
      })
    } else if (isFirstInside && !isSecondInside) {
      result.push(interpolateVertex())
    } else if (!isFirstInside && isSecondInside) {
      result.push(interpolateVertex())
      result.push({
        point: secondPoint.point.copyTo(vectors.acquire()),
        u: secondPoint.u,
        v: secondPoint.v
      })
    }
  }

  return result
}

const findClosestPointBetweenSegmentsMidpoint = (
  firstCenter: Vector3,
  firstAxis: Vector3,
  firstExtent: number,
  secondCenter: Vector3,
  secondAxis: Vector3,
  secondExtent: number
): Vector3 => {
  const [firstPoint, secondPoint] = findClosestSegmentPoints(
    Vector3.subtract(firstCenter, Vector3.scale(firstAxis, firstExtent, vectors.acquire()), vectors.acquire()),
    Vector3.add(firstCenter, Vector3.scale(firstAxis, firstExtent, vectors.acquire()), vectors.acquire()),
    Vector3.subtract(secondCenter, Vector3.scale(secondAxis, secondExtent, vectors.acquire()), vectors.acquire()),
    Vector3.add(secondCenter, Vector3.scale(secondAxis, secondExtent, vectors.acquire()), vectors.acquire()),
    vectors.acquire(),
    vectors.acquire()
  )

  return Vector3.add(firstPoint, secondPoint).scale(0.5)
}

const calculateTypeBias = (type: AxisType | null) => (type === 'edgeEdge' ? 1e-4 : 0)

const calculateNonzeroSign = (value: number, fallback: 1 | -1) => (value > 0 ? 1 : value < 0 ? -1 : fallback)

const calculateCuboidCollisions = (firstCuboid: Cuboid, secondCuboid: Cuboid): Collision[] | null => {
  const axesA = [
    firstCuboid.axes[0].copyTo(vectors.acquire()).normalize(),
    firstCuboid.axes[1].copyTo(vectors.acquire()).normalize(),
    firstCuboid.axes[2].copyTo(vectors.acquire()).normalize()
  ]
  const axesB = [
    secondCuboid.axes[0].copyTo(vectors.acquire()).normalize(),
    secondCuboid.axes[1].copyTo(vectors.acquire()).normalize(),
    secondCuboid.axes[2].copyTo(vectors.acquire()).normalize()
  ]

  const firstExtents = firstCuboid.extents
  const secondExtents = secondCuboid.extents
  const firstCenter = firstCuboid.center
  const secondCenter = secondCuboid.center

  const centerOffset = Vector3.subtract(secondCenter, firstCenter, vectors.acquire())

  let bestAxis = vectors.acquire()
  let bestDepth = Infinity
  let bestType: AxisType | null = null
  let bestIndexA = -1
  let bestIndexB = -1

  const evaluateAxis = (axis: Vector3, type: AxisType, index: number, secondIndex: number): boolean => {
    const length = axis.magnitude

    if (length < Epsilon) {
      return true
    }

    const normalizedAxis = Vector3.scale(axis, 1 / length, vectors.acquire())
    const firstProjectedExtent = projectExtent(normalizedAxis, axesA, firstExtents)
    const secondProjectedExtent = projectExtent(normalizedAxis, axesB, secondExtents)
    const distance = Math.abs(Vector3.calculateDotProduct(centerOffset, normalizedAxis))
    const overlap = firstProjectedExtent + secondProjectedExtent - distance

    if (overlap < -Epsilon) {
      return false
    }

    if (overlap + calculateTypeBias(type) < bestDepth + calculateTypeBias(bestType)) {
      bestDepth = overlap
      bestAxis = normalizedAxis.copyTo(bestAxis)
      bestType = type
      bestIndexA = index
      bestIndexB = secondIndex
    }

    return true
  }

  for (let index = 0; index < 3; index++) {
    if (!evaluateAxis(axesA[index], 'faceA', index, -1)) {
      return null
    }

    if (!evaluateAxis(axesB[index], 'faceB', -1, index)) {
      return null
    }
  }

  for (let index = 0; index < 3; index++) {
    for (let secondIndex = 0; secondIndex < 3; secondIndex++) {
      const axis = Vector3.calculateCrossProduct(axesA[index], axesB[secondIndex], vectors.acquire())

      if (!evaluateAxis(axis, 'edgeEdge', index, secondIndex)) {
        return null
      }
    }
  }

  if (!bestType || !isFinite(bestDepth)) {
    return null
  }

  const normal = bestAxis.copyTo(vectors.acquire())

  if (Vector3.calculateDotProduct(centerOffset, normal) < 0) {
    normal.scale(-1)
  }

  const collisions: Collision[] = []

  if (bestType === 'faceA' || bestType === 'faceB') {
    const isFirstReference = bestType === 'faceA'
    const referenceAxes = isFirstReference ? axesA : axesB
    const referenceExtents = isFirstReference ? firstExtents : secondExtents
    const referenceCenter = isFirstReference ? firstCenter : secondCenter
    const referencePlaneNormal = isFirstReference ? normal : Vector3.scale(normal, -1, vectors.acquire())
    const referenceAxisIndex = isFirstReference ? bestIndexA : bestIndexB
    const faceDirectionSign =
      Vector3.calculateDotProduct(referenceAxes[referenceAxisIndex], referencePlaneNormal) >= 0 ? +1 : -1
    const {
      faceCenter: referenceFaceCenter,
      firstTangent,
      secondTangent,
      firstExtent,
      secondExtent,
      firstTangentIndex: referenceTangentIndex1,
      secondTangentIndex: referenceTangentIndex2
    } = calculateFaceCenterAndBasis(
      referenceCenter,
      referenceAxes,
      referenceExtents,
      referenceAxisIndex,
      faceDirectionSign
    )

    const incidentAxes = isFirstReference ? axesB : axesA
    const incidentExtents = isFirstReference ? secondExtents : firstExtents
    const incidentCenter = isFirstReference ? secondCenter : firstCenter

    let incidentFaceIndex = 0
    let maximumAlignment = -Infinity
    let incidentFaceSign: 1 | -1 = 1

    for (let index = 0; index < 3; index++) {
      const normalProjection = Vector3.calculateDotProduct(incidentAxes[index], referencePlaneNormal)
      const alignment = Math.abs(normalProjection)

      if (alignment > maximumAlignment) {
        maximumAlignment = alignment
        incidentFaceIndex = index
        incidentFaceSign = normalProjection > 0 ? -1 : +1
      }
    }

    const {
      faceCenter: incidentFaceCenter,
      firstTangent: incidentFirstTangent,
      secondTangent: incidentSecondTangent,
      firstExtent: incidentFirstExtent,
      secondExtent: incidentSecondExtent
    } = calculateFaceCenterAndBasis(incidentCenter, incidentAxes, incidentExtents, incidentFaceIndex, incidentFaceSign)

    let polygon = calculateFaceVertices(
      incidentFaceCenter,
      incidentFirstTangent,
      incidentSecondTangent,
      incidentFirstExtent,
      incidentSecondExtent
    ).map((point) => {
      const relativePoint = Vector3.subtract(point, referenceFaceCenter, vectors.acquire())

      return {
        point,
        u: Vector3.calculateDotProduct(relativePoint, firstTangent),
        v: Vector3.calculateDotProduct(relativePoint, secondTangent)
      }
    })

    polygon = clipFacePolygonAgainstBound(polygon, 'u', firstExtent, true)
    polygon = clipFacePolygonAgainstBound(polygon, 'u', -firstExtent, false)
    polygon = clipFacePolygonAgainstBound(polygon, 'v', secondExtent, true)
    polygon = clipFacePolygonAgainstBound(polygon, 'v', -secondExtent, false)

    if (polygon.length === 0) {
      return null
    }

    const referencePlaneDistance = Vector3.calculateDotProduct(referencePlaneNormal, referenceFaceCenter)

    for (const { point, u, v } of polygon) {
      const penetration = referencePlaneDistance - Vector3.calculateDotProduct(referencePlaneNormal, point)

      if (penetration >= -Epsilon) {
        const depth = Math.max(0, penetration)
        const contact = Vector3.add(
          point,
          Vector3.scale(referencePlaneNormal, depth * 0.5, vectors.acquire()),
          new Vector3()
        )

        collisions.push({
          point: contact,
          normal: normal.clone(),
          penetrationDepth: depth,
          featureId: createFacePatchFeatureId(
            bestType,
            referenceAxisIndex,
            faceDirectionSign,
            referenceTangentIndex1,
            referenceTangentIndex2,
            u,
            v
          ),
          isRestingContact: true,
          contactType: 'patch'
        })
      }
    }

    if (collisions.length === 0) {
      const centroid = polygon
        .reduce((accumulator, { point }) => Vector3.add(accumulator, point, accumulator), new Vector3())
        .scale(1 / polygon.length)
      const penetration = referencePlaneDistance - Vector3.calculateDotProduct(referencePlaneNormal, centroid)
      const depth = Math.max(0, penetration)
      const contact = Vector3.add(
        centroid,
        Vector3.scale(referencePlaneNormal, depth * 0.5, vectors.acquire()),
        centroid
      )

      collisions.push({
        point: contact,
        normal: normal.clone(),
        penetrationDepth: depth,
        featureId: `cuboid:${isFirstReference ? 'a' : 'b'}:face:${formatSignedAxisLabel(referenceAxisIndex, faceDirectionSign)}:patch:center`,
        isRestingContact: true,
        contactType: 'patch'
      })
    }

    const reducedCollisions = reduceFaceContacts(collisions, firstTangent, secondTangent)

    collisions.length = 0

    collisions.push(...reducedCollisions)
  } else {
    const index = bestIndexA
    const secondIndex = bestIndexB

    const otherA: Tuple2 = chooseFaceTangentIndices(index)
    const otherB: Tuple2 = chooseFaceTangentIndices(secondIndex)

    const signA1 = calculateNonzeroSign(Vector3.calculateDotProduct(centerOffset, axesA[otherA[0]]), 1)
    const signA2 = calculateNonzeroSign(Vector3.calculateDotProduct(centerOffset, axesA[otherA[1]]), 1)
    const signB1 = -calculateNonzeroSign(Vector3.calculateDotProduct(centerOffset, axesB[otherB[0]]), 1) as 1 | -1
    const signB2 = -calculateNonzeroSign(Vector3.calculateDotProduct(centerOffset, axesB[otherB[1]]), 1) as 1 | -1

    const baseA = Vector3.add(
      Vector3.add(
        firstCenter,
        Vector3.scale(axesA[otherA[0]], firstExtents[otherA[0]] * signA1, vectors.acquire()),
        vectors.acquire()
      ),
      Vector3.scale(axesA[otherA[1]], firstExtents[otherA[1]] * signA2, vectors.acquire()),
      vectors.acquire()
    )
    const baseB = Vector3.add(
      Vector3.add(
        secondCenter,
        Vector3.scale(axesB[otherB[0]], secondExtents[otherB[0]] * signB1, vectors.acquire()),
        vectors.acquire()
      ),
      Vector3.scale(axesB[otherB[1]], secondExtents[otherB[1]] * signB2, vectors.acquire()),
      vectors.acquire()
    )

    const firstEdgeDirection = axesA[index].copyTo(vectors.acquire())
    const secondEdgeDirection = axesB[secondIndex].copyTo(vectors.acquire())
    const firstEdgeCenter = baseA
    const secondEdgeCenter = baseB

    const contact = findClosestPointBetweenSegmentsMidpoint(
      firstEdgeCenter,
      firstEdgeDirection,
      firstExtents[index],
      secondEdgeCenter,
      secondEdgeDirection,
      secondExtents[secondIndex]
    )

    const depth = Math.max(0, bestDepth)

    collisions.push({
      point: contact,
      normal: normal.clone(),
      penetrationDepth: depth,
      featureId: `cuboid:a:edge:${formatAxisLabel(index)}:cuboid:b:edge:${formatAxisLabel(secondIndex)}`,
      isRestingContact: false,
      contactType: 'point'
    })
  }

  return collisions.length > 0 ? collisions : null
}

export const collideCuboidWithCuboid = (firstCuboid: Cuboid, secondCuboid: Cuboid): Collision[] | null =>
  vectors.runInScope(() => calculateCuboidCollisions(firstCuboid, secondCuboid))
