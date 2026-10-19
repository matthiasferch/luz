import type { PlaybackMode } from '@luz/formats'
import { expect } from 'chai'
import type { TransformSample, TransformTracks } from '@luz/core'
import { Camera, Entity, Light, Reflector, TransformAnimation } from '@luz/core'
import { Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { EntityLoader } from '@luz/graphics'
import { Cuboid, Sphere } from '@luz/physics'
import { Quaternion, Vector3 } from '@luz/math'

const sample = (x = 0, rotation = Quaternion.createIdentity(), scale = [1, 1, 1]): TransformSample => ({
  translation: [x, 0, 0],
  rotation: Array.from(rotation),
  scale
})

const createClip = (samples = [sample(), sample(1)], playback: PlaybackMode = 'once', sampleRate = 1) => {
  const animation = new TransformAnimation()
  const tracks = Object.fromEntries(
    (['translation', 'rotation', 'scale'] as const).map((channel) => [
      channel,
      samples.map((pose, index) => ({ time: index / sampleRate, value: pose[channel] }))
    ])
  ) as TransformTracks

  Object.assign(animation, { isAutoplayEnabled: true, duration: (samples.length - 1) / sampleRate, playback, tracks })

  return animation
}

const close = (actual: ArrayLike<number>, expected: number[], tolerance = 1e-5) => {
  expected.forEach((value, index) => expect(actual[index]).to.be.closeTo(value, tolerance))
}

describe('Baked transform animation', () => {
  it('interpolates TRS relative to placement with shortest-path quaternion slerp', () => {
    const entity = new Entity()

    entity.translation.set([4, 0, 0])
    entity.rotation.set(Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 2))
    entity.scale.set([2, 3, 4])

    const turn = Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 2)

    for (let index = 0; index < 4; index++) {
      turn[index] *= -1
    }

    const animation = createClip([sample(), sample(2, turn, [2, 2, 2])])

    entity.components.motion = animation

    entity.animationMixer!.applyPose(entity, 0.5)
    close(entity.translation, [4, 0, -1])
    close(entity.scale, [3, 4.5, 6])
    close(entity.rotation, Array.from(Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI * 0.75)))
    entity.animationMixer!.applyPose(entity, 5)
    close(entity.translation, [4, 0, -2])
    expect(entity.animationMixer!.animations.motion.time).to.equal(1)
  })
  it('advances with or without physics, wraps loops and resets descendants', () => {
    const scene = new Scene(),
      entity = new Entity(),
      child = new Entity()
    const animation = createClip([sample(), sample(1), sample()], 'loop', 2)

    entity.components.motion = animation
    child.translation.x = 2
    child.components.camera = new Camera()
    child.components.light = new Light()
    child.components.reflector = new Reflector()
    entity.children.child = child
    scene.entities.root = entity
    scene.fixedTimeStep = 0.25

    scene.captureSimulationState()
    scene.update(0.5)
    expect(entity.animationMixer!.animations.motion.time).to.equal(0.5)
    close(child.worldTranslation, [3, 0, 0])
    close((child.components.light as Light).translation, [3, 0, 0])
    scene.update(0.25, false)
    expect(entity.animationMixer!.animations.motion.time).to.equal(0.75)
    scene.update(0.25)
    expect(entity.animationMixer!.animations.motion.time).to.equal(0)
    close(entity.translation, [0, 0, 0])
    scene.update(0.25)
    scene.resetSimulation()
    expect(entity.animationMixer!.animations.motion.time).to.equal(0)
    close(entity.translation, [0, 0, 0])
    close(child.worldTranslation, [2, 0, 0])
  })
  it('instantiates independent clips and applies referenced root placement overrides', async () => {
    const asset = { components: { motion: createClip().serialize() } }
    const loader = new EntityLoader(undefined, async () => asset)
    const scene = await loader.loadSceneData(
      {
        entities: {
          first: { entity: './moving.entity.json', translation: [10, 0, 0] },
          second: {
            entity: './moving.entity.json',
            translation: [-10, 0, 0],
            rotation: Array.from(Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 2))
          }
        }
      },
      'https://example.test/scene.json'
    )

    scene.update(1 / 60)
    close(scene.entities.first.translation, [10 + 1 / 60, 0, 0])
    close(scene.entities.second.translation, [-10, 0, -1 / 60])

    const firstAnimation = scene.entities.first.components.motion as TransformAnimation
    const secondAnimation = scene.entities.second.components.motion as TransformAnimation

    scene.entities.first.animationMixer!.reset()
    expect(scene.entities.second.animationMixer!.animations.motion.time).to.be.closeTo(1 / 60, 1e-9)
    expect(firstAnimation.tracks).not.to.equal(secondAnimation.tracks)

    const serialized = firstAnimation.serialize() as any

    expect(serialized).not.to.have.property('time')
    expect(serialized).not.to.have.property('base')
  })
  it('rejects old documents instead of inferring metadata or converting samples', async () => {
    const definition = createClip().serialize() as any

    for (const data of [
      { ...definition, schemaVersion: undefined },
      { ...definition, playback: undefined },
      { ...definition, playback: 'invalid' },
      { ...definition, playback: false },
      { ...definition, playback: undefined, isLooping: true },
      { ...definition, isLooping: false },
      { ...definition, schemaVersion: 1 },
      { ...definition, isAutoplayEnabled: undefined },
      { ...definition, samples: [sample(), sample(1)], sampleRate: 1 }
    ]) {
      let error: unknown

      try {
        await TransformAnimation.deserialize(data)
      } catch (caughtError) {
        error = caughtError
      }

      expect(error).to.be.instanceOf(Error)
    }
  })
  it('reaches exact kinematic poses and computes contact velocity about an offset collider center', () => {
    const scene = new Scene(),
      entity = new Entity(),
      body = new Body()

    body.motionType = 'kinematic'
    body.volume = new Cuboid({ origin: new Vector3([2, 0, 0]) })
    entity.components.body = body
    entity.components.motion = createClip([
      sample(),
      sample(3, Quaternion.setFromAxisAngle(Vector3.createUp(), Math.PI / 2))
    ])
    scene.entities.platform = entity
    scene.fixedTimeStep = 0.5

    scene.captureSimulationState()
    scene.update(0.5)
    close(entity.translation, [1.5, 0, 0])
    close(body.volume.center, [1.5 + Math.SQRT2, 0, -Math.SQRT2])
    close(body.linearVelocity, [(1.5 + Math.SQRT2 - 2) * 2, 0, -Math.SQRT2 * 2])
    close(body.angularVelocity, [0, Math.PI / 2, 0])
    scene.update(0.5)
    close(entity.translation, [3, 0, 0])
    close(body.volume.center, [3, 0, -2])
    scene.update(0.5)
    close(body.linearVelocity, [0, 0, 0])
    close(body.angularVelocity, [0, 0, 0])
    scene.resetSimulation()
    close(entity.translation, [0, 0, 0])
    close(body.volume.center, [2, 0, 0])
  })
  it('wakes and carries a sleeping passenger when a baked platform begins moving', () => {
    const scene = new Scene(),
      platform = new Entity(),
      passenger = new Entity()
    const support = new Body(),
      rider = new Body()

    support.motionType = 'kinematic'
    support.volume = new Cuboid({ extents: new Vector3([3, 0.25, 3]) })
    support.friction = rider.friction = 1
    rider.volume = new Cuboid({ extents: new Vector3([0.5, 0.5, 0.5]) })
    passenger.translation.y = 0.75
    platform.components.body = support
    passenger.components.body = rider
    scene.entities.platform = platform
    scene.entities.passenger = passenger

    for (let index = 0; index < 180; index++) {
      scene.update(1 / 60)
    }

    expect(rider.isSleeping).to.equal(true)

    platform.components.motion = createClip([sample(), sample(0.5)])

    scene.captureSimulationState()
    scene.update(1 / 60)
    expect(rider.isSleeping).to.equal(false)

    for (let index = 0; index < 59; index++) {
      scene.update(1 / 60)
    }

    expect(passenger.translation.x).to.be.greaterThan(0.3)
    expect(passenger.translation.y).to.be.closeTo(0.75, 0.04)
  })
  it('overrides playback per instance without changing serialized defaults and loops nonclosing motion', async () => {
    const animation = createClip()
    const entity = new Entity()
    const otherAnimation = await TransformAnimation.deserialize(animation.serialize())

    entity.components.motion = animation

    entity.animationMixer!.setPlaybackMode('motion', 'loop')
    animation.validate()
    entity.animationMixer!.applyPose(entity, 1.25)
    expect(entity.animationMixer!.animations.motion.time).to.equal(0.25)
    close(entity.translation, [0.25, 0, 0])
    entity.animationMixer!.setPlaybackMode('motion', 'once')
    expect(entity.animationMixer!.animations.motion.time).to.equal(0.25)
    entity.animationMixer!.applyPose(entity, 2)
    close(entity.translation, [1, 0, 0])
    entity.animationMixer!.setPlaybackMode('motion', 'loop')
    entity.animationMixer!.applyPose(entity, 0.5)
    expect(entity.animationMixer!.animations.motion.time).to.equal(0.5)
    entity.animationMixer!.stop()
    entity.animationMixer!.applyPose(entity, 2)
    close(entity.translation, [0, 0, 0])
    entity.animationMixer!.play('motion')
    entity.animationMixer!.applyPose(entity, 0.25)
    close(entity.translation, [0.25, 0, 0])
    expect(otherAnimation.playback).to.equal('once')
    expect(animation.serialize()).to.deep.equal(otherAnimation.serialize())
    expect(() => entity.animationMixer!.setPlaybackMode('motion', 'invalid' as any)).to.throw('playback mode')
  })
  it('previews timeline scrubbing without simulation, pauses and resumes at the chosen speed', () => {
    const scene = new Scene()
    const entity = new Entity()
    const animation = createClip()

    entity.components.motion = animation
    scene.entities.Root = entity

    scene.captureSimulationState()

    const serialized = animation.serialize()

    entity.animationMixer!.seekProgress(0.75)
    scene.previewAnimations([entity])
    close(entity.translation, [0.75, 0, 0])
    scene.update(0.25)
    close(entity.translation, [0.75, 0, 0])
    entity.animationMixer!.setSpeed(2)
    entity.animationMixer!.resume()
    entity.animationMixer!.applyPose(entity, 0.125)
    close(entity.translation, [1, 0, 0])
    entity.animationMixer!.stop()
    scene.previewAnimations([entity])
    close(entity.translation, [0, 0, 0])
    expect(animation.serialize()).to.deep.equal(serialized)
    expect(() => entity.animationMixer!.seekProgress(-1)).to.throw('progress')
    expect(() => entity.animationMixer!.setSpeed(Infinity)).to.throw('speed')
  })
  it('rejects invalid clips, duplicate tracks, dynamic animated bodies and changing body scale', () => {
    expect(() => createClip([sample(), sample(1)], 'once', 0).validate()).to.throw('duration')

    const invalidTimes = createClip()

    invalidTimes.tracks.translation![1].time = 0

    expect(() => invalidTimes.validate()).to.throw('keyframe')
    expect(() => createClip([sample(), sample(0, Quaternion.createIdentity(), [-1, 1, 1])]).validate()).to.throw(
      'scale'
    )

    const entity = new Entity(),
      body = new Body()

    body.volume = new Sphere()
    entity.components.body = body
    entity.components.motion = createClip()

    expect(() => entity.validateHierarchy()).to.throw('kinematic')

    body.motionType = 'kinematic'
    entity.components.motion = createClip([sample(), sample(1, Quaternion.createIdentity(), [2, 1, 1])])

    expect(() => entity.validateHierarchy()).to.throw('scale')

    entity.components.other = createClip()
    entity.components.motion = createClip()

    expect(() => entity.validateHierarchy()).not.to.throw()
  })
})
