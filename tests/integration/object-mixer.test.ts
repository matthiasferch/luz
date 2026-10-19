import type { Tuple4, Tuple3 } from '@luz/formats'
import { expect } from 'chai'
import { TransformAnimation, Entity } from '@luz/core'
import { Body, Cuboid } from '@luz/physics'
import { Quaternion, Vector3 } from '@luz/math'
import { Scene } from '@luz/scene'
import { EntityLoader, ModelLoader } from '@luz/graphics'
import { readFile } from 'fs/promises'
import { pathToFileURL } from 'url'

const createAnimation = (start: Tuple3, end: Tuple3, duration = 1): TransformAnimation => {
  const animation = new TransformAnimation()

  animation.duration = duration
  animation.tracks = {
    translation: [
      { time: 0, value: start },
      { time: duration, value: end }
    ]
  }

  return animation
}

const createEntity = (): Entity => {
  const entity = new Entity()

  entity.translation.set([10, 0, 0])

  entity.components.Horizontal = createAnimation([2, 0, 0], [6, 0, 0])
  entity.components.Vertical = createAnimation([0, 4, 0], [0, 8, 0], 2)

  return entity
}

describe('Entity animation mixer', () => {
  it('round trips explicit playback modes and resets per-instance overrides to the serialized mode', async () => {
    for (const playback of ['loop', 'once'] as const) {
      const animation = createAnimation([0, 0, 0], [1, 0, 0])

      animation.playback = playback

      const definition = animation.serialize()
      const entity = new Entity()

      entity.components.Move = await TransformAnimation.deserialize(definition)

      const mixer = entity.animationMixer!

      expect(definition).to.have.property('playback', playback)
      expect(definition).not.to.have.property('isLooping')
      expect(mixer.animations.Move.playbackMode).to.equal(playback)
      expect(mixer.hasActiveAnimations).to.equal(false)
      mixer.setPlaybackMode('Move', playback === 'loop' ? 'once' : 'loop')
      mixer.play('Move')
      expect(entity.components.Move.serialize()).to.deep.equal(definition)
      mixer.reset()
      expect(mixer.animations.Move.playbackMode).to.equal(playback)
      expect(mixer.hasActiveAnimations).to.equal(false)
    }
  })
  it('starts stopped, preserves authored offsets, shares a reference pose and restores it on empty mixes', () => {
    const entity = createEntity()
    const scene = new Scene()

    scene.entities.Platform = entity

    scene.captureSimulationState()
    scene.update(0.1, false)
    scene.update(0.1, true)
    expect(entity.translation.xyz).to.deep.equal([10, 0, 0])

    const mixer = entity.animationMixer!

    mixer.play('Horizontal')
    scene.previewAnimations([entity])
    expect(entity.translation.xyz).to.deep.equal([12, 0, 0])
    mixer.setMix({ Horizontal: 0.25, Vertical: 0.75 })
    mixer.seekProgress(0.5)
    scene.previewAnimations([entity])
    expect(entity.translation.xyz).to.deep.equal([11, 4.5, 0])
    scene.update(1, false)
    expect(mixer.animations.Horizontal.time).to.equal(0.5)
    expect(mixer.animations.Vertical.time).to.equal(1)
    mixer.setMix({})
    expect(entity.translation.xyz).to.deep.equal([10, 0, 0])
    mixer.play('Vertical')
    scene.resetSimulation()
    expect(mixer.hasActiveAnimations).to.equal(false)
    expect(entity.translation.xyz).to.deep.equal([10, 0, 0])
  })
  it('interrupts transitions at current weights and uses independent clocks with paused fades', () => {
    const entity = createEntity()
    const mixer = entity.animationMixer!

    mixer.play('Horizontal')
    mixer.advance(0.25)
    mixer.play('Vertical', { transitionDuration: 1 })
    mixer.advance(0.25)
    expect(mixer.animations.Horizontal.weight).to.equal(0.75)
    expect(mixer.animations.Vertical.weight).to.equal(0.25)
    mixer.setMix({ Horizontal: 1 }, { transitionDuration: 1 })
    mixer.pause()
    mixer.advance(1)
    expect(mixer.animations.Horizontal.weight).to.equal(0.75)
    mixer.resume()
    mixer.advance(0.5)
    expect(mixer.animations.Horizontal.weight).to.equal(0.875)
    expect(mixer.animations.Vertical.time).to.equal(0.75)
    expect(mixer.animations.Horizontal.time).to.equal(1)
    mixer.advance(1)
    expect(mixer.animations.Horizontal.time).to.equal(1)
    expect(() => mixer.setMix({ Missing: 1 })).to.throw('weights')
    expect(() => mixer.setMix({ Horizontal: NaN })).to.throw('weights')
  })
  it('normalizes weighted scales and antipodal rotations without leaking runtime state', async () => {
    const entity = createEntity()
    const rotation = Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 2).serialize()
    const oppositeRotation: Tuple4 = [-rotation[0], -rotation[1], -rotation[2], -rotation[3]]
    const horizontal = entity.components.Horizontal as TransformAnimation
    const vertical = entity.components.Vertical as TransformAnimation

    horizontal.tracks.rotation = [
      { time: 0, value: rotation },
      { time: 1, value: rotation }
    ]
    vertical.tracks.rotation = [
      { time: 0, value: oppositeRotation },
      { time: 2, value: oppositeRotation }
    ]
    horizontal.tracks.scale = [
      { time: 0, value: [2, 2, 2] },
      { time: 1, value: [2, 2, 2] }
    ]

    const definition = entity.serialize()
    const otherEntity = await Entity.deserialize(definition)

    entity.animationMixer!.setMix({ Horizontal: 0.5, Vertical: 0.5 })
    entity.animationMixer!.applyPose(entity, 0)
    rotation.forEach((value, index) => expect(entity.rotation[index]).to.be.closeTo(value, 1e-6))
    expect(entity.scale.xyz).to.deep.equal([1.5, 1.5, 1.5])
    expect(otherEntity.animationMixer!.hasActiveAnimations).to.equal(false)
    expect(horizontal.serialize()).to.deep.equal(otherEntity.components.Horizontal.serialize())
    delete entity.components.Vertical
    expect(Object.keys(entity.animationMixer!.animations)).to.deep.equal(['Horizontal'])
  })
  it('submits one blended kinematic target per fixed step and clears motion history across simulation toggles', () => {
    const entity = createEntity()
    const body = new Body()

    body.motionType = 'kinematic'
    body.volume = new Cuboid()
    entity.components.Body = body

    const scene = new Scene()

    scene.entities.Platform = entity
    scene.fixedTimeStep = 0.125

    scene.captureSimulationState()

    const mixer = entity.animationMixer!

    mixer.setMix({ Horizontal: 0.5, Vertical: 0.5 })
    scene.update(0.25, false)
    expect(mixer.animations.Horizontal.time).to.equal(0.25)
    expect(body.linearVelocity.magnitude).to.equal(0)

    let targetCount = 0

    const setTarget = body.setKinematicTarget.bind(body)

    body.setKinematicTarget = (...parameters) => {
      targetCount++

      setTarget(...parameters)
    }

    scene.update(0.25, true)
    expect(targetCount).to.equal(2)
    expect(mixer.animations.Horizontal.time).to.equal(0.5)
    expect(body.linearVelocity.x).to.be.closeTo(2, 1e-5)
    expect(body.linearVelocity.y).to.be.closeTo(1, 1e-5)
    scene.update(0.125, false)
    expect(mixer.animations.Horizontal.time).to.equal(0.625)
    expect(body.linearVelocity.magnitude).to.equal(0)
    scene.update(0.125, true)
    expect(mixer.animations.Horizontal.time).to.equal(0.75)
    expect(body.linearVelocity.x).to.be.closeTo(2, 1e-5)
  })
})

