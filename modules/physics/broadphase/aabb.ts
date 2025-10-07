import { vec3 } from '@luz/vectors'
import { Collider } from '../collider'
import { Volume } from '../volume'
import { Sphere } from '../volumes/sphere'
import { Cuboid } from '../volumes/cuboid'
import { Ellipsoid } from '../volumes/ellipsoid'
import { Cylinder } from '../volumes/cylinder'
import { Polygon } from '../colliders/polygon'

export interface AABB {
  minX: number
  minY: number
  minZ: number
  maxX: number
  maxY: number
  maxZ: number
}

export const aabbOverlap = (a: AABB, b: AABB): boolean => {
  if (a.maxX < b.minX || b.maxX < a.minX) return false
  if (a.maxY < b.minY || b.maxY < a.minY) return false
  if (a.maxZ < b.minZ || b.maxZ < a.minZ) return false
  return true
}

export const aabbFromVolume = (volume: Volume): AABB => {
  switch (volume.type) {
    case 'Sphere': {
      const s = volume as Sphere
      const r = s.radius
      const cx = s.center.x, cy = s.center.y, cz = s.center.z
      return { minX: cx - r, minY: cy - r, minZ: cz - r, maxX: cx + r, maxY: cy + r, maxZ: cz + r }
    }
    case 'Cuboid': {
      const c = volume as Cuboid
      const ex = c.extents.x, ey = c.extents.y, ez = c.extents.z
      const ax = c.axes[0], ay = c.axes[1], az = c.axes[2]
      const hx = Math.abs(ax.x) * ex + Math.abs(ay.x) * ey + Math.abs(az.x) * ez
      const hy = Math.abs(ax.y) * ex + Math.abs(ay.y) * ey + Math.abs(az.y) * ez
      const hz = Math.abs(ax.z) * ex + Math.abs(ay.z) * ey + Math.abs(az.z) * ez
      const cx = c.center.x, cy = c.center.y, cz = c.center.z
      return { minX: cx - hx, minY: cy - hy, minZ: cz - hz, maxX: cx + hx, maxY: cy + hy, maxZ: cz + hz }
    }
    case 'Ellipsoid': {
      const e = volume as Ellipsoid
      const hx = e.effectiveRadius(vec3.right)
      const hy = e.effectiveRadius(vec3.up)
      const hz = e.effectiveRadius(vec3.forward)
      const cx = e.center.x, cy = e.center.y, cz = e.center.z
      return { minX: cx - hx, minY: cy - hy, minZ: cz - hz, maxX: cx + hx, maxY: cy + hy, maxZ: cz + hz }
    }
    case 'Cylinder': {
      const cy = volume as Cylinder
      const hx = cy.effectiveRadius(vec3.right)
      const hy = cy.effectiveRadius(vec3.up)
      const hz = cy.effectiveRadius(vec3.forward)
      const cx = cy.center.x, cY = cy.center.y, cz = cy.center.z
      return { minX: cx - hx, minY: cY - hy, minZ: cz - hz, maxX: cx + hx, maxY: cY + hy, maxZ: cz + hz }
    }
    default: {
      const c = volume.center
      return { minX: c.x, minY: c.y, minZ: c.z, maxX: c.x, maxY: c.y, maxZ: c.z }
    }
  }
}

export const aabbFromCollider = (collider: Collider): AABB | null => {
  switch (collider.type) {
    case 'Plane':
      return null // Infinite
    case 'Polygon': {
      const p = collider as Polygon
      if (!p.vertices || p.vertices.length === 0) return null
      let minX = Infinity, minY = Infinity, minZ = Infinity
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
      for (const v of p.vertices) {
        if (v.x < minX) minX = v.x
        if (v.y < minY) minY = v.y
        if (v.z < minZ) minZ = v.z
        if (v.x > maxX) maxX = v.x
        if (v.y > maxY) maxY = v.y
        if (v.z > maxZ) maxZ = v.z
      }
      return { minX, minY, minZ, maxX, maxY, maxZ }
    }
    case 'Sphere':
    case 'Cuboid':
    case 'Ellipsoid':
    case 'Cylinder':
      return aabbFromVolume(collider as unknown as Volume)
    default:
      return null
  }
}

