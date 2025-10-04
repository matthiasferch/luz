import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Ellipsoid } from '../../volumes/ellipsoid'
import { Cuboid } from '../../volumes/cuboid'

const EPS = 1e-6

// Exact via transform to unit sphere and triangle distance
export function collideEllipsoidWithCuboid(ellipsoid: Ellipsoid, cuboid: Cuboid): Collision[] | null {
  const c = ellipsoid.center
  const ux = ellipsoid.axes[0]
  const uy = ellipsoid.axes[1]
  const uz = ellipsoid.axes[2]
  const { x: a, y: b, z: cr } = ellipsoid.radii

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

  // Transform cuboid vertices to scaled space
  const vWorld = cuboid.getVertices()
  const vS = vWorld.map((v) => toScaled(v))

  // Faces as quads, then triangulate ([i0,i1,i2], [i0,i2,i3])
  const faces: [number, number, number, number][] = [
    [0, 1, 3, 2], // +X
    [4, 5, 7, 6], // -X
    [0, 1, 5, 4], // +Y
    [2, 3, 7, 6], // -Y
    [0, 2, 6, 4], // +Z
    [1, 3, 7, 5]  // -Z
  ]

  const triIndices: [number, number, number][] = []
  faces.forEach(([i0, i1, i2, i3]) => {
    triIndices.push([i0, i1, i2], [i0, i2, i3])
  })

  const originS = vec3.zero

  let minDist2 = Infinity
  let bestClosest = new vec3()

  const closestPointOnTri = (p: vec3, a: vec3, b: vec3, c: vec3): vec3 => {
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

  for (const [i0, i1, i2] of triIndices) {
    const aS = vS[i0]
    const bS = vS[i1]
    const cS = vS[i2]
    const q = closestPointOnTri(originS, aS, bS, cS)
    const d2 = q.squaredLength
    if (d2 < minDist2) {
      minDist2 = d2
      bestClosest = q
    }
  }

  const dist = Math.sqrt(minDist2)
  if (dist > 1 + EPS) return null

  const contact = toWorld(bestClosest)
  const penetration = Math.max(0, 1 - dist)

  // Normal: use sphere normal in scaled space mapped back to world: n = M^T n'
  let nWorld = vec3.add(
    vec3.add(
      vec3.scale(ux, bestClosest.x / a, new vec3()),
      vec3.scale(uy, bestClosest.y / b, new vec3()),
      new vec3()
    ),
    vec3.scale(uz, bestClosest.z / cr, new vec3()),
    new vec3()
  )
  if (nWorld.length > 0) {
    nWorld.normalize()
  } else {
    nWorld = vec3.up.copy()
  }

  return [ { contact, normal: nWorld, distance: penetration } ]
}
