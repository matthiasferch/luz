import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'
import { Body, Cuboid, Plane, Polygon, Sphere } from '@luz/physics'
import type { Collider, Volume } from '@luz/physics'
import { Scene } from '@luz/scene'

const createFixture = (volume: Volume, floor: Collider) => {
  const scene = new Scene()
  const entity = new Entity()
  const body = new Body()

  body.volume = volume
  body.isContinuousCollisionEnabled = true
  body.friction = 0.8
  body.restitution = 0.15
  entity.components.body = body
  scene.entities.body = entity
  scene.colliders.floor = floor

  const advanceSteps = (stepCount: number) => {
    for (let step = 0; step < stepCount; step++) {
      scene.update(1 / 60)
    }
  }

  return { scene, entity, body, advanceSteps }
}

describe('Continuous body contact motion', () => {
  for (const floor of [
    new Plane(),
    new Polygon({
      vertices: [
        [-10, 0, 10],
        [10, 0, 10],
        [10, 0, -10],
        [-10, 0, -10]
      ].map((point) => new Vector3(point))
    }),
    new Cuboid({ origin: new Vector3([0, -0.01, 0]), extents: new Vector3([10, 0.01, 10]) })
  ]) {
    it(`settles a tumbling box onto a face on a ${floor.type}`, () => {
      const volume = new Cuboid({ extents: new Vector3([0.5, 0.5, 0.5]) })
      const { entity, body, advanceSteps } = createFixture(volume, floor)

      entity.translation.y = 1.5
      body.linearVelocity.x = 0.4

      Quaternion.setFromAxisAngle(new Vector3([1, 0, 1]).normalize(), 0.4, entity.rotation)
      body.angularVelocity.set([0.6, 0.4, 0.2])
      advanceSteps(600)
      expect(body.isSleeping).to.equal(true)
      expect(entity.translation.y).to.be.closeTo(0.5, 0.003)
      expect(Math.max(...volume.axes.map((axis) => Math.abs(axis.y)))).to.be.greaterThan(0.999)
      expect(body.angularVelocity.magnitude).to.equal(0)
    })
  }

  it('keeps a rolling sphere translating under gravity after contact', () => {
    const { entity, body, advanceSteps } = createFixture(new Sphere({ radius: 0.5 }), new Plane())

    entity.translation.y = 0.5
    body.linearVelocity.x = 1
    body.angularVelocity.z = -2
    body.restitution = 0

    advanceSteps(120)
    expect(entity.translation.x).to.be.greaterThan(1.8)
    expect(entity.translation.y).to.be.closeTo(0.5, 0.003)
    expect(body.linearVelocity.x).to.be.greaterThan(0.9)
    expect(body.angularVelocity.z).to.be.lessThan(-1.8)
    expect(body.isSleeping).to.equal(false)
  })
  it('keeps frictionless sliding under gravity without freezing translation', () => {
    const { entity, body, advanceSteps } = createFixture(new Sphere({ radius: 0.5 }), new Plane())

    entity.translation.y = 0.5
    body.friction = 0
    body.restitution = 0
    body.linearVelocity.x = 1

    advanceSteps(120)
    expect(entity.translation.x).to.be.greaterThan(1.9)
    expect(entity.translation.y).to.be.closeTo(0.5, 0.003)
    expect(body.angularVelocity.magnitude).to.equal(0)
  })
  it('allows a supported sphere to roll off a finite platform', () => {
    const { entity, body, advanceSteps } = createFixture(
      new Sphere({ radius: 0.5 }),
      new Cuboid({ extents: new Vector3([1, 0.01, 1]) })
    )

    entity.translation.y = 0.51
    body.linearVelocity.x = 1
    body.angularVelocity.z = -2
    body.restitution = 0

    advanceSteps(120)
    expect(entity.translation.x).to.be.greaterThan(1.8)
    expect(entity.translation.y).to.be.lessThan(0)
  })
})
