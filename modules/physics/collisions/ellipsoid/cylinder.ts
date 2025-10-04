import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Ellipsoid } from '../../volumes/ellipsoid'
import { Cylinder } from '../../volumes/cylinder'

const EPS = 1e-6

export function collideEllipsoidWithCylinder(ellipsoid: Ellipsoid, cylinder: Cylinder): Collision[] | null {
  const cE = ellipsoid.center
  const cC = cylinder.center
  const a = cylinder.axes[2] // cylinder axis (unit)
  const r = cylinder.radius
  const hh = cylinder.height / 2

  // Closest point on oriented finite cylinder to ellipsoid center
  const w = vec3.subtract(cE, cC, new vec3())
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

  // Distance from ellipsoid center to closest point on cylinder
  const toClosest = vec3.subtract(closest, cE, new vec3())
  const dist = toClosest.length

  // Direction from ellipsoid center toward cylinder contact
  const nDir = dist > EPS ? vec3.scale(toClosest, 1 / dist, new vec3()) : a.copy()
  const rEff = ellipsoid.effectiveRadius(nDir)

  if (dist > rEff + EPS) return null

  // Cylinder surface normal at closest point
  let nCyl: vec3
  const onCap = Math.abs(t) >= hh - 1e-6 && radialLen <= r + 1e-6
  if (onCap) {
    nCyl = vec3.scale(a, t >= 0 ? 1 : -1, new vec3())
  } else if (radialLen > EPS) {
    nCyl = vec3.scale(radial, 1 / radialLen, new vec3())
  } else {
    nCyl = a.copy()
  }

  const penetration = Math.max(0, rEff - dist)
  return [ { contact: closest, normal: nCyl, distance: penetration } ]
}

