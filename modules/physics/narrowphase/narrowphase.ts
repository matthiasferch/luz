import { Body } from '@luz/core'
import { Collider } from '../collider'
import { CollisionDispatcher } from '../dispatchers/collision'
import { CollisionManifold } from '../collision'

export class Narrowphase {
  static computeManifoldsForPairs(
    dispatcher: CollisionDispatcher,
    bodyPairs: Array<[Body, Body]>,
    bodyColliderPairs: Array<[Body, Collider]>,
    infiniteBodyColliderPairs: Array<[Body, Collider]> = []
  ): CollisionManifold[] {
    const manifolds: CollisionManifold[] = []

    for (const [b1, b2] of bodyPairs) {
      if (b1 === b2) continue
      const collisions = dispatcher.dispatch(b1.volume, (b2 as Body).volume)
      if (collisions && collisions.length > 0) {
        manifolds.push({ bodies: [b1, b2], collisions })
      }
    }

    for (const [b, c] of bodyColliderPairs) {
      const collisions = dispatcher.dispatch(b.volume, c)
      if (collisions && collisions.length > 0) {
        manifolds.push({ bodies: [b, null], collisions })
      }
    }

    for (const [b, c] of infiniteBodyColliderPairs) {
      const collisions = dispatcher.dispatch(b.volume, c)
      if (collisions && collisions.length > 0) {
        manifolds.push({ bodies: [b, null], collisions })
      }
    }

    return manifolds
  }
}

