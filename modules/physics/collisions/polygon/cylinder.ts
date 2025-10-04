import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cylinder } from '../../volumes/cylinder'
import { Polygon } from '../../colliders/polygon'

const { min, max } = Math

// Closest point from point p to triangle abc
const closestPointOnTriangle = (p: vec3, a: vec3, b: vec3, c: vec3): vec3 => {
  const ab = vec3.subtract(b, a, new vec3())
  const ac = vec3.subtract(c, a, new vec3())
  const ap = vec3.subtract(p, a, new vec3())

  const d1 = vec3.dot(ab, ap)
  const d2 = vec3.dot(ac, ap)
  if (d1 <= 0 && d2 <= 0) return a.copy()

  const bp = vec3.subtract(p, b, new vec3())
  const d3 = vec3.dot(ab, bp)
  const d4 = vec3.dot(ac, bp)
  if (d3 >= 0 && d4 <= d3) return b.copy()

  const vc = d1 * d4 - d3 * d2
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3)
    return vec3.add(a, vec3.scale(ab, v, new vec3()), new vec3())
  }

  const cp = vec3.subtract(p, c, new vec3())
  const d5 = vec3.dot(ab, cp)
  const d6 = vec3.dot(ac, cp)
  if (d6 >= 0 && d5 <= d6) return c.copy()

  const vb = d5 * d2 - d1 * d6
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6)
    return vec3.add(a, vec3.scale(ac, w, new vec3()), new vec3())
  }

  const va = d3 * d6 - d5 * d4
  if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
    const w = (d4 - d3) / ((d4 - d3) + (d5 - d6))
    const bc = vec3.subtract(c, b, new vec3())
    return vec3.add(b, vec3.scale(bc, w, new vec3()), new vec3())
  }

  const denom = 1 / (va + vb + vc)
  const v = vb * denom
  const w = vc * denom
  return vec3.add(a, vec3.add(vec3.scale(ab, v, new vec3()), vec3.scale(ac, w, new vec3()), new vec3()), new vec3())
}

export const collidePolygonWithCylinder = (polygon: Polygon, cylinder: Cylinder): Collision[] | null => {
  const center = cylinder.center
  const contact = closestPointOnTriangle(center, polygon.vertices[0], polygon.vertices[1], polygon.vertices[2])

  const dir = vec3.subtract(contact, center, new vec3())
  const dist = dir.length
  const n = dist > 0 ? vec3.scale(dir, 1 / dist, new vec3()) : polygon.normal
  const r = cylinder.effectiveRadius(n)

  if (dist <= r) {
    return [ { contact, normal: polygon.normal.copy(), distance: r - dist } ]
  }

  return null
}

