import type { BoundingBox, Camera, Frustum } from '@luz/core'
import type { Tuple2 } from '@luz/formats'
import { Matrix4, Vector3, Vector4 } from '@luz/math'
import { Pool } from '@luz/serialization'

const projectionBuffers = new Pool({
  createObject: () => ({
    viewProjection: new Matrix4(),
    vertices: Array.from({ length: 8 }, () => new Vector3()),
    clipVertices: Array.from({ length: 8 }, () => new Vector4()),
    intersection: new Vector4()
  }),

  resetObject: (buffers) => buffers,
  initialCapacity: 2
})

const edges: ReadonlyArray<Readonly<Tuple2>> = [
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

export interface ProjectedRectangle {
  minimumX: number
  minimumY: number
  maximumX: number
  maximumY: number
}

export function calculateFrustumNormalizedDeviceCoordinateRectangle(
  frustum: Frustum,
  camera: Camera
): ProjectedRectangle | null {
  return projectionBuffers.runInScope(() => {
    const { viewMatrix, projectionMatrix } = camera
    const { viewProjection, vertices, clipVertices, intersection } = projectionBuffers.acquire()

    Matrix4.multiply(projectionMatrix, viewMatrix, viewProjection)

    const worldVertices = frustum.calculateVertices(vertices)

    return calculateProjectedRectangle(worldVertices, viewProjection, clipVertices, intersection)
  })
}

export function calculateBoundingBoxNormalizedDeviceCoordinateRectangle(
  boundingBox: BoundingBox,
  viewProjection: Matrix4
): ProjectedRectangle | null {
  return projectionBuffers.runInScope(() => {
    const { vertices, clipVertices, intersection } = projectionBuffers.acquire()
    const { minimum, maximum } = boundingBox

    vertices.forEach((vertex, index) => {
      vertex.x = index & 1 ? maximum.x : minimum.x
      vertex.y = index & 2 ? maximum.y : minimum.y
      vertex.z = index & 4 ? maximum.z : minimum.z
    })

    return calculateProjectedRectangle(vertices, viewProjection, clipVertices, intersection)
  })
}

const calculateProjectedRectangle = (
  worldVertices: readonly Vector3[],
  viewProjection: Matrix4,
  clipVertices: Vector4[],
  intersection: Vector4
): ProjectedRectangle | null => {
  worldVertices.forEach(({ x, y, z }, index) => {
    const clipPosition = clipVertices[index]

    clipPosition.x = x
    clipPosition.y = y
    clipPosition.z = z
    clipPosition.w = 1

    viewProjection.transform(clipPosition, clipPosition)
  })

  let minimumX = Number.POSITIVE_INFINITY
  let minimumY = Number.POSITIVE_INFINITY
  let maximumX = Number.NEGATIVE_INFINITY
  let maximumY = Number.NEGATIVE_INFINITY
  let hasVisiblePoint = false

  const includePoint = (clipPosition: Vector4) => {
    const w = clipPosition.w

    if (w === 0) {
      return
    }

    const normalizedDeviceX = clipPosition.x / w
    const normalizedDeviceY = clipPosition.y / w

    if (!Number.isFinite(normalizedDeviceX) || !Number.isFinite(normalizedDeviceY)) {
      return
    }

    hasVisiblePoint = true

    if (normalizedDeviceX < minimumX) {
      minimumX = normalizedDeviceX
    }

    if (normalizedDeviceY < minimumY) {
      minimumY = normalizedDeviceY
    }

    if (normalizedDeviceX > maximumX) {
      maximumX = normalizedDeviceX
    }

    if (normalizedDeviceY > maximumY) {
      maximumY = normalizedDeviceY
    }
  }

  for (const [firstIndex, secondIndex] of edges) {
    const firstPoint = clipVertices[firstIndex]
    const secondPoint = clipVertices[secondIndex]
    const isFirstVisible = firstPoint.z + firstPoint.w >= 0
    const isSecondVisible = secondPoint.z + secondPoint.w >= 0

    if (isFirstVisible && isSecondVisible) {
      includePoint(firstPoint)
      includePoint(secondPoint)
    } else if (isFirstVisible !== isSecondVisible) {
      const deltaZ = secondPoint.z - firstPoint.z
      const deltaW = secondPoint.w - firstPoint.w
      const interpolationFactor = -(firstPoint.z + firstPoint.w) / (deltaZ + deltaW)

      intersection.x = firstPoint.x + interpolationFactor * (secondPoint.x - firstPoint.x)
      intersection.y = firstPoint.y + interpolationFactor * (secondPoint.y - firstPoint.y)
      intersection.z = firstPoint.z + interpolationFactor * deltaZ
      intersection.w = firstPoint.w + interpolationFactor * deltaW

      if (isFirstVisible) {
        includePoint(firstPoint)
        includePoint(intersection)
      } else {
        includePoint(intersection)
        includePoint(secondPoint)
      }
    }
  }

  if (!hasVisiblePoint) {
    return null
  }

  return { minimumX, minimumY, maximumX, maximumY }
}
