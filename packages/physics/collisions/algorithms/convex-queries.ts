import { Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import type { Collision } from '../../collision'

export interface ConvexShape {
  center: Vector3
  calculateSupportPoint(direction: Vector3): Vector3
}

interface MinkowskiVertex {
  point: Vector3
  firstPoint: Vector3
  secondPoint: Vector3
}
interface SimplexProjection {
  point: Vector3
  vertices: MinkowskiVertex[]
  weights: number[]
}

const geometricTolerance = 1e-6

const unitAxes = Vector3.createAxes()

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 32
})

const calculateMinkowskiSupportVertex = (
  firstShape: ConvexShape,
  secondShape: ConvexShape,
  direction: Vector3
): MinkowskiVertex =>
  vectors.runInScope(() => {
    const firstPoint = firstShape.calculateSupportPoint(direction)
    const secondPoint = secondShape.calculateSupportPoint(Vector3.scale(direction, -1, vectors.acquire()))

    return { point: Vector3.subtract(firstPoint, secondPoint), firstPoint, secondPoint }
  })

const solveLinearSystem = (matrix: number[][], values: number[]): number[] | null => {
  const augmentedRows = matrix.map((row, index) => [...row, values[index]])

  for (let column = 0; column < values.length; column++) {
    let pivot = column

    for (let row = column + 1; row < values.length; row++) {
      if (Math.abs(augmentedRows[row][column]) > Math.abs(augmentedRows[pivot][column])) {
        pivot = row
      }
    }

    if (Math.abs(augmentedRows[pivot][column]) < 1e-12) {
      return null
    }

    ;[augmentedRows[column], augmentedRows[pivot]] = [augmentedRows[pivot], augmentedRows[column]]

    const divisor = augmentedRows[column][column]

    for (let index = column; index <= values.length; index++) {
      augmentedRows[column][index] /= divisor
    }

    for (let row = 0; row < values.length; row++) {
      if (row === column) {
        continue
      }

      const factor = augmentedRows[row][column]

      for (let index = column; index <= values.length; index++) {
        augmentedRows[row][index] -= factor * augmentedRows[column][index]
      }
    }
  }

  return augmentedRows.map((row) => row[values.length])
}

const calculateSimplexProjection = (
  simplexVertices: MinkowskiVertex[],
  destination: Vector3
): SimplexProjection | null =>
  vectors.runInScope(() => {
    const basePoint = simplexVertices[0].point
    const simplexEdges = simplexVertices
      .slice(1)
      .map((vertex) => Vector3.subtract(vertex.point, basePoint, vectors.acquire()))
    const coefficients = solveLinearSystem(
      simplexEdges.map((firstEdge) =>
        simplexEdges.map((secondEdge) => Vector3.calculateDotProduct(firstEdge, secondEdge))
      ),
      simplexEdges.map((edge) => -Vector3.calculateDotProduct(basePoint, edge))
    )

    if (!coefficients) {
      return null
    }

    const weights = [1 - coefficients.reduce((sum, weight) => sum + weight, 0), ...coefficients]

    if (weights.some((weight) => weight < -1e-7)) {
      return null
    }

    const scaledPoint = vectors.acquire()

    destination.reset()
    simplexVertices.forEach((vertex, index) =>
      destination.add(Vector3.scale(vertex.point, weights[index], scaledPoint))
    )

    return { point: destination, vertices: simplexVertices, weights }
  })

const findClosestSimplexProjection = (simplexVertices: MinkowskiVertex[], destination: Vector3): SimplexProjection =>
  vectors.runInScope(() => {
    const candidatePoint = vectors.acquire()

    let closestProjection: SimplexProjection = {
      point: simplexVertices[0].point.copyTo(destination),
      vertices: [simplexVertices[0]],
      weights: [1]
    }

    for (let combinationMask = 1; combinationMask < 1 << simplexVertices.length; combinationMask++) {
      const vertexSubset = simplexVertices.filter((_, index) => combinationMask & (1 << index))

      if (vertexSubset.length > 4) {
        continue
      }

      const candidateProjection = calculateSimplexProjection(vertexSubset, candidatePoint)

      if (
        candidateProjection &&
        candidateProjection.point.squaredMagnitude < closestProjection.point.squaredMagnitude
      ) {
        candidatePoint.copyTo(destination)

        closestProjection = { ...candidateProjection, point: destination }
      }
    }

    return closestProjection
  })

