import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Vector3 } from '@luz/math'
import { Body, Plane, Sphere } from '@luz/physics'
import { Scene } from '@luz/scene'

const createFixture = () => {
  const scene = new Scene()
  const entity = new Entity()
  const body = new Body()

  body.volume = new Sphere({ radius: 0.5 })
  body.friction = 0
  body.restitution = 0
  entity.translation.y = 0.5
  entity.components.body = body
  scene.entities.sphere = entity
  scene.colliders.floor = new Plane()

  const advanceSteps = (stepCount: number) => {
    for (let step = 0; step < stepCount; step++) {
      scene.update(1 / 60)
    }
  }

  return { scene, entity, body, advanceSteps }
}

describe('Scene sleep transitions', () => {
  it('preserves slow frictionless sliding instead of abruptly stopping it', () => {
    const { entity, body, advanceSteps } = createFixture()

    body.linearVelocity.x = 0.15

    advanceSteps(120)
    expect(body.isSleeping).to.equal(false)
    expect(body.linearVelocity.x).to.be.greaterThan(0.14)
    expect(entity.translation.x).to.be.greaterThan(0.28)
  })
  it('preserves slow spinning instead of abruptly stopping it', () => {
    const { body, advanceSteps } = createFixture()

    body.angularVelocity.y = 0.6

    advanceSteps(120)
    expect(body.isSleeping).to.equal(false)
    expect(body.angularVelocity.y).to.be.greaterThan(0.54)
  })
  it('postpones sleep after a small impulse and eventually settles and wakes again', () => {
    const { body, advanceSteps } = createFixture()

    advanceSteps(48)
    expect(body.isSleeping).to.equal(false)
    body.applyImpulse(new Vector3([0.01, 0, 0]))
    advanceSteps(48)
    expect(body.isSleeping).to.equal(false)
    advanceSteps(24)
    expect(body.isSleeping).to.equal(true)
    body.applyImpulse(new Vector3([0.15, 0, 0]))
    advanceSteps(120)
    expect(body.isSleeping).to.equal(false)
    expect(body.linearVelocity.x).to.be.greaterThan(0.14)
  })
})
