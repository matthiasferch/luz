import { expect } from 'chai'
import { Entity, Reflector } from '@luz/core'
import { Matrix4, Vector3, Vector4 } from '@luz/math'

describe('Core: Reflector', () => {
  it('uses a small default clip margin', () => {
    expect(new Reflector().clipBias).to.equal(0.001)
  })
  it('updates its world plane from the entity transform', () => {
    const entity = new Entity()
    const reflector = new Reflector()

    entity.components['Reflector'] = reflector

    entity.translation.set([0, 3, 0])
    entity.update(0)
    expect(Array.from(reflector.worldPlane)).to.deep.equal([0, 1, 0, -3])
  })
  it('serializes its public settings without transient world state', () => {
    const reflector = new Reflector()

    reflector.offset = 0.25
    reflector.resolutionScale = 0.75
    reflector.clipBias = 0.02
    reflector.intensity = 0.8
    reflector.maximumRoughness = 0.6

    reflector.meshes.push('Mirror')
    reflector.normal.set(new Vector3([0, 0, 1]))

    const serialized = reflector.serialize() as Record<string, unknown>

    expect(serialized).to.deep.include({
      type: 'reflector',
      resolutionScale: 0.75,
      clipBias: 0.02,
      intensity: 0.8,
      maximumRoughness: 0.6
    })
    expect(serialized.normal).to.deep.equal([0, 0, 1])
    expect(serialized.offset).to.equal(0.25)
    expect(serialized.meshes).to.deep.equal(['Mirror'])
    expect(serialized).not.to.have.property('worldPlane')
  })
  it('reflects points across offset planes', () => {
    const plane = new Vector4([0, 1, 0, -2])
    const reflected = Matrix4.createReflection(plane).transformVector3(new Vector3([1, 5, 3]))

    expect(reflected.x).to.be.closeTo(1, 1e-6)
    expect(reflected.y).to.be.closeTo(-1, 1e-6)
    expect(reflected.z).to.be.closeTo(3, 1e-6)
  })
  it('deserializes the renamed component discriminator', async () => {
    const entity = await Entity.deserialize({
      components: {
        Reflector: {
          type: 'reflector',
          intensity: 0.7
        } as unknown as Reflector
      }
    })

    expect(entity.components.Reflector).to.be.instanceOf(Reflector)
    expect((entity.components.Reflector as Reflector).intensity).to.equal(0.7)
  })
})