const calculateProjectionWitnessPoint = (
  projection: SimplexProjection,
  key: 'firstPoint' | 'secondPoint',
  destination = new Vector3()
): Vector3 => {
  const scaledPoint = vectors.acquire()

  destination.reset()
  projection.vertices.forEach((vertex, index) =>
    destination.add(Vector3.scale(vertex[key], projection.weights[index], scaledPoint))
  )

  return destination
}

export interface ConvexDistance {
  distance: number
  normal: Vector3
  firstPoint: Vector3
  secondPoint: Vector3
  simplex: MinkowskiVertex[]
}

export const calculateConvexDistance = (firstShape: ConvexShape, secondShape: ConvexShape): ConvexDistance =>
  vectors.runInScope(() => {
    const direction = Vector3.subtract(secondShape.center, firstShape.center, vectors.acquire())
    const projectionPoint = vectors.acquire()
    const pointOffset = vectors.acquire()

    if (direction.magnitude < geometricTolerance) {
      Vector3.createRight(direction)
    }

    let projection = findClosestSimplexProjection(
      [calculateMinkowskiSupportVertex(firstShape, secondShape, direction)],
      projectionPoint
    )

    for (let iteration = 0; iteration < 64; iteration++) {
      if (projection.point.magnitude < geometricTolerance) {
        break
      }

      Vector3.scale(projection.point, -1, direction)

      const supportVertex = calculateMinkowskiSupportVertex(firstShape, secondShape, direction)
      const supportImprovement =
        Vector3.calculateDotProduct(supportVertex.point, direction) + projection.point.squaredMagnitude

      if (supportImprovement <= geometricTolerance * projection.point.magnitude) {
        break
      }

      if (
        projection.vertices.some(
          (existingVertex) =>
            Vector3.subtract(existingVertex.point, supportVertex.point, pointOffset).magnitude < geometricTolerance
        )
      ) {
        break
      }

      projection = findClosestSimplexProjection([...projection.vertices, supportVertex], projectionPoint)
    }

    const firstPoint = calculateProjectionWitnessPoint(projection, 'firstPoint')
    const secondPoint = calculateProjectionWitnessPoint(projection, 'secondPoint')
    const normal = Vector3.subtract(secondPoint, firstPoint)

    return {
      distance: normal.magnitude,
      normal: normal.normalize(),
      firstPoint,
      secondPoint,
      simplex: projection.vertices
    }
  })

interface PolytopeFace {
  indices: number[]
  normal: Vector3
  plane: number[]
  distance: number
}

const maximumPolytopeFaces = 200
const maximumBoundaryEdges = maximumPolytopeFaces * 3

const createPolytopeFace = (
  polytopeVertices: MinkowskiVertex[],
  firstIndex: number,
  secondIndex: number,
  thirdIndex: number,
  oppositeIndex?: number
): PolytopeFace | null => {
  const origin = polytopeVertices[firstIndex].point

  const calculateEdge = (index: number): number[] =>
    [0, 1, 2].map((axis) => polytopeVertices[index].point[axis] - origin[axis])
  const firstEdge = calculateEdge(secondIndex)
  const secondEdge = calculateEdge(thirdIndex)

  let x = firstEdge[1] * secondEdge[2] - firstEdge[2] * secondEdge[1]
  let y = firstEdge[2] * secondEdge[0] - firstEdge[0] * secondEdge[2]
  let z = firstEdge[0] * secondEdge[1] - firstEdge[1] * secondEdge[0]

  const length = Math.hypot(x, y, z)

  if (!Number.isFinite(length) || length < geometricTolerance * geometricTolerance) {
    return null
  }

  if (oppositeIndex !== undefined) {
    const direction = calculateEdge(oppositeIndex)

    if (x * direction[0] + y * direction[1] + z * direction[2] > 0) {
      x = -x
      y = -y
      z = -z
      ;[secondIndex, thirdIndex] = [thirdIndex, secondIndex]
    }
  }

  const plane = [x / length, y / length, z / length]
  const distance = plane[0] * origin[0] + plane[1] * origin[1] + plane[2] * origin[2]

  if (!Number.isFinite(distance) || distance < -geometricTolerance) {
    return null
  }

  return {
    indices: [firstIndex, secondIndex, thirdIndex],
    normal: new Vector3(plane),
    plane,
    distance: Math.max(0, distance)
  }
}

