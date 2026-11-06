import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Vector3 } from '@luz/math'
import { Body, CollisionSolver, Sphere } from '@luz/physics'
import type { CollisionManifold } from '@luz/physics'

const createFixture = () => {
  const body = new Body()
  const entity = new Entity()
  const solver = new CollisionSolver()

  body.volume = new Sphere({ radius: 0.5 })

  body.applyTransform(entity)

  const contact: CollisionManifold = {
    id: 'floor',
    bodies: [body, null],
    collisions: [{ normal: Vector3.createDown(), point: Vector3.createZero(), penetrationDepth: 0 }]
  }

  const advanceSteps = (stepCount: number, deltaTime = 1 / 60) => {
    for (let step = 0; step < stepCount; step++) {
      solver.finishStep([contact], [body], deltaTime)
    }
  }

  return { body, entity, solver, contact, advanceSteps }
}

describe('Physics sleep timing', () => {
  for (const frequency of [30, 60, 120]) {
    it(`requires a full second of quiet at ${frequency} steps per second`, () => {
      const { body, advanceSteps } = createFixture()

      advanceSteps(frequency - 1, 1 / frequency)
      expect(body.isSleeping).to.equal(false)
      advanceSteps(2, 1 / frequency)
      expect(body.isSleeping).to.equal(true)
    })
  }

  for (const channel of ['linearVelocity', 'angularVelocity'] as const) {
    it(`keeps visible ${channel} awake`, () => {
      const { body, advanceSteps } = createFixture()

      body[channel].x = channel === 'linearVelocity' ? 0.15 : 0.6

      advanceSteps(120)
      expect(body.isSleeping).to.equal(false)
      expect(body[channel].x).to.be.greaterThan(0.1)
    })
  }

  for (const resetMethod of ['wake', 'resetSleepFrames', 'resetMotion'] as const) {
    it(`restarts the solver timer when ${resetMethod} is called on an awake body`, () => {
      const { body, advanceSteps } = createFixture()

      advanceSteps(48)
      expect(body.isSleeping).to.equal(false)
      body[resetMethod]()
      advanceSteps(48)
      expect(body.isSleeping).to.equal(false)
      advanceSteps(13)
      expect(body.isSleeping).to.equal(true)
    })
  }

  it('restarts quiet time after motion is removed during collision solving', () => {
    const { body, entity, advanceSteps } = createFixture()

    advanceSteps(48)

    body.linearVelocity.x = 0.15

    body.update(entity, 1 / 60)
    body.linearVelocity.reset()
    advanceSteps(48)
    expect(body.isSleeping).to.equal(false)
    advanceSteps(13)
    expect(body.isSleeping).to.equal(true)
  })
  it('keeps an entire supported island awake after a small impulse to one member', () => {
    const { body, solver, contact } = createFixture()
    const upperBody = new Body()

    upperBody.volume = new Sphere({ radius: 0.5 })

    upperBody.applyTransform(new Entity())

    const stackContact: CollisionManifold = { ...contact, id: 'stack', bodies: [upperBody, body] }
    const advanceSteps = (stepCount: number) => {
      for (let step = 0; step < stepCount; step++) {
        solver.finishStep([contact, stackContact], [body, upperBody], 1 / 60)
      }
    }

    advanceSteps(48)
    upperBody.applyImpulse(new Vector3([0.01, 0, 0]))
    advanceSteps(48)
    expect(body.isSleeping).to.equal(false)
    expect(upperBody.isSleeping).to.equal(false)
    advanceSteps(13)
    expect(body.isSleeping).to.equal(true)
    expect(upperBody.isSleeping).to.equal(true)
  })
})
