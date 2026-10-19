import type { Matrix4 } from '@luz/math'
import { Matrix3, Vector2, Vector3 } from '@luz/math'
import { Pool, Serializable, Serialize } from '@luz/serialization'
import type { BoundingBox } from './bounding-box'
import type { Transform } from './transform'

interface FrustumPlane {
  normal: Vector3
  distance: number
}

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 64
})

export class Frustum extends Serializable {
  @Serialize()
  orthographicHeight: number = 0

  @Serialize()
  aspect: number = 1.0

  // Degrees, vertical field of view.
  @Serialize()
  fieldOfView: number = 90.0

  @Serialize()
  readonly clipPlanes: Vector2 = new Vector2([1.0, 100.0])

  @Serialize()
  protected readonly origin: Vector3 = Vector3.createZero()

  readonly center: Vector3 = Vector3.createZero()
  readonly axes: Vector3[]

  private readonly basis = new Matrix3()
  private readonly vertices = Array.from({ length: 8 }, () => new Vector3())
  private readonly planes: FrustumPlane[] = Array.from({ length: 6 }, () => ({ normal: new Vector3(), distance: 0 }))
  private readonly cachedClipPlanes = new Vector2()
  private readonly cachedCenter = new Vector3()
  private readonly cachedAxes = Array.from({ length: 3 }, () => new Vector3())

  private cachedOrthographicHeight = NaN
  private cachedAspect = NaN
  private cachedFieldOfView = NaN
  private isGeometryValid = false

  constructor() {
    super()

    this.axes = Vector3.createAxes()
  }

  applyTransform(transform: Transform) {
    transform.refreshWorldTransform()
    this.applyMatrix(transform.modelMatrix)
  }

  applyMatrix(matrix: Matrix4): void {
    matrix.toMatrix3(this.basis)
    this.axes.forEach((axis, index) => this.basis.getColumn(index, axis))
    vectors.runInScope(() => {
      const translation = vectors.acquire().reset()

      matrix.transformVector3(translation, translation)

      const midpoint = (this.clipPlanes.x + this.clipPlanes.y) * 0.5
      const centerOffset = Vector3.scale(this.axes[2], midpoint, vectors.acquire())
      const viewDirection = Vector3.add(this.origin, translation, vectors.acquire())

      Vector3.subtract(viewDirection, centerOffset, this.center)
    })
  }

  calculateVertices(destination: Vector3[] = []): Vector3[] {
    this.updateGeometry()
    this.vertices.forEach((vertex, index) => {
      destination[index] = destination[index] ? vertex.copyTo(destination[index]) : vertex.clone()
    })

    destination.length = this.vertices.length

    return destination
  }

  calculatePlanes(): FrustumPlane[] {
    this.updateGeometry()

    return this.planes.map(({ normal, distance }) => ({ normal: normal.clone(), distance }))
  }

  private hasCurrentGeometry(): boolean {
    if (
      !this.isGeometryValid ||
      this.orthographicHeight !== this.cachedOrthographicHeight ||
      this.aspect !== this.cachedAspect ||
      this.fieldOfView !== this.cachedFieldOfView ||
      this.clipPlanes.x !== this.cachedClipPlanes.x ||
      this.clipPlanes.y !== this.cachedClipPlanes.y
    ) {
      return false
    }

    for (let component = 0; component < 3; component++) {
      if (this.center[component] !== this.cachedCenter[component]) {
        return false
      }

      for (let axis = 0; axis < 3; axis++) {
        if (this.axes[axis][component] !== this.cachedAxes[axis][component]) {
          return false
        }
      }
    }

    return true
  }

  private updateGeometry(): void {
    if (this.hasCurrentGeometry()) {
      return
    }

    this.isGeometryValid = false

    vectors.runInScope(() => {
      this.updateVertices()
      this.updatePlanes()
    })

    this.cachedOrthographicHeight = this.orthographicHeight
    this.cachedAspect = this.aspect
    this.cachedFieldOfView = this.fieldOfView

    this.clipPlanes.copyTo(this.cachedClipPlanes)
    this.center.copyTo(this.cachedCenter)
    this.axes.forEach((axis, index) => axis.copyTo(this.cachedAxes[index]))

    this.isGeometryValid = true
  }

