require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Entity, Light, Camera } = require('@luz/core')
const { Body, Biped } = require('@luz/physics')
const { Scene } = require('@luz/scene')
const { Model, Armature, SkeletalAnimation } = require('@luz/graphics')
const { Cylinder, Cuboid } = require('@luz/physics')
const { describeEntityTree } = require('../src/editor/entity-tree.ts')

it('describes model armatures, bone hierarchy and clips without retaining runtime objects', async () => {
  const scene = new Scene()
  const entity = (scene.entities.Jog = new Entity())
  const model = (entity.components.Mesh = new Model())

  model.armatures.Armature = await Armature.deserialize({
    bones: [{ name: 'Hips' }, { name: 'Spine', parent: 'Hips' }]
  })
  model.animations.Timeline = new SkeletalAnimation()
  model.animations.Timeline.duration = 2.566666666666667
  model.animations.Timeline.playback = 'loop'

  const contents = describeEntityTree(scene)[0].components[0].contents

  assert.deepEqual(contents, [
    {
      name: 'Armature',
      type: 'armature',
      boneCount: 2,
      children: [{ name: 'Hips', type: 'bone', children: [{ name: 'Spine', type: 'bone', children: [] }] }]
    },
    { name: 'Timeline', type: 'animation' }
  ])
  assert.doesNotThrow(() => JSON.stringify(contents))

  model.animations.Timeline.playback = 'once'

  assert.deepEqual(describeEntityTree(scene)[0].components[0].contents, contents)
})
it('describes nested runtime entities with readable names and unique escaped paths', () => {
  const scene = new Scene()
  const root = (scene.entities['Room/~1'] = new Entity())
  const mesh = (root.children.Mesh = new Entity())

  mesh.components.model = new Model()
  mesh.components.light = new Light()
  mesh.components.fill = new Light()
  mesh.children.Empty = new Entity()
  scene.entities.Mesh = new Entity()

  const snapshot = describeEntityTree(scene)

  assert.deepEqual(snapshot, [
    {
      key: 'Room~1~01',
      label: 'Room/~1',
      components: [],
      children: [
        {
          key: 'Room~1~01/Mesh',
          label: 'Mesh',
          components: [
            { name: 'model', type: 'model', isVisible: true },
            { name: 'light', type: 'light', lightType: 'spot', isVisible: true, color: '#ffffff', lightKey: undefined },
            { name: 'fill', type: 'light', lightType: 'spot', isVisible: true, color: '#ffffff', lightKey: undefined }
          ],
          children: [
            {
              key: 'Room~1~01/Mesh/Empty',
              label: 'Empty',
              components: [],
              children: []
            }
          ]
        }
      ]
    },
    { key: 'Mesh', label: 'Mesh', components: [], children: [] }
  ])
  assert.doesNotThrow(() => JSON.stringify(snapshot))
  delete root.children.Mesh
  assert.equal(snapshot[0].children.length, 1)
  assert.equal(describeEntityTree(scene)[0].children.length, 0)
})
it('describes effective body modes, shape types, the selected camera and independent light identities', () => {
  const scene = new Scene()
  const root = (scene.entities.Rig = new Entity())
  const child = (root.children.Details = new Entity())
  const dynamicBody = (root.components.Dynamic = new Body())

  dynamicBody.volume = new Cylinder()

  const fixedBody = (root.components.Fixed = new Body({ mass: 0, motionType: 'static' }))

  fixedBody.volume = new Cuboid()

  const kinematic = (root.components.Kinematic = new Body())

  kinematic.motionType = 'kinematic'

  const explicitStatic = (root.components.Static = new Body())

  explicitStatic.motionType = 'static'

  const biped = (root.components.Player = new Biped())

  biped.volume = new Cuboid()

  const isActiveCamera = (child.components.Optics = new Camera())

  child.components.Other = new Camera()

  const warm = (child.components.Warm = new Light())

  warm.color.set([1, 0.21404114, 0])

  const fill = (child.components.Fill = new Light())
  const snapshot = describeEntityTree(
    scene,
    isActiveCamera,
    new Map([
      [warm, 'warm-key'],
      [fill, 'fill-key']
    ])
  )

  assert.deepEqual(
    snapshot[0].components.map((component) => [component.motionMode, component.collisionShape]),
    [
      ['dynamic', 'cylinder'],
      ['static', 'cuboid'],
      ['kinematic', 'none'],
      ['static', 'none'],
      ['dynamic', 'cuboid']
    ]
  )

  const components = snapshot[0].children[0].components

  assert.equal(components[0].isActiveCamera, true)
  assert.equal(components[1].isActiveCamera, false)
  assert.equal(components[2].color, '#ff8000')
  assert.equal(components[2].lightKey, 'warm-key')
  assert.equal(components[3].lightKey, 'fill-key')
  warm.color.set([0, 0, 0])
  assert.equal(components[2].color, '#ff8000')
})
