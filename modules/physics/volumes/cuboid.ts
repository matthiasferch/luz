import { Transform } from '@luz/core'
import { Serialize } from '@luz/utilities'
import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'

export class Cuboid extends Volume {
  readonly type: Collider.Type = 'cuboid'

  @Serialize()
  readonly extents: vec3

  readonly axes: vec3[] // Transformed axes of the cuboid

  constructor({ origin = vec3.zero, extents = vec3.one } = {}) {
    super({ origin })

    this.extents = extents.copy()
    this.axes = vec3.axes.map((axis) => axis.copy()) // Local axes, initially aligned with world axes
  }

  transform(transform: Transform) {
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
    const { x, y, z } = this.extents

    const t1 = (1 / 12) * mass * (y * y + z * z)
    const t2 = (1 / 12) * mass * (x * x + z * z)
    const t3 = (1 / 12) * mass * (x * x + y * y)

    this.inverseInertia.set([t1, 0, 0, 0, t2, 0, 0, 0, t3])
    this.inverseInertia.multiply(rotationMatrix).invert()
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
