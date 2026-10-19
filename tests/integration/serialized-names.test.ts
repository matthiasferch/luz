import { expect } from 'chai'
import { TransformAnimation, Camera, Entity, Light } from '@luz/core'
import { Material, Model, Surface } from '@luz/graphics'
import { Body, Cuboid } from '@luz/physics'

describe('Serialized names', () => {
  it('preserves component predicates through a JSON entity round trip', async () => {
    const entity = new Entity()
    const camera = new Camera()

    camera.isDepthOfFieldEnabled = true

    const body = new Body()

    body.motionType = 'kinematic'
    body.volume = new Cuboid()
    body.isContinuousCollisionEnabled = true

    const animation = new TransformAnimation()

    animation.duration = 1
    animation.playback = 'once'
    animation.tracks.translation = [
      { time: 0, value: [0, 0, 0] },
      { time: 1, value: [1, 0, 0] }
    ]

    const model = new Model()
    const light = new Light()

    model.isVisible = light.isVisible = false

    Object.assign(entity.components, { camera, body, animation, model, light })

    const definition = JSON.parse(JSON.stringify(entity.serialize()))
    const predicates = [
      ['camera', 'isDepthOfFieldEnabled', true, 'depthOfFieldEnabled'],
      ['body', 'isContinuousCollisionEnabled', true, 'continuous'],
      ['animation', 'isAutoplayEnabled', false, 'autoplay'],
      ['model', 'isVisible', false, 'visible'],
      ['light', 'isVisible', false, 'visible']
    ] as const
    const reloadedEntity = await Entity.deserialize(definition)

    for (const [name, field, isEnabled, previousField] of predicates) {
      expect(definition.components[name]).to.have.property('type', name)
      expect(reloadedEntity.components[name]).to.be.instanceOf(entity.components[name].constructor)
      expect(definition.components[name]).to.have.property(field, isEnabled)
      expect(definition.components[name]).not.to.have.property(previousField)
      expect(reloadedEntity.components[name]).to.have.property(field, isEnabled)
    }

    expect(definition.components.body.volume.type).to.equal('cuboid')
    expect((reloadedEntity.components.body as Body).volume).to.be.instanceOf(Cuboid)
  })
  it('preserves material and texture flags through JSON round trips', async () => {
    const material = new Material({ isDoubleSided: true })

    material.graph.surface = {
      type: 'add',
      firstClosure: { type: 'principled' },
      secondClosure: { type: 'emission', color: { value: [1, 0, 0] }, strength: { value: 2 } }
    }

    const materialDefinition = JSON.parse(JSON.stringify(material.serialize()))

    expect(materialDefinition).to.have.property('isDoubleSided', true)
    expect(materialDefinition).not.to.have.property('doubleSided')

    const reloadedMaterial = await Material.deserialize(materialDefinition)

    expect(reloadedMaterial.isDoubleSided).to.equal(true)
    expect(reloadedMaterial.graph.surface).to.deep.equal(material.graph.surface)

    const surface = new Surface({ areMipmapsEnabled: true })
    const surfaceDefinition = JSON.parse(JSON.stringify(surface.serialize()))

    expect(surfaceDefinition).to.have.property('areMipmapsEnabled', true)
    expect(surfaceDefinition).not.to.have.property('useMipmaps')
    expect((await Surface.deserialize(surfaceDefinition)).areMipmapsEnabled).to.equal(true)
  })
})