const manifestPath = process.env.LUZ_BLENDER_OBJECT_ACTIONS_FIXTURE

if (manifestPath) {
  describe('Blender object Actions export/reload', () => {
    it('matches every evaluated sample, static parents, constraints, slots and standalone placement', async () => {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
      const loadJson = async (url: string) => JSON.parse(await readFile(new URL(url), 'utf8'))
      const loader = new EntityLoader(
        new ModelLoader(loadJson, async (url) => {
          const bytes = await readFile(new URL(url))

          return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
        }),
        loadJson
      )
      const scene = await loader.loadScene(pathToFileURL(manifest.scene).href)
      const entityScene = new Scene()

      entityScene.entities.Platform = await loader.loadEntity(pathToFileURL(manifest.entity).href)

      entityScene.captureSimulationState()

      for (const animation of manifest.expected) {
        for (const [kind, target] of [
          ['scene', scene],
          ['entity', entityScene]
        ] as const) {
          if (kind === 'entity' && animation.path !== 'Platform') {
            continue
          }

          const entity = target.findEntity(animation.path)!
          const mixer = entity.animationMixer!

          mixer.play(animation.name)

          for (let index = 0; index < animation.poses.length; index++) {
            mixer.seekProgress(index / (animation.poses.length - 1))
            target.previewAnimations([entity])
            animation.poses[index][kind].forEach((value: number, axis: number) => {
              expect(
                entity.modelMatrix[axis],
                `${kind} ${animation.path} ${animation.name} sample ${index} axis ${axis}`
              ).to.be.closeTo(value, 1e-4)
            })
          }

          mixer.stop()
        }
      }
    })
  })
}
