import { Transform } from '@luz/core'
import { Serialize, Register } from '@luz/utilities'
import { mat3, vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

@Register()
export class Cuboid extends Volume {
  readonly type: Collider.Type = 'Cuboid'

  @Serialize()
  readonly extents: vec3

  readonly axes: vec3[] // Transformed axes of the cuboid

  constructor({ origin = vec3.zero, extents = vec3.one } = {}) {
    super({ origin })

    this.extents = extents.copy()
    this.axes = vec3.axes.map((axis) => axis.copy()) // Local axes, initially aligned with world axes
  }

  applyTransform(transform: Transform) {
    const { translation, rotation } = transform

    // Update the center of the cuboid
    vec3.add(this.origin, translation, this.center)

    // Rotate the local axes to align with the new orientation
    vec3.axes.forEach((axis, index) => {
      rotation.transformVec3(axis, this.axes[index])
    })
  }

  calculateInverseInertia(mass: number, transform: Transform) {
    const { rotationMatrix } = transform
    const { x, y, z } = this.extents // half-extents

    // Solid box inertia about center, using half-extents: Ixx = (1/3) m (y^2 + z^2), etc.
    const Ixx = (1 / 3) * mass * (y * y + z * z)
    const Iyy = (1 / 3) * mass * (x * x + z * z)
    const Izz = (1 / 3) * mass * (x * x + y * y)

    // Inverse in body space (diagonal)
    const invIxx = Ixx > 0 ? 1 / Ixx : 0
    const invIyy = Iyy > 0 ? 1 / Iyy : 0
    const invIzz = Izz > 0 ? 1 / Izz : 0

    const IbodyInv = new mat3([invIxx, 0, 0, 0, invIyy, 0, 0, 0, invIzz])

    // World-space inverse inertia: R * IbodyInv * R^T
    const Rt = rotationMatrix.copy().transpose()
    // Start with Rt so that multiply order (dest = other * this) yields Rt * IbodyInv then R * (Rt * IbodyInv)
    this.inverseInertia.reset()
    this.inverseInertia[0] = Rt[0]; this.inverseInertia[1] = Rt[1]; this.inverseInertia[2] = Rt[2]
    this.inverseInertia[3] = Rt[3]; this.inverseInertia[4] = Rt[4]; this.inverseInertia[5] = Rt[5]
    this.inverseInertia[6] = Rt[6]; this.inverseInertia[7] = Rt[7]; this.inverseInertia[8] = Rt[8]
    this.inverseInertia.multiply(IbodyInv)
    this.inverseInertia.multiply(rotationMatrix)
  }

  // New method to get the 8 vertices of the cuboid
  getVertices(): vec3[] {
    const { x: ex, y: ey, z: ez } = this.extents

    // These combinations represent the 8 vertices, with different sign combinations of extents
    const signs = [
      [+1, +1, +1],
      [+1, +1, -1],
      [+1, -1, +1],
      [+1, -1, -1],
      [-1, +1, +1],
      [-1, +1, -1],
      [-1, -1, +1],
      [-1, -1, -1]
    ]

    // Compute each vertex by scaling the extents along each axis
    return signs.map(([sx, sy, sz]) => {
      const vertex = vec3.zero.copy()

      // Combine the axes scaled by the extents and the signs
      vec3.add(vertex, vec3.scale(this.axes[0], ex * sx), vertex) // Scale along x-axis
      vec3.add(vertex, vec3.scale(this.axes[1], ey * sy), vertex) // Scale along y-axis
      vec3.add(vertex, vec3.scale(this.axes[2], ez * sz), vertex) // Scale along z-axis

      // Offset the vertex by the cuboid's center
      return vec3.add(this.center, vertex)
    })
  }

  getEdges(): [number, number][] {
    return [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0], // Bottom edges
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4], // Top edges
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7] // Vertical edges
    ]
  }
}

export const isCuboid = (collider: Collider): collider is Cuboid => {
  return collider.type === 'Cuboid'
}