const calculateSignedFaceDistance = (face: PolytopeFace, point: Vector3, origin: Vector3): number =>
  face.plane[0] * (point[0] - origin[0]) +
  face.plane[1] * (point[1] - origin[1]) +
  face.plane[2] * (point[2] - origin[2])

const isPolytopeSurfaceValid = (polytopeFaces: PolytopeFace[]): boolean => {
  if (polytopeFaces.length < 4 || polytopeFaces.length > maximumPolytopeFaces) {
    return false
  }

  const directedEdges = new Set<string>(),
    vertexIndices = new Set<number>()

  for (const face of polytopeFaces) {
    for (let index = 0; index < 3; index++) {
      const startIndex = face.indices[index],
        endIndex = face.indices[(index + 1) % 3]
      const edgeKey = startIndex + ':' + endIndex

      if (directedEdges.has(edgeKey)) {
        return false
      }

      directedEdges.add(edgeKey)
      vertexIndices.add(startIndex)
    }
  }

  if (polytopeFaces.length !== 2 * vertexIndices.size - 4) {
    return false
  }

  for (const face of polytopeFaces) {
    for (let index = 0; index < 3; index++) {
      if (!directedEdges.has(face.indices[(index + 1) % 3] + ':' + face.indices[index])) {
        return false
      }
    }
  }

  return true
}

