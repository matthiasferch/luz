import { Vector3 } from '@luz/math'

export class BoundingBox {
  readonly minimum = Vector3.createZero()
  readonly maximum = Vector3.createZero()

  constructor(points: readonly Vector3[] = []) {
    BoundingBox.calculateFromPoints(points, this)
  }

  static calculateFromPoints(points: readonly Vector3[], destination = new BoundingBox()): BoundingBox {
    if (points.length === 0) {
      destination.minimum.reset()
      destination.maximum.reset()

      return destination
    }

    let minimumX = Infinity
    let minimumY = Infinity
    let minimumZ = Infinity
    let maximumX = -Infinity
    let maximumY = -Infinity
    let maximumZ = -Infinity

    for (const point of points) {
      minimumX = Math.min(minimumX, point.x)
      minimumY = Math.min(minimumY, point.y)
      minimumZ = Math.min(minimumZ, point.z)
      maximumX = Math.max(maximumX, point.x)
      maximumY = Math.max(maximumY, point.y)
      maximumZ = Math.max(maximumZ, point.z)
    }

    destination.minimum.x = minimumX
    destination.minimum.y = minimumY
    destination.minimum.z = minimumZ
    destination.maximum.x = maximumX
    destination.maximum.y = maximumY
    destination.maximum.z = maximumZ

    return destination
  }

  static intersects(firstBox: BoundingBox, secondBox: BoundingBox): boolean {
    if (firstBox.maximum.x < secondBox.minimum.x || secondBox.maximum.x < firstBox.minimum.x) {
      return false
    }

    if (firstBox.maximum.y < secondBox.minimum.y || secondBox.maximum.y < firstBox.minimum.y) {
      return false
    }

    if (firstBox.maximum.z < secondBox.minimum.z || secondBox.maximum.z < firstBox.minimum.z) {
      return false
    }

    return true
  }
}
