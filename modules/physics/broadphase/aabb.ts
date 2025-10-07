import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Sphere } from '../volumes/sphere'
import { Cuboid } from '../volumes/cuboid'
import { Ellipsoid } from '../volumes/ellipsoid'
import { Cylinder } from '../volumes/cylinder'
import { Polygon } from '../colliders/polygon'
import { Frustum } from '../volumes/frustum'

const { abs } = Math

export class BoundingBox {
  readonly minimum: vec3
  readonly maximum: vec3

  constructor(collider: Collider) {
    this.minimum = vec3.zero.copy()
    this.maximum = vec3.zero.copy()

    const { type } = collider

    switch (type) {
      case 'Sphere': {
        const sphere = collider as Sphere

        const { center, radius } = sphere

        this.minimum.x = center.x - radius
        this.minimum.y = center.y - radius
        this.minimum.z = center.z - radius

        this.maximum.x = center.x + radius
        this.maximum.y = center.y + radius
        this.maximum.z = center.z + radius

        break
      }

      case 'Cuboid': {
        const cuboid = collider as Cuboid

        const { extents, center, axes } = cuboid

        const halfExtents = new vec3([
          abs(axes[0].x) * extents.x + abs(axes[1].x) * extents.y + abs(axes[2].x) * extents.z,
          abs(axes[0].y) * extents.x + abs(axes[1].y) * extents.y + abs(axes[2].y) * extents.z,
          abs(axes[0].z) * extents.x + abs(axes[1].z) * extents.y + abs(axes[2].z) * extents.z
        ])

        this.minimum.x = center.x - halfExtents.x
        this.minimum.y = center.y - halfExtents.y
        this.minimum.z = center.z - halfExtents.z

        this.maximum.x = center.x + halfExtents.x
        this.maximum.y = center.y + halfExtents.y
        this.maximum.z = center.z + halfExtents.z

        break
      }

      case 'Ellipsoid': {
        const ellipsoid = collider as Ellipsoid

        const { center } = ellipsoid

        const halfExtents = new vec3([
          ellipsoid.effectiveRadius(vec3.right),
          ellipsoid.effectiveRadius(vec3.up),
          ellipsoid.effectiveRadius(vec3.forward)
        ])


        this.minimum.x = center.x - halfExtents.x
        this.minimum.y = center.y - halfExtents.y
        this.minimum.z = center.z - halfExtents.z

        this.maximum.x = center.x + halfExtents.x
        this.maximum.y = center.y + halfExtents.y
        this.maximum.z = center.z + halfExtents.z

        break
      }

      case 'Cylinder': {
        const cylinder = collider as Cylinder

        const { center } = cylinder

        const halfExtents = new vec3([
          cylinder.effectiveRadius(vec3.right),
          cylinder.effectiveRadius(vec3.up),
          cylinder.effectiveRadius(vec3.forward)
        ])

        this.minimum.x = center.x - halfExtents.x
        this.minimum.y = center.y - halfExtents.y
        this.minimum.z = center.z - halfExtents.z

        this.maximum.x = center.x + halfExtents.x
        this.maximum.y = center.y + halfExtents.y
        this.maximum.z = center.z + halfExtents.z

        break
      }

      case 'Frustum': {
        const frustum = collider as Frustum

        const corners = frustum.getCorners()

        this.minimum.x = this.minimum.y = this.minimum.z = Infinity
        this.maximum.x = this.maximum.y = this.maximum.z = -Infinity

        for (const v of corners) {
          if (v.x < this.minimum.x) this.minimum.x = v.x
          if (v.y < this.minimum.y) this.minimum.y = v.y
          if (v.z < this.minimum.z) this.minimum.z = v.z

          if (v.x > this.maximum.x) this.maximum.x = v.x
          if (v.y > this.maximum.y) this.maximum.y = v.y
          if (v.z > this.maximum.z) this.maximum.z = v.z
        }

        break
      }

      case 'Polygon': {
        const polygon = collider as Polygon

        const { vertices } = polygon

        if (!vertices || vertices.length === 0) {
          this.minimum.x = this.minimum.y = this.minimum.z = 0
          this.maximum.x = this.maximum.y = this.maximum.z = 0

          break
        }

        this.minimum.x = this.minimum.y = this.minimum.z = Infinity
        this.maximum.x = this.maximum.y = this.maximum.z = -Infinity

        for (const vertex of vertices) {
          if (vertex.x < this.minimum.x) {
            this.minimum.x = vertex.x
          }

          if (vertex.y < this.minimum.y) {
            this.minimum.y = vertex.y
          }

          if (vertex.z < this.minimum.z) {
            this.minimum.z = vertex.z
          }

          if (vertex.x > this.maximum.x) {
            this.maximum.x = vertex.x
          }

          if (vertex.y > this.maximum.y) {
            this.maximum.y = vertex.y
          }

          if (vertex.z > this.maximum.z) {
            this.maximum.z = vertex.z
          }
        }

        break
      }

      default: {
        throw new Error(`AABB not implemented for collider type: ${type}`)
      }
    }
  }

  static intersect(c1: BoundingBox, c2: BoundingBox): boolean {
    if (c1.maximum.x < c2.minimum.x || c2.maximum.x < c1.minimum.x) {
      return false
    }

    if (c1.maximum.y < c2.minimum.y || c2.maximum.y < c1.minimum.y) {
      return false
    }

    if (c1.maximum.z < c2.minimum.z || c2.maximum.z < c1.minimum.z) {
      return false
    }

    return true
  }
}

// Back-compat alias
export type AABB = BoundingBox
