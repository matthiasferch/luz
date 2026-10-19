require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { Entity, Transform, TransformAnimation } = require('@luz/core')
const { Scene } = require('@luz/scene')
const { Model } = require('@luz/graphics')
const { AnimationController } = require('../src/runtime/animation-controller.ts')

it('selects and blends all meshes of one character without affecting another instance', async () => {
  const scene = new Scene()
  const definition = {
    armatures: { Rig: { bones: [{ name: 'Root' }] } },
    animations: Object.fromEntries(
      ['Timeline', 'Wave'].map((name) => [
        name,
        {
          type: 'skeletalAnimation',
          schemaVersion: 1,
          duration: 1,
          playback: 'loop',
          isAutoplayEnabled: name === 'Timeline',
          keyframes: {
            Root: {
              translation: [{ time: 0, value: [name === 'Wave' ? 4 : 0, 0, 0] }],
              rotation: [{ time: 0, value: [0, 0, 0, 1] }],
              scale: [{ time: 0, value: [1, 1, 1] }]
            }
          }
        }
      ])
    )
  }

  for (const name of ['First', 'Second']) {
    const root = (scene.entities[name] = new Entity())

    for (const meshName of ['Joints', 'Surface']) {
      const child = (root.children[meshName] = new Entity())

      child.components.Model = await Model.deserialize(
        {
          type: 'model',
          ...definition,
          animations: Object.fromEntries(
            Object.keys(definition.animations).map((name) => [name, `../animations/${name}.animation.json`])
          )
        },
        definition.animations
      )
    }
  }

  const controller = new AnimationController(scene)
  const groups = controller.collectGroups()

  assert.equal(groups.length, 2)
  controller.setPlayback(groups[0].key, 'Wave', 'once')
  assert.equal(controller.collectGroups()[0].clips[1].playback, 'once')
  assert.equal(controller.collectGroups()[1].clips[1].playback, 'loop')
  assert.throws(() => controller.setPlayback(groups[0].key, 'missing', 'loop'))
  assert.throws(() => controller.setPlayback(groups[0].key, 'Wave', 'invalid'))
  controller.setMix(groups[0].key, { Wave: 1 }, 0, true)

  for (const child of Object.values(scene.entities.First.children)) {
    child.components.Model.update(new Transform(), 0.5)
    assert.equal(child.components.Model.boneMatrices[12], 4)
    assert.equal(child.components.Model.animations.Wave.time, 0.5)
    assert.equal(child.components.Model.animations.Wave.state, 'playing')
  }

  assert.equal(scene.entities.Second.children.Joints.components.Model.animations.Wave.state, 'stopped')
  assert.equal(controller.getTime(groups[0].key, 'Wave'), 0.5)
  assert.equal(controller.getTime(groups[1].key, 'Wave'), 0)
  assert.equal(controller.getTime('missing', 'Wave'), 0)
  assert.equal(controller.getTime(groups[0].key, 'missing'), 0)
  controller.control(groups[0].key, 'pause')
  controller.setSpeed(groups[0].key, 2)
  controller.seek(groups[0].key, 0.75)

  for (const child of Object.values(scene.entities.First.children)) {
    child.components.Model.update(new Transform(), 2)
    assert.equal(child.components.Model.animations.Wave.time, 0.75)
    assert.equal(child.components.Model.animationMixer.speed, 2)
  }

  assert.equal(controller.collectGroups()[0].isPaused, true)
  assert.equal(controller.collectGroups()[1].speed, 1)
  assert.throws(() => controller.seek(groups[0].key, NaN))
  assert.throws(() => controller.setSpeed(groups[0].key, -1))
  assert.throws(() => controller.control(groups[0].key, 'invalid'))
  controller.control(groups[0].key, 'resume')
  assert.equal(controller.collectGroups()[0].isPaused, false)
  controller.setMix(groups[0].key, { Wave: 0.25, Timeline: 0.75 }, 0)
  assert.deepEqual(
    controller.collectGroups()[0].clips.map((clip) => clip.weight),
    [0.75, 0.25]
  )
  assert.throws(() => controller.setMix(groups[0].key, { unknown: 1 }, 0))
  assert.deepEqual(
    controller.collectGroups()[0].clips.map((clip) => clip.weight),
    [0.75, 0.25]
  )
})
it('mixes named object animations independently for each entity with simulation stopped', () => {
  const scene = new Scene()

  for (const name of ['First', 'Second']) {
    const root = (scene.entities[name] = new Entity())
    const child = (root.children.Child = new Entity())

    for (const entity of [root, child]) {
      for (const [animationName, distance] of [
        ['Horizontal', 2],
        ['Vertical', 4]
      ]) {
        const animation = new TransformAnimation()

        animation.duration = 1
        animation.tracks = {
          translation: [
            { time: 0, value: [0, 0, 0] },
            { time: 1, value: animationName === 'Horizontal' ? [distance, 0, 0] : [0, distance, 0] }
          ]
        }
        entity.components[animationName] = animation
      }
    }
  }

  const controller = new AnimationController(scene)
  const groups = controller.collectGroups()
  const group = groups[0]

  assert.deepEqual(
    groups.map((entry) => entry.label),
    ['First', 'First / Child', 'Second', 'Second / Child']
  )
  scene.update(0.5, false)
  assert.equal(scene.entities.First.translation.x, 0)
  controller.setPlayback(group.key, 'Horizontal', 'loop')
  controller.setMix(group.key, { Horizontal: 0.5, Vertical: 0.5 }, 0, true)
  scene.update(1.25, false)
  assert.equal(scene.entities.First.translation.x, 0.25)
  assert.equal(scene.entities.First.translation.y, 2)
  assert.equal(scene.entities.First.children.Child.translation.x, 0)
  controller.seek(group.key, 0.75)
  assert.equal(controller.getTime(group.key, 'Horizontal'), 0.75)
  assert.equal(scene.entities.First.translation.x, 0.75)
  controller.setSpeed(group.key, 2)
  controller.control(group.key, 'resume')
  scene.update(0.125, false)
  assert.equal(controller.getTime(group.key, 'Horizontal'), 0)
  controller.control(group.key, 'stop')
  assert.equal(scene.entities.First.translation.x, 0)
  assert.equal(scene.entities.First.translation.y, 0)
  assert.equal(controller.collectGroups()[0].clips[0].weight, 0)
  assert.equal(scene.entities.Second.translation.x, 0)
})
