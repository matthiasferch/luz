import { expect } from 'chai'
import { Entity } from '@luz/core'
import type { MotionType } from '@luz/formats'
import { Biped, Body, Sphere } from '@luz/physics'
import { Scene } from '@luz/scene'

describe('Explicit body motion types', () => {
  it('defaults new bodies to dynamic and keeps their motion type independent of mass', () => {
    const body = new Body()

    expect(body.motionType).to.equal('dynamic')
    expect(body.isDynamic).to.equal(true)

    body.mass = 0

    expect(body.isDynamic).to.equal(true)
    expect(() => body.validate()).to.throw('Invalid body')
    expect(() => new Body({ mass: 0 })).to.throw('Invalid body')

    for (const motionType of ['static', 'kinematic'] as const) {
      const fixedBody = new Body({ mass: 0, motionType })

      fixedBody.mass = 10

      fixedBody.validate()
      expect(fixedBody.isDynamic).to.equal(false)
      expect(fixedBody.inverseMass).to.equal(0)
    }
  })
  it('round-trips each explicit type through scene serialization and preserves its physics behavior', async () => {
    const scene = new Scene()

    for (const motionType of ['dynamic', 'static', 'kinematic'] as const) {
      const entity = new Entity()
      const body = new Body({ mass: 2, motionType })

      body.volume = new Sphere()
      entity.components.Body = body
      scene.entities[motionType] = entity

      entity.translation.set([Object.keys(scene.entities).length * 5, 2, 0])
    }

    const reloaded = await Scene.deserialize(scene.serialize())

    reloaded.update(1 / 60)

    for (const motionType of ['dynamic', 'static', 'kinematic'] as const) {
      const entity = reloaded.entities[motionType]
      const body = entity.components.Body as Body

      expect(body.motionType).to.equal(motionType)
      expect(body.serialize().motionType).to.equal(motionType)

      if (motionType === 'dynamic') {
        expect(entity.translation.y).to.be.lessThan(2)
      } else {
        expect(entity.translation.y).to.equal(2)
        expect(body.inverseMass).to.equal(0)
      }
    }
  })
  it('rejects missing, automatic and invalid serialized motion types for bodies and bipeds', async () => {
    for (const BodyClass of [Body, Biped]) {
      for (const motionType of [undefined, 'auto', 'unknown', null]) {
        let loadError: unknown

        try {
          await BodyClass.deserialize({ mass: 1, motionType, volume: { type: 'sphere' } })
        } catch (error) {
          loadError = error
        }

        expect(loadError, String(motionType)).to.be.instanceOf(Error)
      }
    }

    expect(() => new Body({ motionType: 'auto' as MotionType })).to.throw('Invalid body')
  })
})
