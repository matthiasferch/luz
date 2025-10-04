import { vec3 } from '@luz/vectors'
import { Ray } from '../../colliders/ray'
import { Collision } from '../../collision'
import { Ellipsoid } from '../../volumes/ellipsoid'

// Exact ray-ellipsoid via transform to unit sphere
export const collideRayWithEllipsoid = (ray: Ray, ellipsoid: Ellipsoid): Collision[] | null => {
  const { origin: o, direction: d } = ray
  const { center: c } = ellipsoid
  const { x: a, y: b, z: zc } = ellipsoid.radius

  // Build orthonormal basis (axes) U from ellipsoid
  const ux = ellipsoid.axes[0]
  const uy = ellipsoid.axes[1]
  const uz = ellipsoid.axes[2]

  // World -> scaled (unit sphere) transform: p' = M (p - c)
  const toScaled = (p: vec3, dest: vec3 = new vec3()) => {
    const r = vec3.subtract(p, c, new vec3())
    const px = vec3.dot(r, ux) / a
    const py = vec3.dot(r, uy) / b
    const pz = vec3.dot(r, uz) / zc
    dest.x = px; dest.y = py; dest.z = pz
    return dest
  }

  const oS = toScaled(o)
  // Direction transforms linearly (no translation)
  const dx = vec3.dot(d, ux) / a
  const dy = vec3.dot(d, uy) / b
  const dz = vec3.dot(d, uz) / zc
  const dS = new vec3([dx, dy, dz])

  const A = vec3.dot(dS, dS)
  const B = 2 * vec3.dot(oS, dS)
  const C = vec3.dot(oS, oS) - 1

  const disc = B * B - 4 * A * C
  if (disc < 0) return null

  const sqrtDisc = Math.sqrt(disc)
  const inv2A = 1 / (2 * A)
  let t0 = (-B - sqrtDisc) * inv2A
  let t1 = (-B + sqrtDisc) * inv2A

  if (t0 > t1) { const tmp = t0; t0 = t1; t1 = tmp }

  if (t1 < 0) return null // both behind
  const t = t0 >= 0 ? t0 : t1

  const hitS = vec3.add(oS, vec3.scale(dS, t, new vec3()), new vec3())

  // Map to world: p = c + U diag(a,b,c) hitS
  const hit = vec3.add(
    c,
    vec3.add(
      vec3.add(
        vec3.scale(ux, a * hitS.x, new vec3()),
        vec3.scale(uy, b * hitS.y, new vec3()),
        new vec3()
      ),
      vec3.scale(uz, zc * hitS.z, new vec3()),
      new vec3()
    ),
    new vec3()
  )

  // Normal mapping: n_world ∝ M^T n' with n' = hitS on unit sphere; M is symmetric
  let n = vec3.add(
    vec3.add(
      vec3.scale(ux, hitS.x / a, new vec3()),
      vec3.scale(uy, hitS.y / b, new vec3()),
      new vec3()
    ),
    vec3.scale(uz, hitS.z / zc, new vec3()),
    new vec3()
  )
  if (n.length > 0) {
    n.normalize()
  } else {
    n = d.copy().normalize() // fallback
  }

  // Align with existing ray API (like ray-sphere): point normal toward center
  n.scale(-1)

  // Distance along original ray
  const distance = vec3.subtract(hit, o, new vec3()).length

  return [{ contact: hit, normal: n, distance }]
}
