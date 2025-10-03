import { Epsilon, vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'

// ---------------------------------------------
// Small helpers
// ---------------------------------------------

const tmp = () => new vec3()

const projectExtent = (axis: vec3, axes: vec3[], extents: vec3): number => {
  return (
    Math.abs(vec3.dot(axis, axes[0])) * extents.x +
    Math.abs(vec3.dot(axis, axes[1])) * extents.y +
    Math.abs(vec3.dot(axis, axes[2])) * extents.z
  )
}

const chooseFaceTangentIndices = (main: number): [number, number] => {
  switch (main) {
    case 0: return [1, 2]
    case 1: return [0, 2]
    default: return [0, 1]
  }
}

const getFaceCenterAndBasis = (
  center: vec3,
  axes: vec3[],
  extents: vec3,
  faceAxisIndex: number,
  faceSign: number
) => {
  const normal = vec3.scale(axes[faceAxisIndex], faceSign, tmp())
  const faceCenter = vec3.add(
    center,
    vec3.scale(axes[faceAxisIndex], extents[faceAxisIndex] * faceSign, tmp()),
    tmp()
  )
  const [i1, i2] = chooseFaceTangentIndices(faceAxisIndex)
  const t1 = axes[i1]
  const t2 = axes[i2]
  const e1 = extents[i1]
  const e2 = extents[i2]
  return { faceCenter, normal, t1, t2, e1, e2, i1, i2 }
}

const getFaceVertices = (
  faceCenter: vec3,
  t1: vec3,
  t2: vec3,
  e1: number,
  e2: number
): vec3[] => {
  const v0 = vec3.add(faceCenter, vec3.add(vec3.scale(t1, -e1, tmp()), vec3.scale(t2, -e2, tmp()), tmp()), new vec3())
  const v1 = vec3.add(faceCenter, vec3.add(vec3.scale(t1, +e1, tmp()), vec3.scale(t2, -e2, tmp()), tmp()), new vec3())
  const v2 = vec3.add(faceCenter, vec3.add(vec3.scale(t1, +e1, tmp()), vec3.scale(t2, +e2, tmp()), tmp()), new vec3())
  const v3 = vec3.add(faceCenter, vec3.add(vec3.scale(t1, -e1, tmp()), vec3.scale(t2, +e2, tmp()), tmp()), new vec3())
  return [v0, v1, v2, v3]
}

type AxisType = 'FaceA' | 'FaceB' | 'EdgeEdge'

const clipPolygonAgainstPlane = (poly: vec3[], planeNormal: vec3, planeDist: number): vec3[] => {
  const result: vec3[] = []
  if (poly.length === 0) return result
  const dot = (p: vec3) => vec3.dot(planeNormal, p)

  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const da = dot(a) - planeDist
    const db = dot(b) - planeDist

    const aInside = da <= Epsilon
    const bInside = db <= Epsilon

    if (aInside && bInside) {
      result.push(b.copy())
    } else if (aInside && !bInside) {
      const t = da / (da - db)
      const ab = vec3.subtract(b, a, tmp())
      result.push(vec3.add(a, vec3.scale(ab, t, tmp()), new vec3()))
    } else if (!aInside && bInside) {
      const t = da / (da - db)
      const ab = vec3.subtract(b, a, tmp())
      result.push(vec3.add(a, vec3.scale(ab, t, tmp()), new vec3()))
      result.push(b.copy())
    }
  }
  return result
}

// Closest midpoint between two *segments*
const closestPointBetweenSegmentsMidpoint = (
  p0: vec3, u: vec3, uLen: number,
  q0: vec3, v: vec3, vLen: number
): vec3 => {
  const w0 = vec3.subtract(p0, q0, tmp())
  const a = vec3.dot(u, u)
  const b = vec3.dot(u, v)
  const c = vec3.dot(v, v)
  const d = vec3.dot(u, w0)
  const e = vec3.dot(v, w0)
  const denom = a * c - b * b

  let s = 0, t = 0
  if (Math.abs(denom) > Epsilon) {
    s = (b * e - c * d) / denom
    t = (a * e - b * d) / denom
  }

  s = Math.max(-uLen, Math.min(s, +uLen))
  t = Math.max(-vLen, Math.min(t, +vLen))

  const p = vec3.add(p0, vec3.scale(u, s, tmp()), tmp())
  const q = vec3.add(q0, vec3.scale(v, t, tmp()), tmp())
  return vec3.scale(vec3.add(p, q, tmp()), 0.5, new vec3())
}