  private updateVertices(): void {
    const halfFieldOfViewTangent = Math.tan(((this.fieldOfView * Math.PI) / 180) * 0.5)
    const nearHalfHeight =
      this.orthographicHeight > 0 ? this.orthographicHeight * 0.5 : halfFieldOfViewTangent * this.clipPlanes.x
    const nearHalfWidth = nearHalfHeight * this.aspect
    const farHalfHeight = this.orthographicHeight > 0 ? nearHalfHeight : halfFieldOfViewTangent * this.clipPlanes.y
    const farHalfWidth = farHalfHeight * this.aspect

    const eye = Vector3.add(
      this.center,
      Vector3.scale(this.axes[2], (this.clipPlanes.x + this.clipPlanes.y) * 0.5, vectors.acquire()),
      vectors.acquire()
    )

    const nearCenter = Vector3.subtract(
      eye,
      Vector3.scale(this.axes[2], this.clipPlanes.x, vectors.acquire()),
      vectors.acquire()
    )
    const farCenter = Vector3.subtract(
      eye,
      Vector3.scale(this.axes[2], this.clipPlanes.y, vectors.acquire()),
      vectors.acquire()
    )
    const nearHorizontal = Vector3.scale(this.axes[0], nearHalfWidth, vectors.acquire())
    const nearVertical = Vector3.scale(this.axes[1], nearHalfHeight, vectors.acquire())
    const farHorizontal = Vector3.scale(this.axes[0], farHalfWidth, vectors.acquire())
    const farVertical = Vector3.scale(this.axes[1], farHalfHeight, vectors.acquire())

    Vector3.add(nearCenter, Vector3.add(nearHorizontal, nearVertical, vectors.acquire()), this.vertices[0])
    Vector3.add(
      nearCenter,
      Vector3.add(nearHorizontal, Vector3.scale(nearVertical, -1, vectors.acquire()), vectors.acquire()),
      this.vertices[1]
    )
    Vector3.add(
      nearCenter,
      Vector3.add(Vector3.scale(nearHorizontal, -1, vectors.acquire()), nearVertical, vectors.acquire()),
      this.vertices[2]
    )
    Vector3.add(
      nearCenter,
      Vector3.add(
        Vector3.scale(nearHorizontal, -1, vectors.acquire()),
        Vector3.scale(nearVertical, -1, vectors.acquire()),
        vectors.acquire()
      ),
      this.vertices[3]
    )
    Vector3.add(farCenter, Vector3.add(farHorizontal, farVertical, vectors.acquire()), this.vertices[4])
    Vector3.add(
      farCenter,
      Vector3.add(farHorizontal, Vector3.scale(farVertical, -1, vectors.acquire()), vectors.acquire()),
      this.vertices[5]
    )
    Vector3.add(
      farCenter,
      Vector3.add(Vector3.scale(farHorizontal, -1, vectors.acquire()), farVertical, vectors.acquire()),
      this.vertices[6]
    )
    Vector3.add(
      farCenter,
      Vector3.add(
        Vector3.scale(farHorizontal, -1, vectors.acquire()),
        Vector3.scale(farVertical, -1, vectors.acquire()),
        vectors.acquire()
      ),
      this.vertices[7]
    )
  }

  private updatePlanes(): void {
    const vertices = this.vertices
    const nearTopRight = vertices[0]
    const nearBottomRight = vertices[1]
    const nearTopLeft = vertices[2]
    const nearBottomLeft = vertices[3]

    this.updatePlane(this.planes[0], vertices[6], nearTopLeft, nearBottomLeft)
    this.updatePlane(this.planes[1], vertices[5], nearBottomRight, nearTopRight)
    this.updatePlane(this.planes[2], vertices[4], nearTopRight, nearTopLeft)
    this.updatePlane(this.planes[3], vertices[7], nearBottomLeft, nearBottomRight)
    this.updatePlane(this.planes[4], nearTopRight, nearBottomRight, nearTopLeft)
    this.updatePlane(this.planes[5], vertices[4], vertices[6], vertices[5])
  }

  private updatePlane(plane: FrustumPlane, origin: Vector3, firstPoint: Vector3, secondPoint: Vector3): void {
    const firstEdge = Vector3.subtract(firstPoint, origin, vectors.acquire())
    const secondEdge = Vector3.subtract(secondPoint, origin, vectors.acquire())

    Vector3.calculateCrossProduct(firstEdge, secondEdge, plane.normal).normalize()

    plane.distance = Vector3.calculateDotProduct(origin, plane.normal)

    if (Vector3.calculateDotProduct(this.center, plane.normal) - plane.distance > 0) {
      plane.normal.scale(-1)

      plane.distance = -plane.distance
    }
  }

  intersectsBoundingBox(axisAlignedBoundingBox: BoundingBox): boolean {
    this.updateGeometry()

    for (const { normal, distance } of this.planes) {
      const x = normal.x >= 0 ? axisAlignedBoundingBox.minimum.x : axisAlignedBoundingBox.maximum.x
      const y = normal.y >= 0 ? axisAlignedBoundingBox.minimum.y : axisAlignedBoundingBox.maximum.y
      const z = normal.z >= 0 ? axisAlignedBoundingBox.minimum.z : axisAlignedBoundingBox.maximum.z

      if (normal.x * x + normal.y * y + normal.z * z - distance > 0) {
        return false
      }
    }

    return true
  }
}
