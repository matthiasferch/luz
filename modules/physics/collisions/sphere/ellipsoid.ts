import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Sphere } from '../../volumes/sphere'
import { Ellipsoid } from '../../volumes/ellipsoid'

const EPS = 1e-6

export function collideSphereWithEllipsoid(sphere: Sphere, ellipsoid: Ellipsoid): Collision[] | null {
  const cE = ellipsoid.center
  const cS = sphere.center

  // Vector from ellipsoid center to sphere center
  const d = vec3.subtract(cS, cE, new vec3())

  const a = ellipsoid.radii.x
  const b = ellipsoid.radii.y
  const c = ellipsoid.radii.z

  // Inflate ellipsoid by sphere radius (Minkowski sum)
  const A = a + sphere.radius
  const B = b + sphere.radius
  const C = c + sphere.radius

  // Express d in ellipsoid's local basis and scale by inflated radii
  const u0 = vec3.dot(d, ellipsoid.axes[0]) / A
  const u1 = vec3.dot(d, ellipsoid.axes[1]) / B
  const u2 = vec3.dot(d, ellipsoid.axes[2]) / C

  const uLen2 = u0 * u0 + u1 * u1 + u2 * u2
  if (uLen2 > 1 + EPS) {
    // Outside inflated ellipsoid: no collision
    return null
  }

  // Handle degenerate center overlap
  let uLen = Math.sqrt(Math.max(uLen2, 0))
  let hx = 1, hy = 0, hz = 0
  if (uLen > EPS) {
    hx = u0 / uLen
    hy = u1 / uLen
    hz = u2 / uLen
  } else {
    // Choose a stable direction (major axis)
    // Prefer the largest radius axis to reduce instability
    if (a >= b && a >= c) { hx = 1; hy = 0; hz = 0 }
    else if (b >= a && b >= c) { hx = 0; hy = 1; hz = 0 }
    else { hx = 0; hy = 0; hz = 1 }
  }

  // Point on original ellipsoid surface in local coords along direction h
  const qLocX = a * hx
  const qLocY = b * hy
  const qLocZ = c * hz

  // World-space contact point on ellipsoid surface
  const qWorld = vec3.add(
    cE,
    vec3.add(
      vec3.add(
        vec3.scale(ellipsoid.axes[0], qLocX, new vec3()),
        vec3.scale(ellipsoid.axes[1], qLocY, new vec3()),
        new vec3()
      ),
      vec3.scale(ellipsoid.axes[2], qLocZ, new vec3()),
      new vec3()
    ),
    new vec3()
  )

  // Compute normal via gradient of implicit ellipsoid
  const nLocal = new vec3([qLocX / (a * a), qLocY / (b * b), qLocZ / (c * c)])
  let normal = vec3.add(
    vec3.add(
      vec3.scale(ellipsoid.axes[0], nLocal.x, new vec3()),
      vec3.scale(ellipsoid.axes[1], nLocal.y, new vec3()),
      new vec3()
    ),
    vec3.scale(ellipsoid.axes[2], nLocal.z, new vec3()),
    new vec3()
  ).normalize()

  // Penetration depth: compare sphere radius vs distance to ellipsoid surface
  const distToSurface = vec3.subtract(cS, qWorld, new vec3()).length
  const penetration = sphere.radius - distToSurface
  if (penetration < -EPS) {
    return null
  }

  const distance = Math.max(0, penetration)

  return [
    {
      contact: qWorld,
      normal,
      distance
    }
  ]
}