export const collideConvexShapes = (firstShape: ConvexShape, secondShape: ConvexShape): Collision[] | null =>
  vectors.runInScope(() => {
    const distanceQuery = calculateConvexDistance(firstShape, secondShape)

    if (distanceQuery.distance > 2 * geometricTolerance) {
      return null
    }

    const candidateVertices = distanceQuery.simplex.slice()
    const pointOffset = vectors.acquire()
    const projectionPoint = vectors.acquire()
    const supportDirections = [...unitAxes, ...unitAxes.map((axis) => Vector3.scale(axis, -1, vectors.acquire()))]

    for (const xDirection of [-1, 1]) {
      for (const yDirection of [-1, 1]) {
        for (const zDirection of [-1, 1]) {
          const direction = vectors.acquire()

          direction.x = xDirection
          direction.y = yDirection
          direction.z = zDirection

          supportDirections.push(direction)
        }
      }
    }

    for (const direction of supportDirections) {
      const supportVertex = calculateMinkowskiSupportVertex(firstShape, secondShape, direction)

      if (
        !candidateVertices.some(
          (existingVertex) =>
            Vector3.subtract(existingVertex.point, supportVertex.point, pointOffset).magnitude < geometricTolerance
        )
      ) {
        candidateVertices.push(supportVertex)
      }
    }

    let tetrahedronVertices: MinkowskiVertex[] | undefined
    let polytopeFaces: PolytopeFace[] = []

    tetrahedra: for (let firstIndex = 0; firstIndex < candidateVertices.length; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < candidateVertices.length; secondIndex++) {
        for (let thirdIndex = secondIndex + 1; thirdIndex < candidateVertices.length; thirdIndex++) {
          for (let fourthIndex = thirdIndex + 1; fourthIndex < candidateVertices.length; fourthIndex++) {
            const simplexVertices = [
              candidateVertices[firstIndex],
              candidateVertices[secondIndex],
              candidateVertices[thirdIndex],
              candidateVertices[fourthIndex]
            ]
            const simplexProjection = calculateSimplexProjection(simplexVertices, projectionPoint)

            if (!simplexProjection || simplexProjection.point.magnitude > 1e-4) {
              continue
            }

            const minimumWeight = Math.min(...simplexProjection.weights)

            if (minimumWeight > 1e-6) {
              const seedFaces = [
                [0, 1, 2, 3],
                [0, 3, 1, 2],
                [0, 2, 3, 1],
                [1, 3, 2, 0]
              ].map(([faceFirstIndex, faceSecondIndex, faceThirdIndex, oppositeIndex]) =>
                createPolytopeFace(simplexVertices, faceFirstIndex, faceSecondIndex, faceThirdIndex, oppositeIndex)
              )

              if (seedFaces.some((face) => !face)) {
                continue
              }

              polytopeFaces = seedFaces as PolytopeFace[]

              if (!isPolytopeSurfaceValid(polytopeFaces)) {
                continue
              }

              tetrahedronVertices = simplexVertices
              break tetrahedra
            }
          }
        }
      }
    }

    if (!tetrahedronVertices) {
      const normal =
        distanceQuery.normal.magnitude > geometricTolerance
          ? distanceQuery.normal
          : Vector3.subtract(secondShape.center, firstShape.center).normalize()

      return [
        {
          point: Vector3.add(distanceQuery.firstPoint, distanceQuery.secondPoint).scale(0.5),
          normal: normal.magnitude > geometricTolerance ? normal : Vector3.createRight(),
          penetrationDepth: 0
        }
      ]
    }

    const polytopeVertices = tetrahedronVertices.slice()

    let nearestPolytopeFace = polytopeFaces[0]

    expansion: for (let iteration = 0; iteration < 96; iteration++) {
      polytopeFaces.sort((firstFace, secondFace) => firstFace.distance - secondFace.distance)

      nearestPolytopeFace = polytopeFaces[0]

      const supportVertex = calculateMinkowskiSupportVertex(firstShape, secondShape, nearestPolytopeFace.normal)

      if (
        Vector3.calculateDotProduct(supportVertex.point, nearestPolytopeFace.normal) - nearestPolytopeFace.distance <
          1e-5 ||
        polytopeVertices.some(
          (existingVertex) =>
            Vector3.subtract(existingVertex.point, supportVertex.point, pointOffset).magnitude < geometricTolerance
        )
      ) {
        break
      }

      const boundaryEdges = new Map<string, number[]>()
      const retainedFaces: PolytopeFace[] = []

      for (const face of polytopeFaces) {
        if (
          calculateSignedFaceDistance(face, supportVertex.point, polytopeVertices[face.indices[0]].point) <=
          geometricTolerance
        ) {
          retainedFaces.push(face)
          continue
        }

        for (let index = 0; index < 3; index++) {
          const startIndex = face.indices[index],
            endIndex = face.indices[(index + 1) % 3]

          if (!boundaryEdges.delete(endIndex + ':' + startIndex)) {
            boundaryEdges.set(startIndex + ':' + endIndex, [startIndex, endIndex])
          }

          if (boundaryEdges.size > maximumBoundaryEdges) {
            break expansion
          }
        }
      }

      if (boundaryEdges.size === 0 || retainedFaces.length + boundaryEdges.size > maximumPolytopeFaces) {
        break
      }

      const supportVertexIndex = polytopeVertices.length

      polytopeVertices.push(supportVertex)

      for (const [startIndex, endIndex] of boundaryEdges.values()) {
        const polytopeFace = createPolytopeFace(polytopeVertices, startIndex, endIndex, supportVertexIndex)

        // Keep the last valid polytope if an expansion would leave a hole or invalid face.
        if (!polytopeFace) {
          polytopeVertices.pop()
          break expansion
        }

        retainedFaces.push(polytopeFace)
      }

      if (!isPolytopeSurfaceValid(retainedFaces)) {
        polytopeVertices.pop()
        break
      }

      polytopeFaces = retainedFaces
    }

    const faceProjection = findClosestSimplexProjection(
      nearestPolytopeFace.indices.map((index) => polytopeVertices[index]),
      projectionPoint
    )

    return [
      {
        point: Vector3.add(
          calculateProjectionWitnessPoint(faceProjection, 'firstPoint', vectors.acquire()),
          calculateProjectionWitnessPoint(faceProjection, 'secondPoint', vectors.acquire())
        ).scale(0.5),
        normal: nearestPolytopeFace.normal,
        penetrationDepth: Math.max(0, nearestPolytopeFace.distance)
      }
    ]
  })
