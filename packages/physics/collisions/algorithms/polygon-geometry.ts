import { Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import { Polygon } from '../../colliders/polygon'

export const polygonContactSlop = 0.005

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 16
})

export const findClosestPointOnTriangle = (
  point: Vector3,
  firstVertex: Vector3,
  secondVertex: Vector3,
  thirdVertex: Vector3,
  destination = new Vector3()
): Vector3 =>
  vectors.runInScope(() => {
    const firstEdge = Vector3.subtract(secondVertex, firstVertex, vectors.acquire())
    const secondEdge = Vector3.subtract(thirdVertex, firstVertex, vectors.acquire())
    const firstOffset = Vector3.subtract(point, firstVertex, vectors.acquire())

    const firstEdgeFirstProjection = Vector3.calculateDotProduct(firstEdge, firstOffset)
    const secondEdgeFirstProjection = Vector3.calculateDotProduct(secondEdge, firstOffset)

    if (firstEdgeFirstProjection <= 0 && secondEdgeFirstProjection <= 0) {
      return firstVertex.copyTo(destination)
    }

    const secondOffset = Vector3.subtract(point, secondVertex, vectors.acquire())
    const firstEdgeSecondProjection = Vector3.calculateDotProduct(firstEdge, secondOffset)
    const secondEdgeSecondProjection = Vector3.calculateDotProduct(secondEdge, secondOffset)

    if (firstEdgeSecondProjection >= 0 && secondEdgeSecondProjection <= firstEdgeSecondProjection) {
      return secondVertex.copyTo(destination)
    }

    const thirdRegionDeterminant =
      firstEdgeFirstProjection * secondEdgeSecondProjection - firstEdgeSecondProjection * secondEdgeFirstProjection

    if (thirdRegionDeterminant <= 0 && firstEdgeFirstProjection >= 0 && firstEdgeSecondProjection <= 0) {
      const secondWeight = firstEdgeFirstProjection / (firstEdgeFirstProjection - firstEdgeSecondProjection)

      return Vector3.add(firstVertex, Vector3.scale(firstEdge, secondWeight, vectors.acquire()), destination)
    }

    const thirdOffset = Vector3.subtract(point, thirdVertex, vectors.acquire())
    const firstEdgeThirdProjection = Vector3.calculateDotProduct(firstEdge, thirdOffset)
    const secondEdgeThirdProjection = Vector3.calculateDotProduct(secondEdge, thirdOffset)

    if (secondEdgeThirdProjection >= 0 && firstEdgeThirdProjection <= secondEdgeThirdProjection) {
      return thirdVertex.copyTo(destination)
    }

    const secondRegionDeterminant =
      firstEdgeThirdProjection * secondEdgeFirstProjection - firstEdgeFirstProjection * secondEdgeThirdProjection

    if (secondRegionDeterminant <= 0 && secondEdgeFirstProjection >= 0 && secondEdgeThirdProjection <= 0) {
      const thirdWeight = secondEdgeFirstProjection / (secondEdgeFirstProjection - secondEdgeThirdProjection)

      return Vector3.add(firstVertex, Vector3.scale(secondEdge, thirdWeight, vectors.acquire()), destination)
    }

    const firstRegionDeterminant =
      firstEdgeSecondProjection * secondEdgeThirdProjection - firstEdgeThirdProjection * secondEdgeSecondProjection

    if (
      firstRegionDeterminant <= 0 &&
      secondEdgeSecondProjection - firstEdgeSecondProjection >= 0 &&
      firstEdgeThirdProjection - secondEdgeThirdProjection >= 0
    ) {
      const thirdWeight =
        (secondEdgeSecondProjection - firstEdgeSecondProjection) /
        (secondEdgeSecondProjection -
          firstEdgeSecondProjection +
          (firstEdgeThirdProjection - secondEdgeThirdProjection))
      const oppositeEdge = Vector3.subtract(thirdVertex, secondVertex, vectors.acquire())

      return Vector3.add(secondVertex, Vector3.scale(oppositeEdge, thirdWeight, vectors.acquire()), destination)
    }

    const denominator = 1 / (firstRegionDeterminant + secondRegionDeterminant + thirdRegionDeterminant)
    const secondWeight = secondRegionDeterminant * denominator
    const thirdWeight = thirdRegionDeterminant * denominator

    return Vector3.add(
      firstVertex,
      Vector3.add(
        Vector3.scale(firstEdge, secondWeight, vectors.acquire()),
        Vector3.scale(secondEdge, thirdWeight, vectors.acquire()),
        vectors.acquire()
      ),
      destination
    )
  })

export const findClosestPointOnPolygon = (point: Vector3, polygon: Polygon, destination = new Vector3()): Vector3 =>
  vectors.runInScope(() => {
    const closestPoint = polygon.vertices[0].copyTo(vectors.acquire())
    const candidate = vectors.acquire()
    const offset = vectors.acquire()

    let distance = Infinity

    for (const [firstVertex, secondVertex, thirdVertex] of polygon.triangles) {
      findClosestPointOnTriangle(point, firstVertex, secondVertex, thirdVertex, candidate)

      const squaredDistance = Vector3.subtract(candidate, point, offset).squaredMagnitude

      if (squaredDistance < distance) {
        candidate.copyTo(closestPoint)

        distance = squaredDistance
      }
    }

    return closestPoint.copyTo(destination)
  })

export const getPolygonFacingPoint = (polygon: Polygon, point: Vector3): Polygon => {
  const signedDistance = Vector3.calculateDotProduct(Vector3.subtract(point, polygon.vertices[0]), polygon.normal)

  return signedDistance >= -1e-5 ? polygon : new Polygon({ vertices: polygon.vertices.slice().reverse() })
}
