import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Vector3 } from '@luz/math'
import { Body, Cuboid, PhysicsWorld, Plane, Sphere } from '@luz/physics'
import type { Collider } from '@luz/physics'

const createFixture = (collider: Collider, height = 1) => {
  const world = new PhysicsWorld()
  const entity = new Entity()
  const body = new Body()

  body.volume = new Sphere({ radius: 0.1 })
  body.isContinuousCollisionEnabled = true
  body.restitution = 0
  body.friction = 0.8
  entity.translation.y = height

  body.applyTransform(entity)
  world.prepare([body], [collider], Vector3.createDown())

  const advanceBody = () => {
    body.update(entity, 1 / 60)
    world.solve([body], [collider], 1 / 60)
  }

  return { world, entity, body, advanceBody }
}

describe('Continuous collision response', () => {
  it('applies friction and angular impulses at a swept impact', () => {
    const { entity, body, advanceBody } = createFixture(new Cuboid({ extents: new Vector3([2, 0.01, 2]) }))

    body.linearVelocity.set([3, -120, 0])
    advanceBody()
    expect(entity.translation.y).to.be.closeTo(0.11, 0.001)
    expect(Math.abs(body.linearVelocity.y)).to.be.lessThan(0.001)
    expect(body.linearVelocity.x).to.be.within(0, 2.5)
    expect(body.angularVelocity.z).to.be.lessThan(-1)
  })
  it('uses the contacted static body material for swept restitution', () => {
    const { world, entity, body } = createFixture(new Plane())
    const floor = new Body({ motionType: 'static' })
    const floorEntity = new Entity()

    floor.volume = new Cuboid({ extents: new Vector3([2, 0.01, 2]) })
    floor.restitution = 0.5
    body.friction = 0
    body.linearVelocity.y = -120

    floor.applyTransform(floorEntity)
    world.prepare([body, floor], [], Vector3.createDown())
    body.update(entity, 1 / 60)
    world.solve([body, floor], [], 1 / 60)
    expect(entity.translation.y).to.be.closeTo(0.11, 0.001)
    expect(body.linearVelocity.y).to.be.closeTo(60, 0.01)
    expect(floor.linearVelocity.magnitude).to.equal(0)
  })

  for (const collider of [new Plane(), new Cuboid({ extents: new Vector3([2, 0.01, 2]) })]) {
    it(`prevents a fast body from crossing an initially touching ${collider.type}`, () => {
      const height = collider.type === 'plane' ? 0.1 : 0.11
      const { entity, body, advanceBody } = createFixture(collider, height)

      body.linearVelocity.y = -120

      advanceBody()
      expect(entity.translation.y).to.be.closeTo(height, 0.001)
      expect(Math.abs(body.linearVelocity.y)).to.be.lessThan(0.001)
    })
  }
})
