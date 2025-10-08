import { Collider } from '../collider'
import { BoundingBox } from './bounding-box'
import { Body } from '@luz/core'
import { vec3 } from '@luz/vectors'

export type BroadphaseEntry<T extends Body | Collider> = {
  item: T;
  bounds: BoundingBox
}

export type BroadphaseCache = {
  bodies: Array<BroadphaseEntry<Body>>
  finiteColliders: Array<BroadphaseEntry<Collider>>
  infiniteColliders: Collider[]
}

export const isFiniteCollider = (collider: Collider) => {
  return collider.type !== 'Plane'
}

export class Broadphase {
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

  static findCandidatePairsAcrossSets<T extends Body | Collider, S extends Body | Collider>(s1: Array<BroadphaseEntry<T>>, s2: Array<BroadphaseEntry<S>>): Array<[T, S]> {
    if (s1.length === 0 || s2.length === 0) {
      return []
    }

    const firstSortedSet = s1.slice().sort((e1, e2) => {
      return e1.bounds.minimum.x - e2.bounds.minimum.x
    })

    const otherSortedSet = s2.slice().sort((e1, e2) => {
      return e1.bounds.minimum.x - e2.bounds.minimum.x
    })

    const collisionPairs: Array<[T, S]> = []
    const broadphaseEntries: Array<BroadphaseEntry<S>> = []

    let i1 = 0

    for (const e1 of firstSortedSet) {
      while (i1 < otherSortedSet.length && otherSortedSet[i1].bounds.minimum.x <= e1.bounds.maximum.x) {
        broadphaseEntries.push(otherSortedSet[i1++])
      }

      for (let i2 = broadphaseEntries.length - 1; i2 >= 0; i2--) {
        if (broadphaseEntries[i2].bounds.maximum.x < e1.bounds.minimum.x) broadphaseEntries.splice(i2, 1)
      }

      for (const e2 of broadphaseEntries) {
        if (BoundingBox.intersect(e1.bounds, e2.bounds)) {
          collisionPairs.push([e1.item, e2.item])
        }
      }
    }

    return collisionPairs
  }

  static buildCache(bodies: Body[], colliders: Collider[]): BroadphaseCache {
    const sortedBodies: Array<BroadphaseEntry<Body>> = bodies
      .map((body) => ({
        item: body,
        bounds: new BoundingBox(body.volume)
      }))
      .sort((e1, e2) => {
        return e1.bounds.minimum.x - e2.bounds.minimum.x
      })

    const finiteColliders: Array<BroadphaseEntry<Collider>> = []
    const infiniteColliders: Collider[] = []

    for (const collider of colliders) {
      if (isFiniteCollider(collider)) {
        finiteColliders.push({
          item: collider,
          bounds: new BoundingBox(collider)
        })

        continue
      }

      infiniteColliders.push(collider)
    }

    const sortedFiniteColliders = finiteColliders.sort((a, b) => {
      return a.bounds.minimum.x - b.bounds.minimum.x
    })

    return {
      bodies: sortedBodies,
      finiteColliders: sortedFiniteColliders,
      infiniteColliders
    }
  }

  static orientNormalForPair(normal: vec3, contact: vec3, b1: Body, b2: Body | null): vec3 {
    const orientedNormal = normal.copy()
    const contactOffset = vec3.subtract(contact, b1.volume.center, new vec3())

    if (b2) {
      const centerOffset = vec3.subtract(b2.volume.center, b1.volume.center, new vec3())

      if (vec3.dot(orientedNormal, centerOffset) < 0) {
        orientedNormal.scale(-1)
      }
    } else {
      if (vec3.dot(orientedNormal, contactOffset) < 0) {
        orientedNormal.scale(-1)
      }
    }

    return orientedNormal
  }
}
