import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Ellipsoid } from '../../volumes/ellipsoid'
import { Polygon } from '../../colliders/polygon'

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

export const collidePolygonWithEllipsoid = (polygon: Polygon, ellipsoid: Ellipsoid): Collision[] | null => {
  const c = ellipsoid.center
  const ux = ellipsoid.axes[0]
  const uy = ellipsoid.axes[1]
  const uz = ellipsoid.axes[2]
  const { x: a, y: b, z: cr } = ellipsoid.radius

  const toScaled = (p: vec3, out: vec3 = new vec3()) => {
    const r = vec3.subtract(p, c, new vec3())
    out.x = vec3.dot(r, ux) / a
    out.y = vec3.dot(r, uy) / b
    out.z = vec3.dot(r, uz) / cr
    return out
  }

  const toWorld = (pS: vec3, out: vec3 = new vec3()) => {
    return vec3.add(
      c,
      vec3.add(
        vec3.add(vec3.scale(ux, a * pS.x, new vec3()), vec3.scale(uy, b * pS.y, new vec3()), new vec3()),
        vec3.scale(uz, cr * pS.z, new vec3()),
        new vec3()
      ),
      out
    )
  }

  const v1S = toScaled(polygon.vertices[0])
  const v2S = toScaled(polygon.vertices[1])
  const v3S = toScaled(polygon.vertices[2])

  const closestS = closestPointOnTriangle(vec3.zero, v1S, v2S, v3S)
  const dist = closestS.length

  if (dist <= 1) {
    const contact = toWorld(closestS)
    const penetration = 1 - dist
    // Use polygon normal in world for stable ground contacts
    const normal = polygon.normal.copy()
    return [{ contact, normal, distance: penetration }]
  }

  return null
}
