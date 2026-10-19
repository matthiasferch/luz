import { getPolygonFacingPoint } from '../algorithms/polygon-geometry'
import { Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import type { Collision } from '../../collision'
import type { Cuboid } from '../../volumes/cuboid'
import type { Polygon } from '../../colliders/polygon'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 32
})

const epsilon = 1e-6
const CONTACT_SLOP = 1e-3
const SUPPORT_SLOP = 5e-3
const cuboidVertexSigns = [
  [+1, +1, +1],
  [+1, +1, -1],
  [+1, -1, +1],
  [+1, -1, -1],
  [-1, +1, +1],
  [-1, +1, -1],
  [-1, -1, +1],
  [-1, -1, -1]
]
const cuboidEdgeVertexIndices = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 0],
  [4, 5],
  [5, 7],
  [7, 6],
  [6, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7]
]

const formatSignLabel = (value: number, axis: string) => `${value > 0 ? '+' : '-'}${axis}`

const createCuboidVertexFeatureId = (index: number) => {
  const [sx, sy, sz] = cuboidVertexSigns[index]

  return `cuboid:vertex:${formatSignLabel(sx, 'x')}:${formatSignLabel(sy, 'y')}:${formatSignLabel(sz, 'z')}`
}

const createCuboidEdgeFeatureId = (index: number) => {
  const [firstVertexIndex, secondVertexIndex] = cuboidEdgeVertexIndices[index]
  const firstSigns = cuboidVertexSigns[firstVertexIndex]
  const secondSigns = cuboidVertexSigns[secondVertexIndex]
  const varyingAxis = ['x', 'y', 'z'].find((_, axisIndex) => firstSigns[axisIndex] !== secondSigns[axisIndex]) ?? 'edge'
  const fixedAxes = ['x', 'y', 'z']
    .map((axis, axisIndex) =>
      firstSigns[axisIndex] === secondSigns[axisIndex] ? formatSignLabel(firstSigns[axisIndex], axis) : null
    )
    .filter((value): value is string => value !== null)

  return `cuboid:edge:${varyingAxis}:${fixedAxes.join(':')}`
}

const buildPlaneBasis = (normal: Vector3): { firstTangent: Vector3; secondTangent: Vector3 } => {
  const referenceAxis = Math.abs(normal.z) < 0.999 ? Vector3.createForward() : Vector3.createUp()
  const firstTangent = Vector3.calculateCrossProduct(referenceAxis, normal, vectors.acquire()).normalize()
  const secondTangent = Vector3.calculateCrossProduct(normal, firstTangent, vectors.acquire()).normalize()

  return { firstTangent, secondTangent }
}

const projectTo2D = (
  point: Vector3,
  planePoint: Vector3,
  firstTangent: Vector3,
  secondTangent: Vector3,
  offset: Vector3
) => {
  Vector3.subtract(point, planePoint, offset)

  return { x: Vector3.calculateDotProduct(offset, firstTangent), y: Vector3.calculateDotProduct(offset, secondTangent) }
}

const isPointOnSegment2D = (
  point: { x: number; y: number },
  firstPoint: { x: number; y: number },
  secondPoint: { x: number; y: number }
) => {
  const cross =
    (point.y - firstPoint.y) * (secondPoint.x - firstPoint.x) -
    (point.x - firstPoint.x) * (secondPoint.y - firstPoint.y)

  if (Math.abs(cross) > CONTACT_SLOP) {
    return false
  }

  const dot =
    (point.x - firstPoint.x) * (secondPoint.x - firstPoint.x) +
    (point.y - firstPoint.y) * (secondPoint.y - firstPoint.y)

  if (dot < -CONTACT_SLOP) {
    return false
  }

  const lengthSquared = (secondPoint.x - firstPoint.x) ** 2 + (secondPoint.y - firstPoint.y) ** 2

  return dot <= lengthSquared + CONTACT_SLOP
}

const isPointInPolygon2D = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index++) {
    if (isPointOnSegment2D(point, polygon[previousIndex], polygon[index])) {
      return true
    }
  }

  let isInside = false

  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index++) {
    const currentX = polygon[index].x,
      currentY = polygon[index].y
    const previousX = polygon[previousIndex].x,
      previousY = polygon[previousIndex].y
    const doesIntersect =
      currentY > point.y !== previousY > point.y &&
      point.x < ((previousX - currentX) * (point.y - currentY)) / (previousY - currentY || epsilon) + currentX

    if (doesIntersect) {
      isInside = !isInside
    }
  }

  return isInside
}

const appendCollision = (collisions: Collision[], collision: Collision, offset: Vector3) => {
  const isDuplicate = collisions.some(({ point: contact, penetrationDepth: distance }) => {
    return (
      Vector3.subtract(contact, collision.point, offset).magnitude <= CONTACT_SLOP &&
      Math.abs(distance - collision.penetrationDepth) <= CONTACT_SLOP
    )
  })

  if (!isDuplicate) {
    collisions.push(collision)
  }
}

const isPointInsideCuboid = (cuboid: Cuboid, point: Vector3, offset: Vector3) => {
  const relativePoint = Vector3.subtract(point, cuboid.center, offset)

  return cuboid.axes.every((axis, index) => {
    return Math.abs(Vector3.calculateDotProduct(relativePoint, axis)) <= cuboid.extents[index] + CONTACT_SLOP
  })
}

