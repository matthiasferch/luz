import { BoundingBox } from '@luz/core'
import type { Collider } from '../collider'
import { isPlane } from '../colliders/plane'
import { isRay } from '../colliders/ray'
import { calculateColliderBoundingBox } from './collider-bounding-box'
import type { Body } from '../components/body'

export interface BroadphaseEntry<T extends Body | Collider> {
  item: T
  boundingBox: BoundingBox
}

export interface BroadphaseCache {
  bodies: Array<BroadphaseEntry<Body>>
  finiteColliders: Array<BroadphaseEntry<Collider>>
  infiniteColliders: Collider[]
}

export const isFiniteCollider = (collider: Collider) => {
  return !isRay(collider) && !isPlane(collider)
}

export class Broadphase {
  static findCollisionCandidates<T extends Body | Collider>(entries: Array<BroadphaseEntry<T>>): Array<[T, T]> {
    if (entries.length <= 1) {
      return []
    }

    const sortedEntries = entries.slice().sort((firstEntry, secondEntry) => {
      return firstEntry.boundingBox.minimum.x - secondEntry.boundingBox.minimum.x
    })

    const candidates: Array<BroadphaseEntry<T>> = []
    const collisionPairs: Array<[T, T]> = []

    for (const entry of sortedEntries) {
      for (let index = candidates.length - 1; index >= 0; index--) {
        if (candidates[index].boundingBox.maximum.x < entry.boundingBox.minimum.x) {
          candidates.splice(index, 1)
        }
      }

      for (const candidate of candidates) {
        if (BoundingBox.intersects(entry.boundingBox, candidate.boundingBox)) {
          collisionPairs.push([entry.item, candidate.item])
        }
      }

      candidates.push(entry)
    }

    return collisionPairs
  }

  static findCollisionCandidatesAcrossSets<T extends Body | Collider, S extends Body | Collider>(
    firstEntries: Array<BroadphaseEntry<T>>,
    secondEntries: Array<BroadphaseEntry<S>>
  ): Array<[T, S]> {
    if (firstEntries.length === 0 || secondEntries.length === 0) {
      return []
    }

    const firstSortedEntries = firstEntries.slice().sort((firstEntry, secondEntry) => {
      return firstEntry.boundingBox.minimum.x - secondEntry.boundingBox.minimum.x
    })

    const secondSortedSet = secondEntries.slice().sort((firstEntry, secondEntry) => {
      return firstEntry.boundingBox.minimum.x - secondEntry.boundingBox.minimum.x
    })

    const collisionPairs: Array<[T, S]> = []
    const broadphaseEntries: Array<BroadphaseEntry<S>> = []

    let secondEntryIndex = 0

    for (const firstEntry of firstSortedEntries) {
      while (
        secondEntryIndex < secondSortedSet.length &&
        secondSortedSet[secondEntryIndex].boundingBox.minimum.x <= firstEntry.boundingBox.maximum.x
      ) {
        broadphaseEntries.push(secondSortedSet[secondEntryIndex++])
      }

      for (let candidateIndex = broadphaseEntries.length - 1; candidateIndex >= 0; candidateIndex--) {
        if (broadphaseEntries[candidateIndex].boundingBox.maximum.x < firstEntry.boundingBox.minimum.x) {
          broadphaseEntries.splice(candidateIndex, 1)
        }
      }

      for (const secondEntry of broadphaseEntries) {
        if (BoundingBox.intersects(firstEntry.boundingBox, secondEntry.boundingBox)) {
          collisionPairs.push([firstEntry.item, secondEntry.item])
        }
      }
    }

    return collisionPairs
  }

  static createCache(
    bodies: Body[],
    colliders: Collider[],
    destination: BroadphaseCache = { bodies: [], finiteColliders: [], infiniteColliders: [] }
  ): BroadphaseCache {
    bodies.forEach((body, index) => {
      const entry = destination.bodies[index]

      if (entry) {
        entry.item = body

        calculateColliderBoundingBox(body.volume, entry.boundingBox)
      } else {
        destination.bodies[index] = { item: body, boundingBox: calculateColliderBoundingBox(body.volume) }
      }
    })

    destination.bodies.length = bodies.length

    destination.bodies.sort(
      (firstEntry, secondEntry) => firstEntry.boundingBox.minimum.x - secondEntry.boundingBox.minimum.x
    )

    let finiteColliderCount = 0
    let infiniteColliderCount = 0

    for (const collider of colliders) {
      if (isFiniteCollider(collider)) {
        const entry = destination.finiteColliders[finiteColliderCount]

        if (entry) {
          entry.item = collider

          calculateColliderBoundingBox(collider, entry.boundingBox)
        } else {
          destination.finiteColliders[finiteColliderCount] = {
            item: collider,
            boundingBox: calculateColliderBoundingBox(collider)
          }
        }

        finiteColliderCount++

        continue
      }

      destination.infiniteColliders[infiniteColliderCount++] = collider
    }

    destination.finiteColliders.length = finiteColliderCount
    destination.infiniteColliders.length = infiniteColliderCount

    destination.finiteColliders.sort((firstCollider, secondCollider) => {
      return firstCollider.boundingBox.minimum.x - secondCollider.boundingBox.minimum.x
    })

    return destination
  }
}
