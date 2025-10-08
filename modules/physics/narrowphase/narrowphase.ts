import { Body } from '@luz/core'
import { Collider } from '../collider'
import { CollisionDispatcher } from '../dispatchers/collision'
import { CollisionManifold } from '../collision'

export class Narrowphase {
  static collisionDispatcher = new CollisionDispatcher()

  static calculateCollisionManifolds(
    bodyPairs: Array<[Body, Body]>,
    bodyColliderPairs: Array<[Body, Collider]>,
    infiniteBodyColliderPairs: Array<[Body, Collider]> = []
  ): CollisionManifold[] {
    const { dispatch } = Narrowphase.collisionDispatcher

    const collisionManifolds: CollisionManifold[] = []

    for (const [b1, b2] of bodyPairs) {
      if (b1 === b2) {
        continue
      }

      const collisions = dispatch(b1.volume, b2.volume)

      if (collisions && collisions.length > 0) {
        collisionManifolds.push({
          bodies: [b1, b2],
          collisions
        })
      }
    }

    for (const [body, collider] of bodyColliderPairs) {
      const collisions = dispatch(body.volume, collider)

      if (collisions && collisions.length > 0) {
        collisionManifolds.push({
          bodies: [body, null],
          collisions
        })
      }
    }

    for (const [body, collider] of infiniteBodyColliderPairs) {
      const collisions = dispatch(body.volume, collider)

      if (collisions && collisions.length > 0) {
        collisionManifolds.push({
          bodies: [body, null],
          collisions
        })
      }
    }

    return collisionManifolds
  }
}