const typeBias = (type: AxisType | null) => (type === 'EdgeEdge' ? 1e-6 : 0)
const signNonZero = (x: number, fallback: 1 | -1) => (x > 0 ? 1 : x < 0 ? -1 : fallback)

// --- NEW: compute the penetration of a point against a box face plane along `normal`
const pointPenetrationAgainstBoxPlane = (
  point: vec3,
  normal: vec3,
  axes: vec3[],
  extents: vec3,
  center: vec3
): number => {
  // Pick the face on this box whose normal is *most aligned* with `normal`
  let faceIdx = 0
  let maxDot = -Infinity
  for (let i = 0; i < 3; i++) {
    const d = vec3.dot(axes[i], normal) // since `normal` points A->B, this picks the A-face pointing toward B (or B-face toward A)
    if (d > maxDot) { maxDot = d; faceIdx = i }
  }
  const faceSign = maxDot >= 0 ? +1 : -1
  const { faceCenter } = getFaceCenterAndBasis(center, axes, extents, faceIdx, faceSign)
  const refPlaneD = vec3.dot(normal, faceCenter)
  const pen = refPlaneD - vec3.dot(normal, point)
  return pen
}

// ---------------------------------------------
// Main routine
// ---------------------------------------------

export const collideCuboidWithCuboid = (a: Cuboid, b: Cuboid): Collision[] | null => {
  const axesA = [a.axes[0].copy().normalize(), a.axes[1].copy().normalize(), a.axes[2].copy().normalize()]
  const axesB = [b.axes[0].copy().normalize(), b.axes[1].copy().normalize(), b.axes[2].copy().normalize()]

  const extA = a.extents
  const extB = b.extents
  const cA = a.center
  const cB = b.center

  const t = vec3.subtract(cB, cA, tmp())

  let bestAxis = new vec3()
  let bestDepth = Infinity
  let bestType: AxisType | null = null
  let bestIndexA = -1
  let bestIndexB = -1

  const evaluateAxis = (axis: vec3, type: AxisType, i: number, j: number): boolean => {
    const len = axis.length
    if (len < Epsilon) return true
    const n = vec3.scale(axis, 1 / len, tmp())
    const rA = projectExtent(n, axesA, extA)
    const rB = projectExtent(n, axesB, extB)
    const dist = Math.abs(vec3.dot(t, n))
    const overlap = rA + rB - dist

    if (overlap < -Epsilon) return false

    if (overlap - typeBias(type) < bestDepth - typeBias(bestType)) {
      bestDepth = overlap
      bestAxis = n.copy(bestAxis)
      bestType = type
      bestIndexA = i
      bestIndexB = j
    }
    return true
  }

  for (let i = 0; i < 3; i++) {
    if (!evaluateAxis(axesA[i], 'FaceA', i, -1)) return null
    if (!evaluateAxis(axesB[i], 'FaceB', -1, i)) return null
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const axis = vec3.cross(axesA[i], axesB[j], tmp())
      if (!evaluateAxis(axis, 'EdgeEdge', i, j)) return null
    }
  }

  if (!bestType || !isFinite(bestDepth)) return null

  const normal = bestAxis.copy()
  if (vec3.dot(t, normal) < 0) normal.scale(-1)

  const collisions: Collision[] = []

  if (bestType === 'FaceA' || bestType === 'FaceB') {
    const refIsA = bestType === 'FaceA'
    const refAxes = refIsA ? axesA : axesB
    const refExt = refIsA ? extA : extB
    const refCenter = refIsA ? cA : cB

    const k = refIsA ? bestIndexA : bestIndexB
    const faceDirSign = vec3.dot(refAxes[k], normal) >= 0 ? +1 : -1
    const { faceCenter: refFaceCenter, t1, t2, e1, e2 } = getFaceCenterAndBasis(
      refCenter, refAxes, refExt, k, faceDirSign
    )

    const incAxes = refIsA ? axesB : axesA
    const incExt = refIsA ? extB : extA
    const incCenter = refIsA ? cB : cA

    let incFaceIndex = 0, minDot = Infinity
    for (let i = 0; i < 3; i++) {
      const d = vec3.dot(incAxes[i], normal)
      if (d < minDot) { minDot = d; incFaceIndex = i }
    }
    const incFaceSign = minDot > 0 ? -1 : +1
    const { faceCenter: incFaceCenter, t1: it1, t2: it2, e1: ie1, e2: ie2 } = getFaceCenterAndBasis(
      incCenter, incAxes, incExt, incFaceIndex, incFaceSign
    )

    let poly = getFaceVertices(incFaceCenter, it1, it2, ie1, ie2)

    const planeN1 = t1
    const planeN2 = vec3.scale(t1, -1, tmp())
    const planeN3 = t2
    const planeN4 = vec3.scale(t2, -1, tmp())

    const d1 = vec3.dot(planeN1, refFaceCenter) + e1
    const d2 = vec3.dot(planeN2, refFaceCenter) + e1
    const d3 = vec3.dot(planeN3, refFaceCenter) + e2
    const d4 = vec3.dot(planeN4, refFaceCenter) + e2

    poly = clipPolygonAgainstPlane(poly, planeN1, d1)
    poly = clipPolygonAgainstPlane(poly, planeN2, d2)
    poly = clipPolygonAgainstPlane(poly, planeN3, d3)
    poly = clipPolygonAgainstPlane(poly, planeN4, d4)

    if (poly.length === 0) return null

    const refPlaneD = vec3.dot(normal, refFaceCenter)

    for (const p of poly) {
      const penetration = refPlaneD - vec3.dot(normal, p)
      if (penetration >= -Epsilon) {
        const depth = Math.max(0, penetration)
        collisions.push({ contact: p.copy(), normal: normal.copy(), distance: depth })
      }
    }

    if (collisions.length === 0) {
      const centroid = poly.reduce((acc, v) => vec3.add(acc, v, acc), new vec3()).scale(1 / poly.length)
      const pen = refPlaneD - vec3.dot(normal, centroid)
      vec3.add(centroid, vec3.scale(normal, Math.max(0, pen), tmp()), centroid)
      collisions.push({ contact: centroid, normal: normal.copy(), distance: Math.max(0, pen) })
    }

    if (collisions.length > 4) collisions.length = 4
  } else {
    // --------- FIXED EDGE–EDGE CASE ----------
    const i = bestIndexA
    const j = bestIndexB

    const otherA: [number, number] = chooseFaceTangentIndices(i)
    const otherB: [number, number] = chooseFaceTangentIndices(j)

    const signA1 = signNonZero(vec3.dot(t, axesA[otherA[0]]), 1) as 1 | -1
    const signA2 = signNonZero(vec3.dot(t, axesA[otherA[1]]), 1) as 1 | -1
    const signB1 = -signNonZero(vec3.dot(t, axesB[otherB[0]]), 1) as 1 | -1
    const signB2 = -signNonZero(vec3.dot(t, axesB[otherB[1]]), 1) as 1 | -1

    const baseA = vec3.add(
      vec3.add(cA, vec3.scale(axesA[otherA[0]], extA[otherA[0]] * signA1, tmp()), tmp()),
      vec3.scale(axesA[otherA[1]], extA[otherA[1]] * signA2, tmp()),
      tmp()
    )
    const baseB = vec3.add(
      vec3.add(cB, vec3.scale(axesB[otherB[0]], extB[otherB[0]] * signB1, tmp()), tmp()),
      vec3.scale(axesB[otherB[1]], extB[otherB[1]] * signB2, tmp()),
      tmp()
    )

    const u = axesA[i].copy() // unit
    const v = axesB[j].copy() // unit
    const p0 = vec3.add(baseA, vec3.scale(u, -extA[i], tmp()), tmp())
    const q0 = vec3.add(baseB, vec3.scale(v, -extB[j], tmp()), tmp())

    const contact = closestPointBetweenSegmentsMidpoint(p0, u, extA[i], q0, v, extB[j])

    // Compute penetration against both boxes' reference planes along `normal`,
    // and take the smaller non-negative penetration.
    const penA = pointPenetrationAgainstBoxPlane(contact, normal, axesA, extA, cA)
    const penB = pointPenetrationAgainstBoxPlane(contact, vec3.scale(normal, -1, tmp()), axesB, extB, cB)
    // `penB` used a flipped normal to pick B's face toward A, but we report distance along `normal`.
    const depth = Math.max(0, Math.min(penA, penB))

    collisions.push({ contact, normal: normal.copy(), distance: depth })
  }

  return collisions.length > 0 ? collisions : null
}
