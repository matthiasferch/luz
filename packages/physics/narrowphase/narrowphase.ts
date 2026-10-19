import { Body } from '../components/body'
import type { Collider } from '../collider'
import { CollisionDispatcher } from '../dispatchers/collision'
import type { Collision, CollisionManifold, ContactType } from '../collision'
import { normalizeCollisions } from '../collision'
import type { Cuboid } from '../volumes/cuboid'
import { isCuboid } from '../volumes/cuboid'
import { Vector3 } from '@luz/math'

export interface CollisionCandidates {
  bodyPairs: Array<[Body, Body]>
  finiteBodyColliderPairs: Array<[Body, Collider]>
  infiniteBodyColliderPairs: Array<[Body, Collider]>
}

export class Narrowphase {
  static collisionDispatcher = new CollisionDispatcher()

  private static objectIds: WeakMap<object, number> = new WeakMap()
  private static nextObjectId = 1

  private static resolveObjectId(target: object) {
    const existingId = Narrowphase.objectIds.get(target)

    if (existingId) {
      return existingId
    }

    const id = Narrowphase.nextObjectId++

    Narrowphase.objectIds.set(target, id)

    return id
  }

  private static createManifoldId(firstBody: Body, secondObject: Body | Collider) {
    const firstId = Narrowphase.resolveObjectId(firstBody)
    const secondId = Narrowphase.resolveObjectId(secondObject)
    const [lowerId, higherId] = firstId < secondId ? [firstId, secondId] : [secondId, firstId]

    return `manifold:${lowerId}:${higherId}`
  }

  private static findSharedContactType(collisions: Collision[]): ContactType | undefined {
    const [firstCollision] = collisions

    if (!firstCollision?.contactType) {
      return undefined
    }

    return collisions.every(({ contactType }) => contactType === firstCollision.contactType)
      ? firstCollision.contactType
      : undefined
  }

  private static findSharedRestingContact(collisions: Collision[]): boolean | undefined {
    const [firstCollision] = collisions

    if (typeof firstCollision?.isRestingContact !== 'boolean') {
      return undefined
    }

    return collisions.every(({ isRestingContact }) => isRestingContact === firstCollision.isRestingContact)
      ? firstCollision.isRestingContact
      : undefined
  }

  private static findSharedFeatureId(collisions: Collision[]): string | undefined {
    const [firstCollision] = collisions

    if (!firstCollision?.featureId) {
      return undefined
    }

    return collisions.every(({ featureId }) => featureId === firstCollision.featureId)
      ? firstCollision.featureId
      : undefined
  }

  private static createSurfaceFeatureId(target: Body | Collider | null) {
    if (!target) {
      return undefined
    }

    if (target instanceof Body) {
      return `${target.volume.type.toLowerCase()}:surface`
    }

    if (target.type === 'plane' || target.type === 'polygon') {
      return `${target.type.toLowerCase()}:face`
    }

    return `${target.type.toLowerCase()}:surface`
  }

  private static findSharedCuboidVertexFace(collisions: Collision[]) {
    const vertexSignPattern = /^cuboid:vertex:([+-][xyz]):([+-][xyz]):([+-][xyz])$/
    const vertexSigns = collisions.map(({ featureId }) => featureId?.match(vertexSignPattern)?.slice(1))

    if (vertexSigns.some((signs) => !signs)) {
      return undefined
    }

    for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
      const firstSign = vertexSigns[0]![axisIndex]

      if (vertexSigns.every((signs) => signs![axisIndex] === firstSign)) {
        return `cuboid:face:${firstSign}`
      }
    }

