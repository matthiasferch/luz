import { vec3 } from '@luz/vectors'
import { Collision } from '../../collision'
import { Polygon } from '../../colliders/polygon'
import { Spheroid } from '../../volumes/spheroid'

const { min, max, sqrt } = Math

const findClosestPointOnEdge = (point: vec3, v1: vec3, v2: vec3) => {
  const e1 = vec3.subtract(v2, v1)
  const l2 = vec3.dot(e1, e1)

  if (l2 === 0) {
    return v1.copy()
  }

  const t = max(0, min(1, vec3.dot(vec3.subtract(point, v1), e1) / l2))

  return vec3.add(v1, vec3.scale(e1, t))
}

const findClosestPointOnPolygon = (point: vec3, polygon: Polygon) => {
  const [v1, v2, v3] = polygon.vertices

  const e1 = vec3.subtract(v2, v1)
  const e2 = vec3.subtract(v3, v1)

  const p = vec3.subtract(point, v1)

  const e1p = vec3.dot(e1, p)
  const e2p = vec3.dot(e2, p)

  const e1e1 = vec3.dot(e1, e1)
  const e1e2 = vec3.dot(e1, e2)
  const e2e2 = vec3.dot(e2, e2)

  const d = e1e1 * e2e2 - e1e2 * e1e2

  const u = (e2e2 * e1p - e1e2 * e2p) / d
  const v = (e1e1 * e2p - e1e2 * e1p) / d

  if (u >= 0 && v >= 0 && u + v <= 1) {
    return vec3.add(v1, vec3.scale(vec3.add(vec3.scale(e1, u), vec3.scale(e2, v)), 1))
  }

  const p1 = findClosestPointOnEdge(point, v1, v2)
  const p2 = findClosestPointOnEdge(point, v2, v3)
  const p3 = findClosestPointOnEdge(point, v3, v1)

  const d1 = vec3.dot(vec3.subtract(point, p1), vec3.subtract(point, p1))
  const d2 = vec3.dot(vec3.subtract(point, p2), vec3.subtract(point, p2))
  const d3 = vec3.dot(vec3.subtract(point, p3), vec3.subtract(point, p3))

  if (d1 < d2 && d1 < d3) {
    return p1
  }

  if (d2 < d3) {
    return p2
  }

  return p3
}

export const collidePolygonWithSpheroid = (polygon: Polygon, spheroid: Spheroid): Collision[] | null => {
  const center = spheroid.center
  const contact = findClosestPointOnPolygon(center, polygon)

  const dir = vec3.subtract(contact, center)
  const distance = sqrt(vec3.dot(dir, dir))

  // Determine effective radius in the direction towards the contact
  const direction = distance > 0 ? vec3.scale(dir, 1 / distance, new vec3()) : polygon.normal
  const r = spheroid.effectiveRadius(direction)

  if (distance <= r) {
    return [
      {
        contact,
        normal: polygon.normal.copy(),
        distance: r - distance
      }
    ]
  }

  return null
}

