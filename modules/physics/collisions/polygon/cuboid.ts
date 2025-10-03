import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Cuboid } from '../../volumes/cuboid'
import { Polygon } from '../../colliders/polygon'

const EPS = 1e-6
const CONTACT_SLOP = 1e-3

const buildPlaneBasis = (n: vec3): { t1: vec3; t2: vec3 } => {
  const up = Math.abs(n.z) < 0.999 ? new vec3([0, 0, 1]) : new vec3([0, 1, 0])
  const t1 = vec3.cross(up, n, new vec3()).normalize()
  const t2 = vec3.cross(n, t1, new vec3()).normalize()
  return { t1, t2 }
}

const projectTo2D = (p: vec3, p0: vec3, t1: vec3, t2: vec3) => {
  const d = vec3.subtract(p, p0, new vec3())
  return { x: vec3.dot(d, t1), y: vec3.dot(d, t2) }
}

const pointInPolygon2D = (pt: { x: number; y: number }, poly: { x: number; y: number }[]) => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y
    const xj = poly[j].x, yj = poly[j].y
    const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
      (pt.x < ((xj - xi) * (pt.y - yi)) / ((yj - yi) || EPS) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export function collidePolygonWithCuboid(polygon: Polygon, cuboid: Cuboid): Collision[] | null {
  const collisions: Collision[] = []

  const n = polygon.normal.copy().normalize()
  const p0 = polygon.vertices[0]
  const planeD = vec3.dot(n, p0)

  const { t1, t2 } = buildPlaneBasis(n)
  const poly2D = polygon.vertices.map(v => projectTo2D(v, p0, t1, t2))

  const verts = cuboid.getVertices()

  // 1) Penetrating vertices -> project contact to plane, keep positive depth
  for (const v of verts) {
    const signed = vec3.dot(n, v) - planeD   // <0 means v is "behind" plane w.r.t n
    const depth = Math.max(0, -signed)
    if (depth > CONTACT_SLOP) {
      const proj2D = projectTo2D(v, p0, t1, t2)
      if (pointInPolygon2D(proj2D, poly2D)) {
        // contact point is v projected onto the plane
        const contactOnPlane = vec3.add(v, vec3.scale(n, -signed, new vec3()), new vec3())
        collisions.push({ contact: contactOnPlane, normal: n.copy(), distance: depth })
      }
    }
  }

  // 2) Edge–plane intersections (touching)
  const edges = cuboid.getEdges()
  for (const [i1, i2] of edges) {
    const v1 = verts[i1], v2 = verts[i2]
    const d1 = vec3.dot(n, v1) - planeD
    const d2 = vec3.dot(n, v2) - planeD

    if ((d1 > CONTACT_SLOP && d2 < -CONTACT_SLOP) || (d1 < -CONTACT_SLOP && d2 > CONTACT_SLOP) ||
      (Math.abs(d1) <= CONTACT_SLOP && Math.abs(d2) <= CONTACT_SLOP)) {
      const edge = vec3.subtract(v2, v1, new vec3())
      const denom = vec3.dot(n, edge)
      if (Math.abs(denom) > EPS) {
        const t = (planeD - vec3.dot(n, v1)) / denom
        if (t >= -EPS && t <= 1 + EPS) {
          const hit = vec3.add(v1, vec3.scale(edge, t, new vec3()), new vec3())
          const proj2D = projectTo2D(hit, p0, t1, t2)
          if (pointInPolygon2D(proj2D, poly2D)) {
            collisions.push({ contact: hit, normal: n.copy(), distance: 0 })
          }
        }
      }
    }
  }

  return collisions.length > 0 ? collisions : null
}
