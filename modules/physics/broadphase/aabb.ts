import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'
import { Sphere } from '../volumes/sphere'
import { Cuboid } from '../volumes/cuboid'
import { Ellipsoid } from '../volumes/ellipsoid'
import { Cylinder } from '../volumes/cylinder'
import { Polygon } from '../colliders/polygon'

export class AABB {
  minX: number
  minY: number
  minZ: number
  maxX: number
  maxY: number
  maxZ: number

  constructor(collider: Collider) {
    // Build from collider type. Infinite primitives (Plane) are not representable; use fromCollider for null.
    switch (collider.type) {
      case 'Sphere': {
        const sphere = collider as Sphere
        const radius = sphere.radius
        const centerX = sphere.center.x
        const centerY = sphere.center.y
        const centerZ = sphere.center.z

        this.minX = centerX - radius
        this.minY = centerY - radius
        this.minZ = centerZ - radius

        this.maxX = centerX + radius
        this.maxY = centerY + radius
        this.maxZ = centerZ + radius

        break
      }
      case 'Cuboid': {
        const cuboid = collider as Cuboid

        const halfExtentX = cuboid.extents.x
        const halfExtentY = cuboid.extents.y
        const halfExtentZ = cuboid.extents.z

        const axisX = cuboid.axes[0]
        const axisY = cuboid.axes[1]
        const axisZ = cuboid.axes[2]

        const halfX = Math.abs(axisX.x) * halfExtentX + Math.abs(axisY.x) * halfExtentY + Math.abs(axisZ.x) * halfExtentZ
        const halfY = Math.abs(axisX.y) * halfExtentX + Math.abs(axisY.y) * halfExtentY + Math.abs(axisZ.y) * halfExtentZ
        const halfZ = Math.abs(axisX.z) * halfExtentX + Math.abs(axisY.z) * halfExtentY + Math.abs(axisZ.z) * halfExtentZ

        const centerX = cuboid.center.x
        const centerY = cuboid.center.y
        const centerZ = cuboid.center.z

        this.minX = centerX - halfX
        this.minY = centerY - halfY
        this.minZ = centerZ - halfZ

        this.maxX = centerX + halfX
        this.maxY = centerY + halfY
        this.maxZ = centerZ + halfZ

        break
      }
      case 'Ellipsoid': {
        const ellipsoid = collider as Ellipsoid

        const halfX = ellipsoid.effectiveRadius(vec3.right)
        const halfY = ellipsoid.effectiveRadius(vec3.up)
        const halfZ = ellipsoid.effectiveRadius(vec3.forward)

        const centerX = ellipsoid.center.x
        const centerY = ellipsoid.center.y
        const centerZ = ellipsoid.center.z

        this.minX = centerX - halfX
        this.minY = centerY - halfY
        this.minZ = centerZ - halfZ

        this.maxX = centerX + halfX
        this.maxY = centerY + halfY
        this.maxZ = centerZ + halfZ

        break
      }
      case 'Cylinder': {
        const cylinder = collider as Cylinder

        const halfX = cylinder.effectiveRadius(vec3.right)
        const halfY = cylinder.effectiveRadius(vec3.up)
        const halfZ = cylinder.effectiveRadius(vec3.forward)

        const centerX = cylinder.center.x
        const centerY = cylinder.center.y
        const centerZ = cylinder.center.z

        this.minX = centerX - halfX
        this.minY = centerY - halfY
        this.minZ = centerZ - halfZ

        this.maxX = centerX + halfX
        this.maxY = centerY + halfY
        this.maxZ = centerZ + halfZ

        break
      }
      case 'Polygon': {
        const polygon = collider as Polygon
        if (!polygon.vertices || polygon.vertices.length === 0) {
          this.minX = this.minY = this.minZ = 0
          this.maxX = this.maxY = this.maxZ = 0

          break
        }
        let minX = Infinity, minY = Infinity, minZ = Infinity
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

        for (const vertex of polygon.vertices) {
          if (vertex.x < minX) minX = vertex.x
          if (vertex.y < minY) minY = vertex.y
          if (vertex.z < minZ) minZ = vertex.z

          if (vertex.x > maxX) maxX = vertex.x
          if (vertex.y > maxY) maxY = vertex.y
          if (vertex.z > maxZ) maxZ = vertex.z
        }

        this.minX = minX
        this.minY = minY
        this.minZ = minZ

        this.maxX = maxX
        this.maxY = maxY
        this.maxZ = maxZ

        break
      }
      default: {
        // Fallback: zero-sized at origin
        this.minX = this.minY = this.minZ = 0
        this.maxX = this.maxY = this.maxZ = 0
      }
    }
  }

  static overlap(a: AABB, b: AABB): boolean {
    if (a.maxX < b.minX || b.maxX < a.minX) return false
    if (a.maxY < b.minY || b.maxY < a.minY) return false
    if (a.maxZ < b.minZ || b.maxZ < a.minZ) return false
    return true
  }

  static fromVolume(volume: Volume): AABB {
    return new AABB(volume as unknown as Collider)
  }

  static fromCollider(collider: Collider): AABB | null {
    if (collider.type === 'Plane') {
      return null
    }

    return new AABB(collider)
  }
}
