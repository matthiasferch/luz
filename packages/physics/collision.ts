import type { Body } from './components/body'
import { Vector3 } from '@luz/math'

const collisionDistanceEpsilon = 1e-4
const collisionContactEpsilon = 1e-3
const maximumManifoldContacts = 4
const collisionIdPrecision = 100

export type ContactType = 'point' | 'line' | 'patch'

export interface Collision {
  id?: string

  // World-space normal from the first collider toward the second.
  normal: Vector3
  point: Vector3

  // World units.
  penetrationDepth: number
  featureId?: string
  isRestingContact?: boolean
  contactType?: ContactType
}

export interface CollisionManifold {
  readonly id?: string
  readonly bodies: readonly [Body, Body | null]
  readonly collisions: readonly Collision[]
  readonly isRestingContact?: boolean
  readonly contactType?: ContactType
  readonly featureId?: string
  readonly featurePairId?: string
}

const quantizeCollisionValue = (value: number) => {
  return Math.round(value * collisionIdPrecision) / collisionIdPrecision
}

export const createCollisionId = (collision: Pick<Collision, 'point' | 'normal' | 'penetrationDepth'>) => {
  const { point, normal, penetrationDepth } = collision

  return [
    quantizeCollisionValue(point.x),
    quantizeCollisionValue(point.y),
    quantizeCollisionValue(point.z),
    quantizeCollisionValue(normal.x),
    quantizeCollisionValue(normal.y),
    quantizeCollisionValue(normal.z),
    quantizeCollisionValue(penetrationDepth)
  ].join(':')
}

const areContactsEquivalent = (firstCollision: Collision, secondCollision: Collision) => {
  return (
    Vector3.subtract(firstCollision.point, secondCollision.point, new Vector3()).magnitude <= collisionContactEpsilon &&
    Math.abs(firstCollision.penetrationDepth - secondCollision.penetrationDepth) <= collisionDistanceEpsilon
  )
}

const compareContacts = (firstCollision: Collision, secondCollision: Collision) => {
  if (Math.abs(secondCollision.penetrationDepth - firstCollision.penetrationDepth) > collisionDistanceEpsilon) {
    return secondCollision.penetrationDepth - firstCollision.penetrationDepth
  }

  if (Math.abs(firstCollision.point.y - secondCollision.point.y) > collisionContactEpsilon) {
    return secondCollision.point.y - firstCollision.point.y
  }

  if (Math.abs(firstCollision.point.x - secondCollision.point.x) > collisionContactEpsilon) {
    return firstCollision.point.x - secondCollision.point.x
  }

  return firstCollision.point.z - secondCollision.point.z
}

export const normalizeCollisions = (collisions: Collision[]): Collision[] => {
  const uniqueCollisions: Collision[] = []

  collisions
    .filter(({ penetrationDepth }) => penetrationDepth >= -collisionDistanceEpsilon)
    .map((collision) => {
      const normalizedCollision = {
        point: collision.point.clone(),
        normal: collision.normal.clone(),
        penetrationDepth: Math.max(0, collision.penetrationDepth),
        featureId: collision.featureId,
        isRestingContact: collision.isRestingContact,
        contactType: collision.contactType
      }

      return {
        id: createCollisionId(normalizedCollision),
        ...normalizedCollision
      }
    })
    .sort(compareContacts)
    .forEach((collision) => {
      if (!uniqueCollisions.some((existingCollision) => areContactsEquivalent(existingCollision, collision))) {
        uniqueCollisions.push(collision)
      }
    })

  const contacts = uniqueCollisions.slice(0, maximumManifoldContacts)
  const used = new Set<string>()

  contacts.forEach((contact) => {
    const base = contact.id

    let index = 1

    while (used.has(contact.id!)) {
      contact.id = `${base}:${index++}`
    }

    used.add(contact.id!)
  })

  return contacts
}