const calculatePolygonCuboidCollisions = (polygon: Polygon, cuboid: Cuboid): Collision[] | null => {
  polygon = getPolygonFacingPoint(polygon, cuboid.center)

  const normal = polygon.normal.copyTo(vectors.acquire()).normalize()
  const planePoint = polygon.vertices[0]
  const planeDistance = Vector3.calculateDotProduct(normal, planePoint)
  const offset = vectors.acquire()
  const projectedPoint = vectors.acquire()

  const { firstTangent, secondTangent } = buildPlaneBasis(normal)
  const polygon2D = polygon.vertices.map((vertex) =>
    projectTo2D(vertex, planePoint, firstTangent, secondTangent, offset)
  )

  const vertices = cuboid.calculateVertices(Array.from({ length: 8 }, () => vectors.acquire()))
  const centerSigned = Vector3.calculateDotProduct(normal, cuboid.center) - planeDistance
  const supportSigned =
    centerSigned >= 0
      ? Math.min(...vertices.map((vertex) => Vector3.calculateDotProduct(normal, vertex) - planeDistance))
      : Math.max(...vertices.map((vertex) => Vector3.calculateDotProduct(normal, vertex) - planeDistance))

  const supportContacts: Collision[] = []
  const faceContacts: Collision[] = []

  for (const [index, vertex] of vertices.entries()) {
    const signed = Vector3.calculateDotProduct(normal, vertex) - planeDistance
    const depth = centerSigned >= 0 ? Math.max(0, -signed) : Math.max(0, signed)
    const isWithinContactBand = centerSigned >= 0 ? signed <= CONTACT_SLOP : signed >= -CONTACT_SLOP

    if (Math.abs(signed - supportSigned) > SUPPORT_SLOP || !isWithinContactBand) {
      continue
    }

    Vector3.add(vertex, Vector3.scale(normal, -signed, offset), projectedPoint)

    const projected2D = projectTo2D(projectedPoint, planePoint, firstTangent, secondTangent, offset)

    if (!isPointInPolygon2D(projected2D, polygon2D)) {
      continue
    }

    appendCollision(
      supportContacts,
      {
        point: projectedPoint.clone(),
        normal: normal.clone(),
        penetrationDepth: depth,
        featureId: createCuboidVertexFeatureId(index),
        isRestingContact: true,
        contactType: 'patch'
      },
      offset
    )
  }

  if (Math.abs(supportSigned) <= SUPPORT_SLOP) {
    for (const [index, vertex] of polygon.vertices.entries()) {
      if (isPointInsideCuboid(cuboid, vertex, offset)) {
        appendCollision(
          faceContacts,
          {
            point: vertex.clone(),
            normal: normal.clone(),
            penetrationDepth: 0,
            featureId: `polygon:vertex:${index}`,
            isRestingContact: true,
            contactType: 'patch'
          },
          offset
        )
      }
    }
  }

  if (faceContacts.length > 0) {
    return faceContacts
  }

  if (supportContacts.length > 0) {
    return supportContacts
  }

  const edgeContacts: Collision[] = []
  const edges = cuboid.listEdges()

  for (const [edgeIndex, [firstIndex, secondIndex]] of edges.entries()) {
    const firstVertex = vertices[firstIndex]
    const secondVertex = vertices[secondIndex]
    const firstDistance = Vector3.calculateDotProduct(normal, firstVertex) - planeDistance
    const secondDistance = Vector3.calculateDotProduct(normal, secondVertex) - planeDistance

    if (
      (firstDistance > CONTACT_SLOP && secondDistance < -CONTACT_SLOP) ||
      (firstDistance < -CONTACT_SLOP && secondDistance > CONTACT_SLOP) ||
      (Math.abs(firstDistance - supportSigned) <= SUPPORT_SLOP &&
        Math.abs(secondDistance - supportSigned) <= SUPPORT_SLOP)
    ) {
      const edge = Vector3.subtract(secondVertex, firstVertex, offset)
      const denominator = Vector3.calculateDotProduct(normal, edge)

      if (Math.abs(denominator) <= epsilon) {
        continue
      }

      const interpolationFactor = (planeDistance - Vector3.calculateDotProduct(normal, firstVertex)) / denominator

      if (interpolationFactor < -epsilon || interpolationFactor > 1 + epsilon) {
        continue
      }

      const hit = Vector3.add(firstVertex, Vector3.scale(edge, interpolationFactor, offset), projectedPoint)
      const projection2D = projectTo2D(hit, planePoint, firstTangent, secondTangent, offset)

      if (isPointInPolygon2D(projection2D, polygon2D)) {
        appendCollision(
          edgeContacts,
          {
            point: hit.clone(),
            normal: normal.clone(),
            penetrationDepth: 0,
            featureId: createCuboidEdgeFeatureId(edgeIndex),
            isRestingContact: true,
            contactType: 'line'
          },
          offset
        )
      }
    }
  }

  return edgeContacts.length > 0 ? edgeContacts : null
}

export const collidePolygonWithCuboid = (polygon: Polygon, cuboid: Cuboid): Collision[] | null =>
  vectors.runInScope(() => calculatePolygonCuboidCollisions(polygon, cuboid))
