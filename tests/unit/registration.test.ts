import { rejects } from 'node:assert/strict'
import { expect } from 'chai'
import { Component, Entity, Light } from '@luz/core'
import { Body, Collider, Sphere } from '@luz/physics'
import { Register, Serialize, Serializable, findRegisteredClass } from '@luz/serialization'
import type { EntityDefinition } from '@luz/formats'

declare module '@luz/formats' {
  interface ComponentDefinitions {
    auditExtension: { type: 'auditExtension' }
  }
}

class ExtensionComponent extends Component {
  readonly type = 'auditExtension'
  readonly timestep = 'variable'

  update(): void {}
}

class ColliderCollection extends Serializable {
  colliders: Collider[] = []
}

Register('auditExtension')(ExtensionComponent)
Reflect.defineMetadata('design:type', Array, ColliderCollection.prototype, 'colliders')
Serialize(Collider)(ColliderCollection.prototype, 'colliders')
describe('Registered document types', () => {
  it('uses explicit tags independently of class names and preserves extension registration', async () => {
    const definition: EntityDefinition = { components: { extension: { type: 'auditExtension' } } }
    const entity = await Entity.deserialize(definition)

    expect(entity.components.extension).to.be.instanceOf(ExtensionComponent)
    expect(entity.components.extension.serialize()).to.deep.equal({ type: 'auditExtension' })
    expect(findRegisteredClass('auditExtension')).to.equal(ExtensionComponent)
    expect(findRegisteredClass('extensionComponent')).to.equal(undefined)
    expect(() => Register('auditExtension')(ExtensionComponent)).not.to.throw()
  })
  it('rejects conflicting registrations and invalid discriminator names', () => {
    expect(() => Register('auditExtension')(Light)).to.throw('Conflicting registration')
    expect(() => Register('anotherExtension')(ExtensionComponent)).to.throw('Conflicting registration')
    expect(() => Register('InvalidTag')).to.throw('Invalid registered type')
    expect(() => Register('invalid-tag')).to.throw('Invalid registered type')
    expect(findRegisteredClass('auditExtension')).to.equal(ExtensionComponent)
  })
  it('rejects missing, unknown and cross-family component discriminators', async () => {
    for (const definition of [{}, { type: 'absent' }, { type: 'sphere' }]) {
      await rejects(Entity.deserialize({ components: { broken: definition } }), /type|Component/)
    }

    await rejects(Body.deserialize({ type: 'body', motionType: 'static', volume: { type: 'plane' } }), /Volume/)
  })
  it('rejects discriminator substitution and missing tags on concrete classes', async () => {
    await rejects(Light.deserialize({ type: 'camera', lightType: 'point' }), /Expected type 'light'/)

    await rejects(Light.deserialize({ lightType: 'point' }), /Expected type 'light'/)

    await rejects(Sphere.deserialize({ type: 'light' }), /Expected type 'sphere'/)

    const light = (await Light.deserialize({ type: 'light', lightType: 'point' })) as Light

    expect(light.type).to.equal('light')
    expect(light.serialize().type).to.equal('light')
  })
  it('validates polymorphic arrays and limits dispatch to the declared family', async () => {
    const collection = await ColliderCollection.deserialize({ colliders: [{ type: 'sphere', radius: 2 }] })

    expect((collection as ColliderCollection).colliders[0]).to.be.instanceOf(Sphere)

    await rejects(ColliderCollection.deserialize({ colliders: [{ type: 'light' }] }), /Collider/)

    await rejects(ColliderCollection.deserialize({ colliders: [{ type: 'missing' }] }), /Unknown type/)

    await rejects(ColliderCollection.deserialize({ colliders: [{}] }), /Missing type/)
  })
})
