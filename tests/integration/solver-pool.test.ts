import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import { Body, CollisionSolver, Cuboid } from '@luz/physics'
import type { CollisionManifold } from '@luz/physics'
import { Pool } from '@luz/serialization'

const createContact = () => {
  const entity = new Entity()
  const body = new Body()

  entity.translation.set([0, 1, 0])

  body.volume = new Cuboid()
  body.friction = 0.5
  body.restitution = 0

  body.applyTransform(entity)
  body.linearVelocity.set([2, -1, 0.3])

  const manifold: CollisionManifold = {
    id: 'floor',

    bodies: [body, null],
    collisions: [{ normal: Vector3.createDown(), point: new Vector3([0.4, 0, 0.2]), penetrationDepth: 0.1 }]
  }

  return { body, entity, manifold }
}

describe('Collision solver pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredObjects = new Set<unknown>()
  const borrowedObjects = new Set<unknown>()

  beforeEach(() => {
    acquiredObjects.clear()
    borrowedObjects.clear()

    Pool.prototype.acquire = function () {
      const object = acquireObject.call(this)

      expect(borrowedObjects.has(object)).to.equal(false)
      acquiredObjects.add(object)
      borrowedObjects.add(object)

      return object
    }
    Pool.prototype.release = function (object) {
      expect(borrowedObjects.delete(object)).to.equal(true)
      releaseObject.call(this, object)
    }
  })
  afterEach(() => {
    Pool.prototype.acquire = acquireObject
    Pool.prototype.release = releaseObject
  })
  it('reuses scratch objects across contacts and iterations without retaining borrowed state', () => {
    const solver = new CollisionSolver()
    const contacts = Array.from({ length: 32 }, createContact)
    const solveContacts = (manifolds: CollisionManifold[]) => {
      solver.beginVelocityFrame()

      for (let iteration = 0; iteration < 8; iteration++) {
        solver.solveVelocities(manifolds, 1 / 60, true)
        solver.solvePositions(manifolds)
        expect(borrowedObjects.size).to.equal(0)
      }

      solver.endVelocityFrame()
    }

    solveContacts([contacts[0].manifold])

    const objectCount = acquiredObjects.size

    expect(objectCount).to.be.greaterThan(0)
    expect([...acquiredObjects].some((object) => object instanceof Quaternion)).to.equal(true)
    solveContacts(contacts.map(({ manifold }) => manifold))
    expect(acquiredObjects.size).to.equal(objectCount)

    for (const { body, entity, manifold } of contacts) {
      const { normal, point: contact } = manifold.collisions[0]

      expect(normal.xyz).to.deep.equal([0, -1, 0])
      expect(contact.xyz).to.deep.equal(new Vector3([0.4, 0, 0.2]).xyz)

      for (const vector of [normal, contact, body.linearVelocity, body.angularVelocity, entity.translation]) {
        expect(acquiredObjects.has(vector)).to.equal(false)
        expect([...vector].every(Number.isFinite)).to.equal(true)
      }

      expect(acquiredObjects.has(entity.rotation)).to.equal(false)
      expect(entity.translation.y).to.be.greaterThan(1)
    }
  })
  it('preserves cached impulses and local anchors across frames and intervening contacts', () => {
    const solver = new CollisionSolver()
    const contacts = Array.from({ length: 8 }, createContact)
    const manifolds = contacts.map(({ body, manifold }) => {
      body.friction = 0

      manifold.collisions[0].point.set([0, 0, 0])

      return manifold
    })

    for (const speed of [-10, -0.1, 0]) {
      for (const { body } of contacts) {
        body.linearVelocity.set([0, speed, 0])
        body.angularVelocity.reset()
      }

      solver.beginVelocityFrame()

      for (let iteration = 0; iteration < 8; iteration++) {
        solver.solveVelocities(manifolds, 1 / 60, true)
      }

      solver.endVelocityFrame()
      expect(borrowedObjects.size).to.equal(0)

      for (const { body } of contacts) {
        expect(body.linearVelocity.magnitude).to.be.lessThan(1e-5)
        expect(body.angularVelocity.magnitude).to.be.lessThan(1e-5)
      }
    }

    expect(solver.contactPersistence).to.deep.equal(Array(8).fill(3))
  })
  it('releases scratch vectors when contact preparation throws', () => {
    const solver = new CollisionSolver()
    const { body, manifold } = createContact()
    const getInverseMass = Object.getOwnPropertyDescriptor(Body.prototype, 'inverseMass')!.get!

    Object.defineProperty(body, 'inverseMass', {
      configurable: true,
      get: () => {
        throw new Error('contact preparation failed')
      }
    })
    expect(() => solver.solveVelocities([manifold], 1 / 60)).to.throw('contact preparation failed')
    expect(acquiredObjects.size).to.be.greaterThan(0)
    expect(borrowedObjects.size).to.equal(0)
    Object.defineProperty(body, 'inverseMass', { configurable: true, get: getInverseMass })
    solver.beginVelocityFrame()
    solver.solveVelocities([manifold], 1 / 60)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('releases vectors and quaternions when applying a rotation throws', () => {
    const solver = new CollisionSolver()
    const { body, manifold } = createContact()

    body.applyRotationCorrection = () => {
      throw new Error('rotation correction failed')
    }

    expect(() => solver.solvePositions([manifold])).to.throw('rotation correction failed')
    expect([...acquiredObjects].some((object) => object instanceof Quaternion)).to.equal(true)
    expect(borrowedObjects.size).to.equal(0)

    body.applyRotationCorrection = Body.prototype.applyRotationCorrection

    expect(solver.solvePositions([manifold])).to.equal(true)
    expect(borrowedObjects.size).to.equal(0)
  })
  it('keeps an outer correction intact during a nested solve on the same solver', () => {
    const solver = new CollisionSolver()
    const outerContact = createContact()
    const nestedContact = createContact()
    const applyPositionCorrection = outerContact.body.applyPositionCorrection

    outerContact.body.applyPositionCorrection = (correction) => {
      const snapshot = correction.xyz
      const outerObjects = new Set(borrowedObjects)

      expect(solver.solvePositions([nestedContact.manifold])).to.equal(true)
      expect(borrowedObjects).to.deep.equal(outerObjects)
      expect(correction.xyz).to.deep.equal(snapshot)
      applyPositionCorrection.call(outerContact.body, correction)
    }

    expect(solver.solvePositions([outerContact.manifold])).to.equal(true)
    expect(borrowedObjects.size).to.equal(0)
    expect(outerContact.entity.translation.xyz).to.deep.equal(nestedContact.entity.translation.xyz)
    expect([...outerContact.entity.rotation]).to.deep.equal([...nestedContact.entity.rotation])
  })
  it('preserves moving support velocity through pool reuse and the contact grace period', () => {
    const solver = new CollisionSolver()
    const { body, manifold: initialManifold } = createContact()
    const platform = createContact().body
    const manifold: CollisionManifold = { ...initialManifold, bodies: [body, platform] }

    platform.motionType = 'kinematic'

    body.linearVelocity.reset()
    platform.linearVelocity.set([1, 0, 0])
    solver.finishStep([manifold], [body, platform], 1 / 60)
    platform.linearVelocity.reset()

    for (let frame = 0; frame < 40; frame++) {
      solver.finishStep([], [body, platform], 0.001, solver.collectStaticSupportBodies([manifold]))
    }

    expect(borrowedObjects.size).to.equal(0)
    expect(body.sleepFrames).to.equal(0)
    expect(body.isSleeping).to.equal(false)
    solver.finishStep([], [body, platform], 0.02, solver.collectStaticSupportBodies([manifold]))
    expect(body.sleepFrames).to.equal(1)
  })
})
