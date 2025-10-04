import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cylinder } from '../../volumes/cylinder'

const EPS = 1e-6

// Closest points between two finite cylinder center-lines, test radial overlap.
export function collideCylinderWithCylinder(aCyl: Cylinder, bCyl: Cylinder): Collision[] | null {
  const c1 = aCyl.center
  const c2 = bCyl.center
  const u = aCyl.axes[2] // axis unit
  const v = bCyl.axes[2] // axis unit
  const L1 = aCyl.height / 2
  const L2 = bCyl.height / 2
  const Rsum = aCyl.radius + bCyl.radius

  // Solve closest points between segments c1 + s u, s in [-L1, L1] and c2 + t v, t in [-L2, L2]
  const w0 = vec3.subtract(c1, c2, new vec3())
  const a = vec3.dot(u, u) // =1
  const b = vec3.dot(u, v)
  const c = vec3.dot(v, v) // =1
  const d = vec3.dot(u, w0)
  const e = vec3.dot(v, w0)
  const denom = a * c - b * b

  let s = 0
  let t = 0
  if (Math.abs(denom) > EPS) {
    s = (b * e - c * d) / denom
    t = (a * e - b * d) / denom
  }
  // Clamp to segment extents
  s = Math.max(-L1, Math.min(L1, s))
  t = Math.max(-L2, Math.min(L2, t))

  const p1 = vec3.add(c1, vec3.scale(u, s, new vec3()), new vec3())
  const p2 = vec3.add(c2, vec3.scale(v, t, new vec3()), new vec3())

  const dvec = vec3.subtract(p2, p1, new vec3())
  const dist = dvec.length
  if (dist > Rsum) return null

  // Normal between axes at closest points
  let n: vec3
  if (dist > EPS) {
    n = vec3.scale(dvec, 1 / dist, new vec3())
  } else {
    // Axes nearly intersect; pick a stable normal
    const cross = vec3.cross(u, v, new vec3())
    if (cross.length > EPS) {
      n = vec3.cross(cross.normalize(), u, new vec3()).normalize()
    } else {
      // Parallel axes: choose any perpendicular to u
      n = Math.abs(u.x) < 0.9 ? vec3.cross(u, new vec3([1, 0, 0]), new vec3()).normalize() : vec3.cross(u, new vec3([0, 1, 0]), new vec3()).normalize()
    }
  }

  // Contact point on cylinder A surface
  const contact = vec3.add(p1, vec3.scale(n, aCyl.radius, new vec3()), new vec3())
  const penetration = Math.max(0, Rsum - dist)

  return [{ contact, normal: n, distance: penetration }]
}

