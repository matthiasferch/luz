import type { Tuple2 } from '@luz/formats'
import type { Transform } from '@luz/core'
import { Pool, Serialize, Register } from '@luz/serialization'
import { Vector3 } from '@luz/math'
import type { Collider } from '../collider'
import { assertPositiveDimensions } from '../collider'
import { Volume } from '../volume'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 4
})
const vertexSigns = [
  [+1, +1, +1],
  [+1, +1, -1],
  [+1, -1, +1],
  [+1, -1, -1],
  [-1, +1, +1],
  [-1, +1, -1],
  [-1, -1, +1],
  [-1, -1, -1]
]

@Register('cuboid')
export class Cuboid extends Volume {
  readonly type = 'cuboid'

  @Serialize()
  readonly extents: Vector3

  readonly axes: Vector3[]

  constructor({ origin = Vector3.createZero(), extents = Vector3.createOne() } = {}) {
    super({ origin })

    this.extents = extents.clone()
    this.axes = Vector3.createAxes()

    this.validate()
  }

  validate(): void {
    super.validate()
    assertPositiveDimensions(...this.extents.xyz)
  }

  applyTransform(transform: Transform) {
    const { rotation } = transform

    this.updateCenter(transform)
    Vector3.createAxes(this.axes).forEach((axis) => {
      rotation.transformVector3(axis, axis)
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { x, y, z } = this.extents

    // Solid box inertia about center, using half-extents: Ixx = (1/3) m (y^2 + z^2), etc.
    const Ixx = (1 / 3) * mass * (y * y + z * z)
    const Iyy = (1 / 3) * mass * (x * x + z * z)
    const Izz = (1 / 3) * mass * (x * x + y * y)

    this.setPrincipalInverseInertia([Ixx, Iyy, Izz], transform)
  }

  calculateSupportPoint(direction: Vector3): Vector3 {
    return vectors.runInScope(() => {
      const point = this.center.clone()
      const contribution = vectors.acquire()

      this.axes.forEach((axis, index) =>
        point.add(
          Vector3.scale(
            axis,
            (Vector3.calculateDotProduct(axis, direction) >= 0 ? 1 : -1) * this.extents[index],
            contribution
          )
        )
      )

      return point
    })
  }

  calculateVertices(destination: Vector3[] = []): Vector3[] {
    return vectors.runInScope(() => {
      const { x: extentX, y: extentY, z: extentZ } = this.extents
      const offset = vectors.acquire()
      const contribution = vectors.acquire()

      vertexSigns.forEach(([signX, signY, signZ], index) => {
        Vector3.createZero(offset)
        Vector3.add(offset, Vector3.scale(this.axes[0], extentX * signX, contribution), offset)
        Vector3.add(offset, Vector3.scale(this.axes[1], extentY * signY, contribution), offset)
        Vector3.add(offset, Vector3.scale(this.axes[2], extentZ * signZ, contribution), offset)

        destination[index] = Vector3.add(this.center, offset, destination[index] ?? new Vector3())
      })

      destination.length = vertexSigns.length

      return destination
    })
  }

  listEdges(): Tuple2[] {
    return [
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
  }
}

export const isCuboid = (collider: Collider): collider is Cuboid => {
  return collider.type === 'cuboid'
}