    return undefined
  }

  private static findSharedCuboidFacePatch(collisions: Collision[]) {
    const facePattern = /^(cuboid:[ab]:face:[+-][xyz]):patch:/
    const [firstCollision] = collisions
    const face = firstCollision?.featureId?.match(facePattern)?.[1]

    if (!face) {
      return undefined
    }

    return collisions.every(({ featureId }) => featureId?.startsWith(`${face}:patch:`)) ? face : undefined
  }

  private static createCuboidFaceFeatureId(cuboid: Cuboid, owner: 'a' | 'b', worldNormal: Vector3) {
    const axisLabels = ['x', 'y', 'z']

    let bestAxisIndex = 0
    let bestAlignment = -Infinity

    for (let axisIndex = 0; axisIndex < 3; axisIndex++) {
      const alignment = Math.abs(Vector3.calculateDotProduct(cuboid.axes[axisIndex], worldNormal))

      if (alignment > bestAlignment) {
        bestAlignment = alignment
        bestAxisIndex = axisIndex
      }
    }

    const sign = Vector3.calculateDotProduct(cuboid.axes[bestAxisIndex], worldNormal) >= 0 ? '+' : '-'

    return `cuboid:${owner}:face:${sign}${axisLabels[bestAxisIndex]}`
  }

  private static assignCanonicalBodyOwners(body: Body, otherBody: Body): Record<'a' | 'b', 'a' | 'b'> {
    const bodyId = Narrowphase.resolveObjectId(body)
    const otherBodyId = Narrowphase.resolveObjectId(otherBody)

    return bodyId <= otherBodyId ? { a: 'a', b: 'b' } : { a: 'b', b: 'a' }
  }

  private static createCuboidFacePairFeatureId(body: Body, otherBody: Body | null, collisions: Collision[]) {
    if (!otherBody || !isCuboid(body.volume) || !isCuboid(otherBody.volume)) {
      return undefined
    }

    const bodyVolume = body.volume
    const otherBodyVolume = otherBody.volume
    const canonicalOwners = Narrowphase.assignCanonicalBodyOwners(body, otherBody)
    const sharedFace = Narrowphase.findSharedCuboidFacePatch(collisions)
    const match = sharedFace?.match(/^cuboid:([ab]):face:[+-][xyz]$/)
    const [firstCollision] = collisions

    if (!match || !firstCollision) {
      return undefined
    }

    const referenceOwner = match[1] as 'a' | 'b'
    const incidentOwner = referenceOwner === 'a' ? 'b' : 'a'
    const incidentVolume = referenceOwner === 'a' ? otherBodyVolume : bodyVolume
    const canonicalReferenceOwner = canonicalOwners[referenceOwner]
    const canonicalIncidentOwner = canonicalOwners[incidentOwner]
    const canonicalSharedFace = sharedFace!.replace(/^cuboid:[ab]:/, `cuboid:${canonicalReferenceOwner}:`)
    const incidentNormal =
      referenceOwner === 'a' ? Vector3.scale(firstCollision.normal, -1, new Vector3()) : firstCollision.normal
    const incidentFeatureId = Narrowphase.createCuboidFaceFeatureId(
      incidentVolume,
      canonicalIncidentOwner,
      incidentNormal
    )

    return canonicalReferenceOwner === 'a'
      ? `${canonicalSharedFace}|${incidentFeatureId}`
      : `${incidentFeatureId}|${canonicalSharedFace}`
  }

  private static findSharedCylinderFeature(collisions: Collision[]) {
    const [firstCollision] = collisions

    if (firstCollision?.featureId?.startsWith('cylinder:cap:')) {
      const cap = firstCollision.featureId.match(/^(cylinder:cap:[+-]axis):radial:/)?.[1]

      return cap && collisions.every(({ featureId }) => featureId?.startsWith(`${cap}:radial:`)) ? cap : undefined
    }

    if (
      firstCollision?.featureId?.startsWith('cylinder:side-line:') &&
      collisions.every(({ featureId }) => featureId?.startsWith('cylinder:side-line:'))
    ) {
      return 'cylinder:side-line'
    }

    return undefined
  }

  private static createFeaturePairId(
    body: Body,
    otherParticipant: Body | Collider,
    otherBody: Body | null,
    collisions: Collision[]
  ) {
    const sharedFeatureId = Narrowphase.findSharedFeatureId(collisions)

    if (sharedFeatureId) {
      return `${sharedFeatureId}|${Narrowphase.createSurfaceFeatureId(otherParticipant) ?? 'contact'}`
    }

    const cuboidFacePairFeatureId = Narrowphase.createCuboidFacePairFeatureId(body, otherBody, collisions)

    if (cuboidFacePairFeatureId) {
      return cuboidFacePairFeatureId
    }

    const bodyFeatureId =
      Narrowphase.findSharedCuboidVertexFace(collisions) ??
      Narrowphase.findSharedCuboidFacePatch(collisions) ??
      Narrowphase.findSharedCylinderFeature(collisions)

    if (!bodyFeatureId) {
      return undefined
    }

    return `${bodyFeatureId}|${Narrowphase.createSurfaceFeatureId(otherBody ?? otherParticipant) ?? 'contact'}`
  }

  private static createCollisionManifold(
    body: Body,
    otherParticipant: Body | Collider,
    otherBody: Body | null,
    collisions: Collision[]
  ): CollisionManifold {
    return {
      id: Narrowphase.createManifoldId(body, otherParticipant),
      bodies: [body, otherBody],
      collisions,
      isRestingContact: Narrowphase.findSharedRestingContact(collisions),
      contactType: Narrowphase.findSharedContactType(collisions),
      featureId: Narrowphase.findSharedFeatureId(collisions),
      featurePairId: Narrowphase.createFeaturePairId(body, otherParticipant, otherBody, collisions)
    }
  }

  static calculateCollisionManifolds(candidates: CollisionCandidates): CollisionManifold[] {
    const { bodyPairs, finiteBodyColliderPairs, infiniteBodyColliderPairs } = candidates

    const collisionManifolds: CollisionManifold[] = []

    for (const [b1, b2] of bodyPairs) {
      if (b1 === b2) {
        continue
      }

      const collisions = Narrowphase.collisionDispatcher.detectCollisions(b1.volume, b2.volume)
      const normalizedCollisions = collisions ? normalizeCollisions(collisions) : null

      if (normalizedCollisions && normalizedCollisions.length > 0) {
        collisionManifolds.push(Narrowphase.createCollisionManifold(b1, b2, b2, normalizedCollisions))
      }
    }

    for (const [body, collider] of finiteBodyColliderPairs) {
      const collisions = Narrowphase.collisionDispatcher.detectCollisions(body.volume, collider)
      const normalizedCollisions = collisions ? normalizeCollisions(collisions) : null

      if (normalizedCollisions && normalizedCollisions.length > 0) {
        collisionManifolds.push(Narrowphase.createCollisionManifold(body, collider, null, normalizedCollisions))
      }
    }

    for (const [body, collider] of infiniteBodyColliderPairs) {
      const collisions = Narrowphase.collisionDispatcher.detectCollisions(body.volume, collider)
      const normalizedCollisions = collisions ? normalizeCollisions(collisions) : null

      if (normalizedCollisions && normalizedCollisions.length > 0) {
        collisionManifolds.push(Narrowphase.createCollisionManifold(body, collider, null, normalizedCollisions))
      }
    }

    return collisionManifolds
  }
}
