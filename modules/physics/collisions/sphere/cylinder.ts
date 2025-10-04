import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'
import { Cylinder } from '../../volumes/cylinder'

const EPS = 1e-6

export function collideSphereWithCylinder(sphere: Sphere, cylinder: Cylinder): Collision[] | null {
  const cS = sphere.center
  const cC = cylinder.center
  const a = cylinder.axes[2] // cylinder axis (unit)
  const r = cylinder.radius
  const hh = cylinder.height / 2

  // Closest point on finite cylinder to sphere center
  const w = vec3.subtract(cS, cC, new vec3())
  let t = vec3.dot(w, a)
  if (t > hh) t = hh
  else if (t < -hh) t = -hh

  const axial = vec3.scale(a, t, new vec3())
  const radial = vec3.subtract(w, axial, new vec3())
  const radialLen = radial.length

  let closest = vec3.add(cC, axial, new vec3())
  if (radialLen > EPS) {
    const scale = Math.min(1, r / radialLen)
    vec3.add(closest, vec3.scale(radial, scale, new vec3()), closest)
  }

  const toClosest = vec3.subtract(closest, cS, new vec3())
  const dist = toClosest.length
  if (dist > sphere.radius) return null

  // Cylinder surface normal at closest point
  let n: vec3
  const onCap = Math.abs(t) >= hh - 1e-6 && radialLen <= r + 1e-6
  if (onCap) {
    n = vec3.scale(a, t >= 0 ? 1 : -1, new vec3())
  } else if (radialLen > EPS) {
    n = vec3.scale(radial, 1 / radialLen, new vec3())
  } else {
    // Fallback if sphere is along axis centerline
    n = a.copy()
  }

  const penetration = Math.max(0, sphere.radius - dist)
  return [{ contact: closest, normal: n, distance: penetration }]
}

