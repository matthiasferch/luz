import { Collider } from '../collider'
import { BoundingBox } from './aabb'
import { Body } from '@luz/core'
import { vec3 } from '@luz/vectors'

// Broadphase work item: object with an associated bounding box.
export type BroadphaseEntry<T extends Body | Collider> = {
  item: T;
  bounds: BoundingBox
}

export type BroadphaseCache = {
  bodySorted: Array<BroadphaseEntry<Body>>
  finiteSorted: Array<BroadphaseEntry<Collider>>
  infinite: Collider[]
}

// Sweep-and-prune broadphase with descriptive method names.
export class Broadphase {
  // Find potentially overlapping pairs within a single set using sweep-and-prune (X-axis),
  // then validate with full 3D AABB overlap.
  static findCandidatePairs<T extends Body | Collider>(entries: Array<BroadphaseEntry<T>>): Array<[T, T]> {
    if (entries.length <= 1) {
      return []
    }

    const sortedEntries = entries.slice().sort((e1, e2) => {
      return e1.bounds.minimum.x - e2.bounds.minimum.x
    })

    const candidates: Array<BroadphaseEntry<T>> = []
    const collisionPairs: Array<[T, T]> = []

    for (const entry of sortedEntries) {
      for (let i = candidates.length - 1; i >= 0; i--) {
        if (candidates[i].bounds.maximum.x < entry.bounds.minimum.x) {
          candidates.splice(i, 1)
        }
      }

      for (const candidate of candidates) {
        if (BoundingBox.intersect(entry.bounds, candidate.bounds)) {
          collisionPairs.push([entry.item, candidate.item])
        }
      }

      candidates.push(entry)
    }

    return collisionPairs
  }

  // Find potentially overlapping cross-set pairs (A vs B) using sweep-and-prune (X-axis),
  // then validate with full 3D AABB overlap.
  static findCandidatePairsAcrossSets<A extends Body | Collider, B extends Body | Collider>(s1: Array<BroadphaseEntry<A>>, s2: Array<BroadphaseEntry<B>>): Array<[A, B]> {
    if (s1.length === 0 || s2.length === 0) {
      return []
    }

    const sortedA = s1.slice().sort((lhs, rhs) => lhs.bounds.minimum.x - rhs.bounds.minimum.x)
    const sortedB = s2.slice().sort((lhs, rhs) => lhs.bounds.minimum.x - rhs.bounds.minimum.x)

    const results: Array<[A, B]> = []
    const activeB: Array<BroadphaseEntry<B>> = []

    let bStart = 0

    for (const aEntry of sortedA) {
      while (bStart < sortedB.length && sortedB[bStart].bounds.minimum.x <= aEntry.bounds.maximum.x) {
        activeB.push(sortedB[bStart++])
      }

      for (let i = activeB.length - 1; i >= 0; i--) {
        if (activeB[i].bounds.maximum.x < aEntry.bounds.minimum.x) activeB.splice(i, 1)
      }

      for (const bEntry of activeB) {
        if (BoundingBox.intersect(aEntry.bounds, bEntry.bounds)) {
          results.push([aEntry.item, bEntry.item])
        }
      }
    }

    return results
  }

  // Build sorted broadphase caches for bodies and colliders
  static buildCache(
    bodies: Body[],
    colliders: Collider[]
  ): BroadphaseCache {
    const bodySorted: Array<BroadphaseEntry<Body>> = bodies
      .map((body) => ({ item: body, bounds: new BoundingBox(body.volume) }))
      .sort((a, b) => a.bounds.minimum.x - b.bounds.minimum.x)

    const finite: Array<BroadphaseEntry<Collider>> = []
    const infinite: Collider[] = []

    for (const c of colliders) {
      if (c.type === 'Plane') infinite.push(c)
      else finite.push({ item: c, bounds: new BoundingBox(c) })
    }

    const finiteSorted = finite.sort((a, b) => a.bounds.minimum.x - b.bounds.minimum.x)

    return { bodySorted, finiteSorted, infinite }
  }

  // Stable per-pair normal orientation (shared by both solvers)
  static orientNormalForPair(
    nIn: vec3,
    contact: vec3,
    b1: Body,
    b2: Body | null
  ): vec3 {
    const n = nIn.copy()
    const r1 = vec3.subtract(contact, b1.volume.center, new vec3())
    if (b2) {
      const c12 = vec3.subtract(b2.volume.center, b1.volume.center, new vec3())
      if (vec3.dot(n, c12) < 0) n.scale(-1)
    } else {
      if (vec3.dot(n, r1) < 0) n.scale(-1)
    }
    return n
  }
}
